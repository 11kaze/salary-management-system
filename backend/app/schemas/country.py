# app/schemas/country.py
from pydantic import BaseModel, ConfigDict

class CountryBase(BaseModel):
    name: str
    code: str
    currency_code: str

class CountryCreate(CountryBase):
    pass

class Country(CountryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)