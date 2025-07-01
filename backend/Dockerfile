FROM python:3.12.6-slim

WORKDIR /app

COPY requirements.txt /requirements.txt

RUN apt update && apt -y install git zsh curl ffmpeg netcat-openbsd

# Installation d'Oh My Zsh (Optionnel, peut être supprimé si non nécessaire)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

RUN pip install --no-cache-dir -r /requirements.txt

COPY . /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
