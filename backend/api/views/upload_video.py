import os
from uuid import uuid4
from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class UploadVideoAPIView(APIView):
    """Receive a video file and store it locally."""

    def post(self, request, *args, **kwargs):
        video_file = request.FILES.get("file")
        if not video_file:
            return Response({"error": "missing file"}, status=status.HTTP_400_BAD_REQUEST)
        if not video_file.content_type or not video_file.content_type.startswith("video/"):
            return Response({"error": "invalid file type"}, status=status.HTTP_400_BAD_REQUEST)

        ext = Path(video_file.name).suffix or ".mp4"
        filename = f"{uuid4().hex}{ext}"

        base_dir = Path(__file__).resolve().parents[2]
        videos_dir = base_dir / "app" / "assets" / "videos"
        os.makedirs(videos_dir, exist_ok=True)
        file_path = videos_dir / filename

        with open(file_path, "wb") as dest:
            for chunk in video_file.chunks():
                dest.write(chunk)

        rel_path = os.path.join("app", "assets", "videos", filename)
        return Response({"video_path": rel_path})
