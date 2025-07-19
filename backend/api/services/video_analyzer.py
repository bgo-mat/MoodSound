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
    print(f"[DEBUG] Opening video: {video_path}", flush=True)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("[ERROR] Cannot open video file!", flush=True)
        raise ValueError(f"Cannot open video file: {video_path}")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"[DEBUG] Total frames: {total}", flush=True)
    if total == 0:
        cap.release()
        print("[ERROR] Video contains no frames", flush=True)
        raise ValueError("Video contains no frames")
    step = max(total // frame_count, 1)
    print(f"[DEBUG] Frame sampling step: {step}", flush=True)
    positions = [min(i * step, total - 1) for i in range(frame_count)]
    print(f"[DEBUG] Frame positions: {positions}", flush=True)
    images = []
    for pos in positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
        ret, frame = cap.read()
        print(f"[DEBUG] Reading frame at pos {pos}: ret={ret}", flush=True)
        if not ret:
            continue
        success, buffer = cv2.imencode(".jpg", frame)
        print(f"[DEBUG] Frame encoding: success={success}", flush=True)
        if success:
            images.append(buffer)
        else:
            print("[ERROR] Frame encoding failed", flush=True)
    cap.release()
    print(f"[DEBUG] Total extracted images: {len(images)}", flush=True)
    return [img.tobytes() for img in images]

def video_analyzer(video_path: str, frame_count: int = 5) -> Dict[str, object]:
    """Analyze a local video by sampling frames and querying OpenAI Vision."""
    print("[DEBUG] video_analyzer called", flush=True)
    images = _extract_frames(video_path, frame_count)
    print(f"[DEBUG] Got {len(images)} images from video", flush=True)
    frames: List[FrameResult] = []
    for idx, img_bytes in enumerate(images):
        print(f"[DEBUG] Analyzing frame {idx}", flush=True)
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
        print(f"[DEBUG] Calling OpenAI Vision for frame {idx}", flush=True)
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": content}],
            )
            print(f"[DEBUG] OpenAI response for frame {idx}: {response}", flush=True)
            desc = response.choices[0].message["content"]
        except Exception as e:
            print(f"[ERROR] OpenAI Vision failed for frame {idx}: {e}", flush=True)
            desc = "[ERROR] No response"
        frames.append(FrameResult(index=idx, description=desc))

    print("[DEBUG] Calling OpenAI for summary", flush=True)
    summary_prompt = (
            "Voici les descriptions successives d'images extraites d'une vidéo :\n"
            + "\n".join(f"- {f.description}" for f in frames)
            + "\nRésume les émotions, attitudes et l'ambiance globale."
    )
    try:
        summary_resp = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": summary_prompt}],
        )
        print(f"[DEBUG] OpenAI response for summary: {summary_resp}", flush=True)
        summary = summary_resp.choices[0].message["content"]
    except Exception as e:
        print(f"[ERROR] OpenAI Vision summary failed: {e}", flush=True)
        summary = "[ERROR] No summary"

    result = {
        "frames": [f.__dict__ for f in frames],
        "summary": summary,
    }
    print(f"[DEBUG] Final video_analyzer result: {result}", flush=True)
    return result
