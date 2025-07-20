import base64
from dataclasses import dataclass
from typing import List, Dict

import cv2
from openai import OpenAI
from django.conf import settings


@dataclass
class FrameResult:
    index: int
    description: str


number_of_frame = 3


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
        success, buffer = cv2.imencode(".jpg", frame)
        if success:
            images.append(buffer)
        else:
            print("[ERROR] Frame encoding failed", flush=True)
    cap.release()
    return [img.tobytes() for img in images]


def video_analyzer(
    video_path: str, frame_count: int = number_of_frame
) -> Dict[str, object]:
    client = OpenAI(
        api_key=settings.OPENAI_API_KEY,
    )

    images = _extract_frames(video_path, frame_count)
    frames: List[FrameResult] = []
    for idx, img_bytes in enumerate(images):
        b64 = base64.b64encode(img_bytes).decode()

        prompt = (
            "Décris le mood général et l'environnement visible sur cette image en 150 caractères max. "
            " Reste factuel: évite les détails superflus ou l’invention."
            "Ignore le flou, il vient de la vidéo. Ne brode pas: sois factuel. "
            "Précise le type de lieu si possible (ex : chambre, extérieur, métro, fête…)."
        )

        try:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": prompt},
                            {
                                "type": "input_image",
                                "image_url": f"data:image/png;base64,{b64}",
                            },
                        ],
                    }
                ],
            )
            desc = response.output[0].content[0].text

            print("frame_analyzer ::::", desc)
        except Exception as e:
            desc = "[ERROR] No response"
        frames.append(FrameResult(index=idx, description=desc))

    summary_prompt = (
        "Voici les descriptions successives d'images extraites d'une vidéo :\n"
        + "\n".join(f"- {f.description}" for f in frames)
        + "\nCondense et résume en 200 caractères maximum les émotions, "
        "l’attitude et surtout l’ambiance et le type d’environnement. Ne brode pas."
    )

    try:
        summary_resp = client.chat.completions.create(
            model="gpt-4o", messages=[{"role": "user", "content": summary_prompt}]
        )
        summary = summary_resp.choices[0].message.content
    except Exception as e:
        summary = "[ERROR] No summary"

    return summary
