import json
import time
from rest_framework import viewsets
from rest_framework.response import Response
from api.serializer import TestMoodSerializer
from api.services.audio_analyzer import audio_analyzer
from api.services.final_ai_call import final_ai_call
from api.services.video_analyzer import video_analyzer
from django.conf import settings

SPOTIFY_CLIENT = settings.SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET = settings.SPOTIFY_CLIENT_SECRET


class TestMoodViewSet(viewsets.ModelViewSet):
    serializer_class = TestMoodSerializer
    queryset = []
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        start = time.time()
        print(f"[TIMER][TestMoodViewSet.create] START at {start:.2f}", flush=True)
        try:
            data = (
                request.data
                if isinstance(request.data, dict)
                else json.loads(request.body)
            )
        except Exception:
            return Response({"error": "invalid json"}, status=400)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        audio_path = data.get("audioUrl") or data.get("audioUri")
        video_path = data.get("videoUrl") or data.get("videoUri")

        audio_result = audio_analyzer(audio_path) if audio_path else None
        video_result = video_analyzer(video_path) if video_path else None

        energy = data.get("energy")
        happiness = data.get("happiness")
        activity = data.get("activityData")
        environnement = data.get("environnementData")

        final_result = final_ai_call(
            audio_result, video_result, energy, happiness, activity, environnement
        )

        end = time.time()
        print(f"[TIMER][TestMoodViewSet.create] END at {end:.2f} (elapsed: {end-start:.2f}s)", flush=True)
        return Response({
            "musics": final_result,
            "client_token": SPOTIFY_CLIENT,
            "secret_token": SPOTIFY_CLIENT_SECRET
        })
