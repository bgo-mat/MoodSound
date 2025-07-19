import json
from rest_framework import viewsets, serializers
from rest_framework.response import Response

class DummySerializer(serializers.Serializer):
    pass

class TestMoodViewSet(viewsets.ModelViewSet):
    """Temporary endpoint to receive mood data from the mobile app."""

    serializer_class = DummySerializer
    queryset = []
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except Exception:
            return Response({"error": "invalid json"}, status=400)
        print(data, flush=True)
        return Response({"status": "received", "data": data})
