from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class SalaryBase(BaseModel):
    base_salary_usd: Decimal = Field(..., ge=0)
    bonus_usd: Decimal = Field(default=0, ge=0)
    effective_date: datetime

class SalaryCreate(SalaryBase):
    employee_id: int
    reason: Optional[str] = None

class SalaryUpdate(BaseModel):
    base_salary_usd: Optional[Decimal] = Field(None, ge=0)
    bonus_usd: Optional[Decimal] = Field(None, ge=0)
    effective_date: Optional[datetime] = None
    reason: Optional[str] = None

class Salary(SalaryBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class SalaryHistory(BaseModel):
    id: str
    employee_id: int
    old_base_salary: Optional[Decimal]
    new_base_salary: Decimal
    old_bonus: Optional[Decimal]
    new_bonus: Decimal
    changed_by: str
    reason: Optional[str]
    changed_at: datetime
    
    model_config = ConfigDict(from_attributes=True)