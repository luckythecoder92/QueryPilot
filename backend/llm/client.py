from __future__ import annotations
from dataclasses import dataclass
import requests
from core.config import settings
from core.network import connectivity

class LLMUnavailable(RuntimeError): pass

@dataclass
class LLMResult:
    text: str
    model_used: str | None
    mode: str

class OllamaClient:
    provider = 'ollama'

    def __init__(self, checker=connectivity, http=requests): self.checker, self.http = checker, http
    def _installed(self) -> set[str]:
        try:
            r = self.http.get(f'{settings.ollama_url}/api/tags', timeout=2); r.raise_for_status()
            return {m.get('name', '') for m in r.json().get('models', [])}
        except Exception: return set()
    def choose(self) -> tuple[str, str]:
        forced = settings.model_mode
        online = self.checker.online()
        mode = forced if forced in ('online','offline') else ('online' if online else 'offline')
        preferred = settings.online_model if mode == 'online' else settings.offline_model
        alternate = settings.offline_model if mode == 'online' else settings.online_model
        installed = self._installed()
        if preferred in installed: return preferred, mode
        if alternate in installed: return alternate, 'offline' if mode == 'online' else 'online'
        raise LLMUnavailable('Neither configured Ollama model is installed. Run `ollama pull` for a configured model.')
    def ask(self, prompt: str, system: str) -> LLMResult:
        model, mode = self.choose()
        try:
            r = self.http.post(f'{settings.ollama_url}/api/generate', json={'model':model,'system':system,'prompt':prompt,'stream':False,'format':'json','options':{'temperature':0}}, timeout=90)
            r.raise_for_status(); return LLMResult(r.json().get('response',''), model, mode)
        except Exception as e: raise LLMUnavailable(str(e)) from e


class GrokClient:
    provider = 'grok'

    def __init__(self, http=requests): self.http = http

    def choose(self) -> tuple[str, str]:
        if not settings.grok_api_key:
            raise LLMUnavailable('Grok is not configured. Add XAI_API_KEY to backend/.env.')
        return settings.grok_model, 'online'

    @staticmethod
    def _response_text(payload: dict) -> str:
        direct = payload.get('output_text')
        if isinstance(direct, str) and direct.strip(): return direct
        for item in payload.get('output', []):
            if item.get('type') != 'message': continue
            for content in item.get('content', []):
                if content.get('type') in ('output_text', 'text') and isinstance(content.get('text'), str):
                    return content['text']
        raise LLMUnavailable('Grok returned no text output.')

    @staticmethod
    def _error_detail(response) -> str:
        try:
            body = response.json()
            detail = body.get('error', body) if isinstance(body, dict) else {}
            if isinstance(detail, dict) and detail.get('message'): return str(detail['message'])
            if isinstance(detail, str) and detail: return detail
        except Exception: pass
        if getattr(response, 'text', ''): return str(response.text)[:300]
        return response.reason or f'HTTP {response.status_code}'

    def ask(self, prompt: str, system: str) -> LLMResult:
        model, mode = self.choose()
        payload = {
            'model': model,
            'store': False,
            'input': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt},
            ],
            'temperature': 0,
            'text': {
                'format': {
                    'type': 'json_schema',
                    'name': 'querypilot_sql_response',
                    'strict': True,
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'answer': {'type': 'string'},
                            'sql': {'type': ['string', 'null']},
                            'chart': {'type': ['object', 'null'], 'additionalProperties': True},
                        },
                        'required': ['answer', 'sql', 'chart'],
                        'additionalProperties': False,
                    },
                },
            },
        }
        try:
            response = self.http.post(
                f'{settings.grok_base_url}/responses',
                headers={'Authorization': f'Bearer {settings.grok_api_key}', 'Content-Type': 'application/json'},
                json=payload,
                timeout=settings.grok_timeout_s,
            )
            if not response.ok: raise LLMUnavailable(f'Grok request failed: {self._error_detail(response)}')
            return LLMResult(self._response_text(response.json()), model, mode)
        except LLMUnavailable: raise
        except Exception as e: raise LLMUnavailable(f'Grok request failed: {e}') from e


def create_llm_client(http=requests):
    provider = settings.llm_provider
    if provider == 'grok': return GrokClient(http=http)
    if provider == 'ollama': return OllamaClient(http=http)
    return GrokClient(http=http) if settings.grok_api_key else OllamaClient(http=http)

class ScriptedLLM:
    provider = 'scripted'

    def __init__(self, response: str = '{}', model_used='scripted', mode='offline'): self.response, self.model_used, self.mode = response, model_used, mode
    def ask(self, prompt: str, system: str) -> LLMResult: return LLMResult(self.response, self.model_used, self.mode)
