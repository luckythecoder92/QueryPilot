from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
<<<<<<< HEAD
    llm_provider: str = os.getenv('QP_LLM_PROVIDER', 'auto').lower()
=======
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718
    online_model: str = os.getenv('QP_ONLINE_MODEL', 'qwen2.5-coder:7b')
    offline_model: str = os.getenv('QP_OFFLINE_MODEL', 'gemma4')
    model_mode: str = os.getenv('QP_MODEL_MODE', 'auto').lower()
    connectivity_timeout_s: float = float(os.getenv('QP_CONNECTIVITY_TIMEOUT_S', '1.5'))
<<<<<<< HEAD
    cors_origins: tuple[str, ...] = tuple(x.strip() for x in os.getenv('QP_CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174').split(',') if x.strip())
    ollama_url: str = os.getenv('OLLAMA_URL', 'http://127.0.0.1:11434')
    max_repairs: int = int(os.getenv('QP_MAX_REPAIRS', '1'))
    grok_api_key: str = (os.getenv('XAI_API_KEY') or os.getenv('GROK_API_KEY') or '').strip()
    grok_base_url: str = (os.getenv('XAI_BASE_URL') or os.getenv('GROK_API_URL') or 'https://api.x.ai/v1').rstrip('/')
    grok_model: str = os.getenv('XAI_MODEL') or os.getenv('GROK_MODEL') or 'grok-4.7'
    grok_timeout_s: float = float(os.getenv('XAI_TIMEOUT_S', '120'))
=======
    cors_origins: tuple[str, ...] = tuple(x.strip() for x in os.getenv('QP_CORS_ORIGINS', 'http://localhost:5173').split(',') if x.strip())
    ollama_url: str = os.getenv('OLLAMA_URL', 'http://127.0.0.1:11434')
    max_repairs: int = int(os.getenv('QP_MAX_REPAIRS', '1'))
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718

settings = Settings()
