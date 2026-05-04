from fastapi import HTTPException, status


class LumiException(HTTPException):
    pass


class NotFoundError(LumiException):
    def __init__(self, resource: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


class UnauthorizedError(LumiException):
    def __init__(self, message: str = "Not authorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=message)


class ForbiddenError(LumiException):
    def __init__(self, message: str = "Access forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=message)


class ValidationError(LumiException):
    def __init__(self, message: str):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)


class ConflictError(LumiException):
    def __init__(self, message: str):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=message)


class ProFeatureError(LumiException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires Lumi Pro. Upgrade for $1/month to unlock all AI features.",
        )
