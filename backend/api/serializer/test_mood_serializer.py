from rest_framework import serializers

class ActivitySerializer(serializers.Serializer):
    activityLevel = serializers.ChoiceField(choices=['low', 'medium', 'high'])
    speedLevel = serializers.ChoiceField(choices=['still', 'walk', 'run', 'drive'])
    country = serializers.CharField(allow_blank=True, allow_null=True)
    region = serializers.CharField(allow_blank=True, allow_null=True)

class TestMoodSerializer(serializers.Serializer):
    activity = ActivitySerializer(required=True)
    audioUri = serializers.CharField(allow_blank=True, allow_null=True)
    videoUri = serializers.CharField(allow_blank=True, allow_null=True)
    energy = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=3)
    happiness = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=5)
