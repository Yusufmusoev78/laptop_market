from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError
from src.core.config import settings
from src.core.ws_manager import manager
from src.db.session import async_session_maker
from src.repositories.user import user_repo

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)) -> None:
    """Live notification socket. Browsers can't set the Authorization header on
    the handshake, so the JWT is passed as a query param instead."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        await websocket.close(code=1008)
        return

    if email is None:
        await websocket.close(code=1008)
        return

    async with async_session_maker() as db:
        user = await user_repo.get_by_email(db, email=email)

    if user is None:
        await websocket.close(code=1008)
        return

    await manager.connect(user.id, user.is_admin, user.role == "usto", websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id, websocket)
