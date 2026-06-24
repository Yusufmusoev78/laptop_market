from src.repositories.base import BaseRepository
from src.models.laptop import Laptop
from src.schemas.laptop import LaptopCreate, LaptopUpdate

class LaptopRepository(BaseRepository[Laptop, LaptopCreate, LaptopUpdate]):
    pass

laptop_repo = LaptopRepository(Laptop)
