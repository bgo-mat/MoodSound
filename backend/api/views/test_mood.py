import json
from rest_framework import viewsets
from rest_framework.response import Response
from django.conf import settings

from api.serializer import TestMoodSerializer
from api.AI.video_analyzer import video_analyzer as analyze_video
from api.AI.audio_analyzer import audio_analyzer as analyze_audio
from api.AI.final_ai_call import final_ai_call as final_gpt_report

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

        # Appels aux IA
        video_uri = data.get("videoUri")
        audio_uri = data.get("audioUri")
        video_result = analyze_video(video_uri) if video_uri else None
        audio_result = analyze_audio(audio_uri) if audio_uri else None

        # Synthèse finale
        final_result = final_gpt_report(data, video_result, audio_result)

        return Response({
            "status": "received",
            "data": data,
            "video_analysis": video_result,
            "audio_analysis": audio_result,
            "final_gpt_report": final_result
        })
