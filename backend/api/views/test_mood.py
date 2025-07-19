import json
import asyncio
from rest_framework import viewsets
from rest_framework.response import Response

from api.serializer import TestMoodSerializer
from api.AI.audio_analyzer import audio_analyzer
from api.AI.video_analyzer import video_analyzer

class TestMoodViewSet(viewsets.ModelViewSet):
    serializer_class = TestMoodSerializer
    queryset = []
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        try:
            data = request.data if isinstance(request.data, dict) else json.loads(request.body)
        except Exception:
            return Response({"error": "invalid json"}, status=400)
        # Optionnel : validateur DRF
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        audio_path = data.get("audio_backend_path") or data.get("audioUri")
        video_path = data.get("video_backend_path") or data.get("videoUri")

        async def run_analyzers():
            audio_task = (
                asyncio.to_thread(audio_analyzer, audio_path)
                if audio_path
                else asyncio.sleep(0, result=None)
            )
            video_task = (
                asyncio.to_thread(video_analyzer, video_path)
                if video_path
                else asyncio.sleep(0, result=None)
            )
            return await asyncio.gather(audio_task, video_task)

        audio_result, video_result = asyncio.run(run_analyzers())

        energy = data.get("energy")
        happiness = data.get("happiness")
        activity = data.get("activityData")
        environnement = data.get("environnementData")

        return Response({
            "audio_analysis": audio_result,
            "video_analysis": video_result,
            "energy": energy,
            "happiness": happiness,
            "activity": activity,
            "environnement": environnement,
        })
