import base64
from dataclasses import dataclass
from typing import List, Dict

import cv2
import openai
from django.conf import settings


@dataclass
class FrameResult:
    index: int
    description: str


def _extract_frames(video_path: str, frame_count: int) -> List[bytes]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total == 0:
        cap.release()
        raise ValueError("Video contains no frames")
    step = max(total // frame_count, 1)
    positions = [min(i * step, total - 1) for i in range(frame_count)]
    images = []
    for pos in positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
        ret, frame = cap.read()
        if not ret:
            continue
        _, buffer = cv2.imencode(".jpg", frame)
        images.append(buffer)
    cap.release()
    return [img.tobytes() for img in images]


def video_analyzer(video_path: str, frame_count: int = 5) -> Dict[str, object]:
    """Analyze a local video by sampling frames and querying OpenAI Vision."""
    images = _extract_frames(video_path, frame_count)
    frames: List[FrameResult] = []
    for idx, img_bytes in enumerate(images):
        b64 = base64.b64encode(img_bytes).decode()
        prompt = (
            "Décris l’émotion, la posture, le ou les sujets présents, l’ambiance "
            "générale de cette image issue d’une vidéo d’auto-évaluation."
        )
        content = [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": f"data:image/jpeg;base64,{b64}"},
        ]
        openai.api_key = settings.OPENAI_API_KEY
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
        )
        desc = response.choices[0].message["content"]
        frames.append(FrameResult(index=idx, description=desc))

    summary_prompt = (
        "Voici les descriptions successives d'images extraites d'une vidéo :\n"
        + "\n".join(f"- {f.description}" for f in frames)
        + "\nRésume les émotions, attitudes et l'ambiance globale."
    )
    summary_resp = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": summary_prompt}],
    )
    summary = summary_resp.choices[0].message["content"]

    return {
        "frames": [f.__dict__ for f in frames],
        "summary": summary,
    }
