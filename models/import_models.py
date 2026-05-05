from pydantic import BaseModel


class ImportResult(BaseModel):
    status: str
    message: str
    row_count: int = 0
