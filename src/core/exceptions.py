from fastapi import HTTPException, status

class CredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

class NotFoundException(HTTPException):
    def __init__(self, item_name: str = "Item"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{item_name} not found"
        )

class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad Request"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
