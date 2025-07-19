import json
from rest_framework import viewsets, serializers
from rest_framework.response import Response

from api.serializer import TestMoodSerializer


class TestMoodViewSet(viewsets.ModelViewSet):

    serializer_class = TestMoodSerializer
    queryset = []
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            print(data, flush=True)
        except Exception:
            return Response({"error": "invalid json"}, status=400)
        print(data, flush=True)
        return Response({"status": "received", "data": data})
