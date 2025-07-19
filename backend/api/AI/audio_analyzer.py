import openai
from django.conf import settings

def audio_analyzer(audio_uri: str) -> dict:
    prompt = f"Analyze this audio file: {audio_uri} and return structured mood/emotion data."
    openai.api_key = settings.OPENAI_API_KEY
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an audio emotion analysis assistant."},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message["content"]
