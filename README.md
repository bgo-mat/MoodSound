# MoodSound

## What is MoodSound?

**MoodSound** is an experimental mobile app that lets you capture the feeling of a moment using your smartphone’s sensors (camera, microphone, accelerometer, GPS speed and coordinates, weather, local time via public APIs, and your own declared mood).  
These data are sent to several AI models (video, audio, and text analysis) which return, in seconds, a list of **5 tracks personalized to your captured instant**, directly accessible on Spotify.

## Tech Stack

- **React Native** (Expo)
- **TypeScript**
- **expo-av** (audio recording)
- **expo-sensors** (accelerometer)
- **expo-location** (GPS)
- **expo-camera** (photo/video)
- **Public APIs** (weather, time)
- **Custom backend Python Django API** (call to AI models OpenAI)
- **Spotify API** (for music results)

---

## 🧑‍💻 Getting Started (local setup)

### Clone the repository

    git clone https://github.com/your-username/MoodSound.git
    cd /MoodSound/frontend

### Install dependencies

    npm install

### Start expo app

    npx expo start

### Go to /Moodsound/backend and exec : 

    docker compose up -d


You have to add OpenAI API Key in .env file

