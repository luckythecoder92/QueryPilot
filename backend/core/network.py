import socket, time
from .config import settings

class ConnectivityChecker:
    def __init__(self, ttl_s: float = 10.0): self.ttl_s, self._value, self._at = ttl_s, False, 0.0
    def online(self) -> bool:
        now = time.monotonic()
        if now - self._at < self.ttl_s: return self._value
        try:
            with socket.create_connection(('1.1.1.1', 53), settings.connectivity_timeout_s): result = True
        except OSError: result = False
        self._value, self._at = result, now
        return result

connectivity = ConnectivityChecker()
