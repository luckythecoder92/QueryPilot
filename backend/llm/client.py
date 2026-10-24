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

class ScriptedLLM:
    def __init__(self, response: str = '{}', model_used='scripted', mode='offline'): self.response, self.model_used, self.mode = response, model_used, mode
    def ask(self, prompt: str, system: str) -> LLMResult: return LLMResult(self.response, self.model_used, self.mode)
