import os
import uuid
from pathlib import Path

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class UploadAudioAPIView(APIView):
    """Receive an audio file and store it locally."""

    def post(self, request, *args, **kwargs):
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"error": "missing file"}, status=status.HTTP_400_BAD_REQUEST)

        print("UPLOAD:", uploaded.content_type, uploaded.name, flush=True)
        allowed_types = {
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/x-m4a",
            "audio/m4a",
            "audio/mp4",
        }
        if uploaded.content_type not in allowed_types:
            return Response({"error": "invalid file type"}, status=status.HTTP_400_BAD_REQUEST)

        audio_dir = Path(settings.BASE_DIR) / "app" / "assets" / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)

        ext = Path(uploaded.name).suffix or ""
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = audio_dir / filename

        with open(file_path, "wb") as dest:
            for chunk in uploaded.chunks():
                dest.write(chunk)

        relative_path = os.path.join("app", "assets", "audio", filename)
        print(str(relative_path),flush=True)
        return Response({"audio_path": str(relative_path)})

