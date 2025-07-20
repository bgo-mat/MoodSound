import os
from pathlib import Path

os.getenv("")
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = "django-insecure-ky2$#+js%vftp2=pd5vx18m^ejg=7)^b#yql!f17c&da!q=%nr"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI", "myapp://callback")
DEBUG = True
IN_PROD = os.getenv("IN_PROD", "False") == "True"
ALLOWED_HOSTS = ["*"]

CORS_ORIGIN_ALLOW_ALL = not IN_PROD
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = (
    [
        "http://localhost:4200",
        os.getenv("FRONTEND_URL"),
    ]
    if IN_PROD
    else []
)

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:4200",
    os.getenv("FRONTEND_URL", "http://localhost:8100"),
]

if IN_PROD:
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    COOKIE_SAMESITE = "None"
    SECURE_SSL_REDIRECT = True
else:
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SECURE = False
    COOKIE_SAMESITE = "Lax"
    SECURE_SSL_REDIRECT = False

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "drf_spectacular",
    "drf_spectacular_sidecar",
    "corsheaders",
    "django_filters",
    "silk",
    "rest_framework_simplejwt",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "silk.middleware.SilkyMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", ""),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST"),
        "PORT": os.getenv("POSTGRES_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
