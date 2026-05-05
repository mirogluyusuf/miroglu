from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    code: str = Field(min_length=1)
    name: str = Field(min_length=2)
    sector_id: int | None = None
    sub_sector: str | None = None
    currency: str = "TRY"
    country: str = "Türkiye"
    notes: str | None = None
    watchlist: bool = False


class Company(CompanyCreate):
    id: int
