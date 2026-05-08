import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)


@dataclass(frozen=True)
class Settings:
    mongodb_uri: str
    database_name: str
    jwt_secret: str
    gemini_api_key: str
    client_url: str


settings = Settings(
    mongodb_uri=os.getenv("MONGODB_URI", ""),
    database_name=os.getenv("DATABASE_NAME", "beachplease"),
    jwt_secret=os.getenv("JWT_SECRET", ""),
    gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
    client_url=os.getenv("CLIENT_URL", "http://localhost:5173"),
)
