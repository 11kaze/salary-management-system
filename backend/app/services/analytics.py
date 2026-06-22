# app/services/analytics.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from decimal import Decimal
from app.models import Employee, Salary, Department, Country
from app.schemas import AnalyticsOverview, AnalyticsByDepartment, AnalyticsByCountry, AnalyticsByLevel
from typing import List

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_overview(self) -> AnalyticsOverview:
        # Total employees
        emp_count = await self.db.execute(select(func.count(Employee.id)))
        total_employees = emp_count.scalar() or 0
        
        # Total payroll (handle potential None)
        payroll_result = await self.db.execute(
            select(func.sum(Salary.base_salary_usd))
        )
        total_payroll = payroll_result.scalar() or 0
        
        # Average salary (handle potential None)
        avg_result = await self.db.execute(
            select(func.avg(Salary.base_salary_usd))
        )
        avg_salary = avg_result.scalar() or 0
        
        # Total countries
        countries_result = await self.db.execute(
            select(func.count(func.distinct(Employee.country_id)))
        )
        total_countries = countries_result.scalar() or 0
        
        # FIX: Explicitly cast to Decimal to satisfy Pydantic V2
        return AnalyticsOverview(
            total_employees=total_employees,
            total_payroll_usd=Decimal(str(total_payroll)),
            average_salary_usd=Decimal(str(avg_salary)),
            total_countries=total_countries
        )
    
    async def get_by_department(self) -> List[AnalyticsByDepartment]:
        stmt = (
            select(
                Department.name,
                func.count(Employee.id).label("employee_count"),
                func.avg(Salary.base_salary_usd).label("average_salary"),
                func.sum(Salary.base_salary_usd).label("total_payroll")
            )
            .join(Employee, Department.id == Employee.department_id)
            .join(Salary, Employee.id == Salary.employee_id)
            .group_by(Department.id, Department.name)
        )
        
        result = await self.db.execute(stmt)
        rows = result.all()
        
        return [
            AnalyticsByDepartment(
                department=row.name,
                employee_count=row.employee_count,
                average_salary=Decimal(str(row.average_salary or 0)),
                total_payroll=Decimal(str(row.total_payroll or 0))
            )
            for row in rows
        ]
    
    async def get_by_country(self) -> List[AnalyticsByCountry]:
        stmt = (
            select(
                Country.name,
                Country.code,
                Country.currency_code,
                func.count(Employee.id).label("employee_count"),
                func.avg(Salary.base_salary_usd).label("average_salary"),
                func.sum(Salary.base_salary_usd).label("total_payroll")
            )
            .join(Employee, Country.id == Employee.country_id)
            .join(Salary, Employee.id == Salary.employee_id)
            .group_by(Country.id, Country.name, Country.code, Country.currency_code)
        )
        
        result = await self.db.execute(stmt)
        rows = result.all()
        
        return [
            AnalyticsByCountry(
                country=row.name,
                country_code=row.code,
                currency=row.currency_code,
                employee_count=row.employee_count,
                average_salary=Decimal(str(row.average_salary or 0)),
                total_payroll=Decimal(str(row.total_payroll or 0))
            )
            for row in rows
        ]
    
    async def get_by_level(self) -> List[AnalyticsByLevel]:
        stmt = (
            select(
                Employee.level,
                func.count(Employee.id).label("employee_count"),
                func.avg(Salary.base_salary_usd).label("average_salary")
            )
            .join(Salary, Employee.id == Salary.employee_id)
            .group_by(Employee.level)
            .order_by(Employee.level)
        )
        
        result = await self.db.execute(stmt)
        rows = result.all()
        
        return [
            AnalyticsByLevel(
                level=row.level,
                employee_count=row.employee_count,
                average_salary=Decimal(str(row.average_salary or 0))
            )
            for row in rows
        ]