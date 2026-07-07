from abc import ABC, abstractmethod
from typing import List, Dict, Any


class AIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
        pass

    @abstractmethod
    async def chat_stream(self, messages: List[Dict[str, str]], temperature: float = 0.7):
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        pass
