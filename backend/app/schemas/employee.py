from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.department import Department
from app.schemas.country import Country
from app.schemas.salary import Salary

class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    department_id: int
    country_id: int
    job_title: str
    level: str
    employment_type: str
    employment_status: str = "ACTIVE"
    hire_date: datetime

class EmployeeCreate(EmployeeBase):
    base_salary_usd: float
    bonus_usd: float = 0.0

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    job_title: Optional[str] = None
    level: Optional[str] = None
    employment_status: Optional[str] = None
    base_salary_usd: Optional[float] = None
    bonus_usd: Optional[float] = None

class Employee(EmployeeBase):
    id: int
    department: Department
    country: Country
    salary: Optional[Salary] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)