from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self) -> None:
        self.connections: Dict[int, List[WebSocket]] = {}
        self.admin_ids: Set[int] = set()
        self.usto_ids: Set[int] = set()

    async def connect(self, user_id: int, is_admin: bool, is_usto: bool, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.setdefault(user_id, []).append(websocket)
        if is_admin:
            self.admin_ids.add(user_id)
        if is_usto:
            self.usto_ids.add(user_id)

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        sockets = self.connections.get(user_id, [])
        if websocket in sockets:
            sockets.remove(websocket)
        if not sockets:
            self.connections.pop(user_id, None)
            self.admin_ids.discard(user_id)
            self.usto_ids.discard(user_id)

    async def send_to_user(self, user_id: int, message: dict) -> None:
        for ws in self.connections.get(user_id, []):
            await ws.send_json(message)

    async def broadcast_to_admins(self, message: dict) -> None:
        for admin_id in list(self.admin_ids):
            await self.send_to_user(admin_id, message)

    async def broadcast_to_ustos(self, message: dict) -> None:
        for usto_id in list(self.usto_ids):
            await self.send_to_user(usto_id, message)

manager = ConnectionManager()
