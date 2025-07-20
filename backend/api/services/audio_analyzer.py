import json
from pathlib import Path

import openai
from django.conf import settings


def audio_analyzer(audio_path: str) -> dict:
    path = Path(audio_path)
    if not path.is_file():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    analysis_instructions = (
        "Analyse la transcription suivante pour détecter : le ton général, "
        "l'émotion de la voix, l'énergie, les hésitations ou les moments de silence. "
        "Réponds uniquement avec un objet JSON ayant les clés 'ton', 'emotion', "
        "'energie', 'hesitations' et 'resume'."
        "Donne-moi la transcription, puis décris l’ambiance sonore: y a-t-il du bruit, "
        "de la musique, des voix en fond? Peut-on deviner le lieu: métro, extérieur, intérieur, etc. ?"
        "Tu me donnera une réponse qui ne dépasse pas les 200 character"
    )

    with open(audio_path, "rb") as audio_file:
        try:
            call = client.audio.transcriptions.create(
                model="gpt-4o-transcribe",
                file=audio_file,
                response_format="json",
                prompt=analysis_instructions,
            )
            result = call.text
        except Exception as e:
            result = "[ERROR] No summary"

    return result
