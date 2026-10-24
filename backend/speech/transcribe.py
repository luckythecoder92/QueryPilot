import tempfile
try:
    from faster_whisper import WhisperModel
except ImportError: WhisperModel = None
def transcribe(blob: bytes):
    if WhisperModel is None: raise RuntimeError('Voice transcription is unavailable: faster-whisper is not installed.')
    with tempfile.NamedTemporaryFile(suffix='.webm') as f:
        f.write(blob); f.flush(); segments, _ = WhisperModel('base').transcribe(f.name)
        return ' '.join(s.text for s in segments).strip()
