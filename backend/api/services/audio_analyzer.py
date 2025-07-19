import json
from pathlib import Path

import openai
from django.conf import settings


def audio_analyzer(audio_path: str) -> dict:

    path = Path(audio_path)
    if not path.is_file():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    with path.open("rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="text",
        )

    analysis_instructions = (
        "Analyse la transcription suivante pour détecter : le ton général, "
        "l'émotion de la voix, l'énergie, les hésitations ou les moments de silence. "
        "Réponds uniquement avec un objet JSON ayant les clés 'ton', 'emotion', "
        "'energie', 'hesitations' et 'resume'."
    )

    messages = [
        {"role": "system", "content": "Tu es un assistant d'analyse audio."},
        {
            "role": "user",
            "content": f"Transcription :\n{transcript}\n\n{analysis_instructions}",
        },
    ]

    chat = client.chat.completions.create(model="gpt-4o", messages=messages)
    content = chat.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"resume": content}
