import openai
from django.conf import settings

def final_ai_call(data: dict, video_analysis: dict, audio_analysis: dict) -> dict:
    prompt = (
        "Voici les données utilisateur (JSON) :\n"
        f"{json.dumps(data, ensure_ascii=False, indent=2)}\n\n"
        "Analyse vidéo (résumé IA) :\n"
        f"{video_analysis}\n\n"
        "Analyse audio (résumé IA) :\n"
        f"{audio_analysis}\n\n"
        "Fais une synthèse, en extraire un diagnostic ou un conseil personnalisé."
    )
    openai.api_key = settings.OPENAI_API_KEY
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Tu es un assistant bienveillant et expert en analyse comportementale."},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message["content"]
