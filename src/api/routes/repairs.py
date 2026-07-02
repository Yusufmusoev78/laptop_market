from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user
from src.schemas.repair import RepairCreate, RepairRead
from src.schemas.repair_message import RepairMessageCreate, RepairMessageRead
from src.services.repair import repair_service
from src.models.user import User
from src.core.exceptions import ForbiddenException

router = APIRouter()

@router.post("/", response_model=RepairRead, status_code=status.HTTP_201_CREATED)
async def create_repair_request(
    *,
    db: AsyncSession = Depends(get_db),
    obj_in: RepairCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new repair request associated with the logged-in client."""
    ticket = await repair_service.create(db, obj_in=obj_in, client_id=current_user.id)
    
    # Broadcast new ticket to all online users
    from src.core.ws_manager import manager
    await manager.broadcast({
        "type": "new_repair_ticket",
        "ticket": RepairRead.model_validate(ticket).model_dump()
    })
    
    return ticket

@router.get("/", response_model=List[RepairRead])
async def read_repair_requests(
    unclaimed: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve repair requests filtered by user role and assignment."""
    if current_user.is_admin:
        return await repair_service.get_all(db)
    
    if current_user.role == "usto":
        if unclaimed:
            return await repair_service.get_unclaimed(db)
        return await repair_service.get_by_usto(db, usto_id=current_user.id)
    
    # Normal client/buyer only gets their own tickets
    return await repair_service.get_by_client(db, client_id=current_user.id)

@router.post("/{id}/claim", response_model=RepairRead)
async def claim_repair_ticket(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Allow an Usto to claim a pending repair ticket."""
    if current_user.role != "usto":
        raise ForbiddenException("Only Usto masters can claim repair tickets")
    ticket = await repair_service.claim_repair(db, repair_id=id, usto_id=current_user.id)
    
    # Notify client and broadcast ticket assignment to other masters
    from src.core.ws_manager import manager
    if ticket.client_id:
        await manager.send_to_user(ticket.client_id, {
            "type": "repair_ticket_claimed",
            "repair_id": id,
            "usto_id": current_user.id,
            "status": "in_progress"
        })
    await manager.broadcast({
        "type": "repair_ticket_claimed_broadcast",
        "repair_id": id
    })
    
    return ticket

@router.get("/{id}/messages", response_model=List[RepairMessageRead])
async def read_repair_messages(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Fetch chat message logs for a specific repair ticket."""
    repair = await repair_service.get_repair_by_id(db, repair_id=id)
    
    # Check permission: must be client, assigned usto, or admin
    if not (current_user.is_admin or repair.client_id == current_user.id or repair.usto_id == current_user.id):
        raise ForbiddenException("You do not have access to this ticket's chat room")
        
    return await repair_service.get_messages(db, repair_id=id)

@router.post("/{id}/messages", response_model=RepairMessageRead)
async def send_repair_message(
    id: int,
    obj_in: RepairMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Send a chat message inside a repair ticket."""
    repair = await repair_service.get_repair_by_id(db, repair_id=id)
    
    # Check permission: must be client, assigned usto, or admin
    if not (current_user.is_admin or repair.client_id == current_user.id or repair.usto_id == current_user.id):
        raise ForbiddenException("You do not have access to this ticket's chat room")
        
    sender_name = current_user.username or current_user.email.split("@")[0]
    new_message = await repair_service.add_message(
        db, 
        repair_id=id, 
        sender_id=current_user.id, 
        sender_name=sender_name, 
        message_text=obj_in.message_text
    )
    
    # Broadcast message to client and usto in real-time
    from src.core.ws_manager import manager
    message_payload = {
        "type": "new_repair_message",
        "repair_id": id,
        "message": RepairMessageRead.model_validate(new_message).model_dump()
    }
    if repair.client_id:
        await manager.send_to_user(repair.client_id, message_payload)
    if repair.usto_id:
        await manager.send_to_user(repair.usto_id, message_payload)
        
    return new_message
