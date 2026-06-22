from pydantic import BaseModel
from decimal import Decimal

class AnalyticsOverview(BaseModel):
    total_employees: int
    total_payroll_usd: Decimal
    average_salary_usd: Decimal
    total_countries: int

class AnalyticsByDepartment(BaseModel):
    department: str
    employee_count: int
    average_salary: Decimal
    total_payroll: Decimal

class AnalyticsByCountry(BaseModel):
    country: str
    country_code: str
    currency: str
    employee_count: int
    average_salary: Decimal
    total_payroll: Decimal

class AnalyticsByLevel(BaseModel):
    level: str
    employee_count: int
    average_salary: Decimal