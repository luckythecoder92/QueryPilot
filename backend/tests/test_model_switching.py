import unittest
from unittest.mock import patch
<<<<<<< HEAD
from llm.client import GrokClient, OllamaClient, LLMUnavailable
=======
from llm.client import OllamaClient, LLMUnavailable
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718

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

<<<<<<< HEAD
class GrokHTTP:
    def __init__(self): self.calls=[]
    def post(self, *args, **kwargs):
        self.calls.append((args, kwargs))
        class R:
            ok = True
            reason = 'OK'
            status_code = 200
            def json(self): return {'output_text':'{"answer":"ok","sql":null,"chart":null}'}
        return R()

=======
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718
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
<<<<<<< HEAD

    @patch('llm.client.settings')
    def test_grok_uses_responses_api_and_structured_output(self, s):
        s.grok_api_key='test-key';s.grok_base_url='https://api.x.ai/v1';s.grok_model='grok-test';s.grok_timeout_s=30
        http = GrokHTTP()
        result = GrokClient(http).ask('question', 'system')
        self.assertEqual(result.text, '{"answer":"ok","sql":null,"chart":null}')
        self.assertEqual((result.model_used, result.mode), ('grok-test', 'online'))
        self.assertEqual(http.calls[0][0][0], 'https://api.x.ai/v1/responses')
        self.assertEqual(http.calls[0][1]['headers']['Authorization'], 'Bearer test-key')
        self.assertFalse(http.calls[0][1]['json']['store'])
        self.assertEqual(http.calls[0][1]['json']['text']['format']['type'], 'json_schema')

    @patch('llm.client.settings')
    def test_grok_requires_api_key(self, s):
        s.grok_api_key='';s.grok_model='grok-test'
        with self.assertRaises(LLMUnavailable): GrokClient().choose()
=======
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718
if __name__ == '__main__': unittest.main()
