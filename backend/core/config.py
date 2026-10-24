from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
    online_model: str = os.getenv('QP_ONLINE_MODEL', 'qwen2.5-coder:7b')
    offline_model: str = os.getenv('QP_OFFLINE_MODEL', 'gemma4')
    model_mode: str = os.getenv('QP_MODEL_MODE', 'auto').lower()
    connectivity_timeout_s: float = float(os.getenv('QP_CONNECTIVITY_TIMEOUT_S', '1.5'))
    cors_origins: tuple[str, ...] = tuple(x.strip() for x in os.getenv('QP_CORS_ORIGINS', 'http://localhost:5173').split(',') if x.strip())
    ollama_url: str = os.getenv('OLLAMA_URL', 'http://127.0.0.1:11434')
    max_repairs: int = int(os.getenv('QP_MAX_REPAIRS', '1'))

settings = Settings()
