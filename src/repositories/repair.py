from typing import Any
from src.repositories.base import BaseRepository
from src.models.repair import RepairRequest
from src.schemas.repair import RepairCreate

class RepairRepository(BaseRepository[RepairRequest, RepairCreate, Any]):
    pass

repair_repo = RepairRepository(RepairRequest)
