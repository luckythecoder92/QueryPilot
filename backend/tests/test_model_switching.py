import unittest
from unittest.mock import patch
from llm.client import OllamaClient, LLMUnavailable

class Checker:
    def __init__(self, value): self.value=value
    def online(self): return self.value
class HTTP:
    def __init__(self,names): self.names=names
    def get(self,*a,**k):
        class R:
            def __init__(self,n): self.n=n
            def raise_for_status(self): pass
            def json(self): return {'models':[{'name':x} for x in self.n]}
        return R(self.names)

class Models(unittest.TestCase):
    @patch('llm.client.settings')
    def test_online_qwen(self, s):
        s.online_model='qwen';s.offline_model='gemma';s.model_mode='auto';s.ollama_url='x'
        self.assertEqual(OllamaClient(Checker(True),HTTP(['qwen','gemma'])).choose(),('qwen','online'))
    @patch('llm.client.settings')
    def test_offline_gemma(self, s):
        s.online_model='qwen';s.offline_model='gemma';s.model_mode='auto';s.ollama_url='x'
        self.assertEqual(OllamaClient(Checker(False),HTTP(['qwen','gemma'])).choose(),('gemma','offline'))
    @patch('llm.client.settings')
    def test_missing_preferred_falls_back(self, s):
        s.online_model='qwen';s.offline_model='gemma';s.model_mode='auto';s.ollama_url='x'
        self.assertEqual(OllamaClient(Checker(True),HTTP(['gemma'])).choose(),('gemma','offline'))
    @patch('llm.client.settings')
    def test_both_missing_is_clear(self, s):
        s.online_model='qwen';s.offline_model='gemma';s.model_mode='auto';s.ollama_url='x'
        with self.assertRaises(LLMUnavailable): OllamaClient(Checker(True),HTTP([])).choose()
if __name__ == '__main__': unittest.main()
