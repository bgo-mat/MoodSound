from rest_framework import serializers

class WeatherSerializer(serializers.Serializer):
    hour = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    isDay = serializers.ChoiceField(choices=['day', 'night'], allow_null=True, required=False)
    temperature = serializers.FloatField(allow_null=True, required=False)
    weather = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    windDirection = serializers.FloatField(allow_null=True, required=False)
    windSpeed = serializers.FloatField(allow_null=True, required=False)

class EnvironnementSerializer(serializers.Serializer):
    country = serializers.CharField(allow_blank=True, allow_null=True)
    region = serializers.CharField(allow_blank=True, allow_null=True)
    weather = WeatherSerializer(required=False, allow_null=True)

class ActivitySerializer(serializers.Serializer):
    activityLevel = serializers.ChoiceField(choices=['low', 'medium', 'high'], allow_null=True)
    speedLevel = serializers.ChoiceField(choices=['still', 'walk', 'run', 'drive'], allow_null=True)
    country = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    region = serializers.CharField(allow_blank=True, allow_null=True, required=False)

class TestMoodSerializer(serializers.Serializer):
    activityData = ActivitySerializer(required=True)
    environnementData = EnvironnementSerializer(required=True)
    audioUri = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    videoUri = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    energy = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    happiness = serializers.CharField(allow_blank=True, allow_null=True, required=False)
