FROM python:3.12.6-slim

WORKDIR /app

COPY requirements.txt /requirements.txt

RUN apt update && apt -y install git zsh curl ffmpeg netcat-openbsd \
    build-essential python3-dev python3-pip \
    libglib2.0-0 libsm6 libxrender1 libxext6 libatlas-base-dev

# Installation d'Oh My Zsh (Optionnel)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

RUN pip install --no-cache-dir -r /requirements.txt

COPY . /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
