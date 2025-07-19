import openai
from django.conf import settings

def video_analyzer(video_uri: str) -> dict:
    # Ici, tu pourras downloader la vidéo ou traiter le lien si besoin
    # Ex: fetch video, encode, etc. À adapter selon ton flux.
    prompt = f"Analyze this video: {video_uri} and return structured information."
    openai.api_key = settings.OPENAI_API_KEY
    # Choix du modèle et prompt à adapter
    response = openai.ChatCompletion.create(
        model="gpt-4o",  # ou autre modèle, selon ton besoin
        messages=[
            {"role": "system", "content": "You are a video analysis assistant."},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message["content"]
