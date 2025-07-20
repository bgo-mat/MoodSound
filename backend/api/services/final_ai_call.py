import openai
from django.conf import settings
import json
import re


def final_ai_call(
    audio_result, video_result, energy, happiness, activity, environnement
):
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    prompt = (
        "Tu es un assistant qui recommande de la musique en fonction de l'ambiance générale d'une auto-évaluation.\n"
        "Voici les données que tu reçois :\n"
        "- Analyse audio : détection des sons de fond, type de lieu."
        " DATA : "
        + json.dumps(audio_result, ensure_ascii=False)
        + "\n"
        "- Analyse vidéo : description synthétique de l’environnement visuel, type de pièce ou de lieu, ambiance visuelle et éventuelle posture de l’utilisateur. "
        "DATA : "
        + json.dumps(video_result, ensure_ascii=False)
        + "\n"
        "- Énergie : niveau d’énergie ressenti"
        "DATA : "
        + str(energy)
        + "\n"
        "- Satisfaction (happiness) : humeur ou satisfaction exprimée"
        "DATA : "
        + str(happiness)
        + "\n"
        "- Activité : niveau d’activité physique mesuré, rythme et intensité."
        "DATA : "
        + json.dumps(activity, ensure_ascii=False)
        + "\n"
        "- Environnement : pays, région, météo, ambiance extérieure"
        "DATA : "
        + json.dumps(environnement, ensure_ascii=False)
        + "\n\n"
        "En tenant compte de tous ces éléments (son, image, ressenti, météo, contexte), propose-moi 5 musiques qui collent le mieux à l’ambiance globale. "
        'Donne uniquement la liste au format JSON array, sans texte autour, sans description : ["titre 1", "titre 2", "titre 3", "titre 4", "titre 5"]'
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
    )
    text = response.choices[0].message.content.strip()
    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
    except Exception:
        pass

    match = re.search(r"\[(.*?)\]", text, re.DOTALL)
    if match:
        arr_str = "[" + match.group(1) + "]"
        try:
            result = json.loads(arr_str)
            if isinstance(result, list):
                return result
        except Exception:
            pass

    return text
