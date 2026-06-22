# app/repositories/employee.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload, joinedload
from app.models import Employee
from app.repositories.base import BaseRepository

class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self, db: AsyncSession):
        super().__init__(Employee, db)
    
    async def search(
        self,
        query: Optional[str] = None,
        department_id: Optional[int] = None,
        country_id: Optional[int] = None,
        employment_status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Employee]:
        stmt = select(Employee)
        
        # FIX: Eagerly load relationships to avoid lazy loading errors
        stmt = stmt.options(
            selectinload(Employee.department),
            selectinload(Employee.country),
            joinedload(Employee.salary)
        )
        
        filters = []
        if query:
            filters.append(or_(
                Employee.first_name.ilike(f"%{query}%"),
                Employee.last_name.ilike(f"%{query}%"),
                Employee.email.ilike(f"%{query}%"),
                Employee.employee_code.ilike(f"%{query}%")
            ))
        if department_id:
            filters.append(Employee.department_id == department_id)
        if country_id:
            filters.append(Employee.country_id == country_id)
        if employment_status:
            filters.append(Employee.employment_status == employment_status)
        
        if filters:
            stmt = stmt.where(and_(*filters))
        
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def get_by_employee_code(self, employee_code: str) -> Optional[Employee]:
        stmt = select(Employee).options(
            selectinload(Employee.department),
            selectinload(Employee.country),
            selectinload(Employee.salary)
        ).where(Employee.employee_code == employee_code)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[Employee]:
        stmt = select(Employee).options(
            selectinload(Employee.department),
            selectinload(Employee.country),
            selectinload(Employee.salary)
        ).where(Employee.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def count(
        self,
        q: Optional[str] = None,
        department_id: Optional[int] = None,
        country_id: Optional[int] = None,
        employment_status: Optional[str] = None
    ) -> int:
        stmt = select(func.count(Employee.id))
        
        filters = []
        if q:
            filters.append(or_(
                Employee.first_name.ilike(f"%{q}%"),
                Employee.last_name.ilike(f"%{q}%"),
                Employee.email.ilike(f"%{q}%"),
                Employee.employee_code.ilike(f"%{q}%")
            ))
        if department_id:
            filters.append(Employee.department_id == department_id)
        if country_id:
            filters.append(Employee.country_id == country_id)
        if employment_status:
            filters.append(Employee.employment_status == employment_status)
            
        if filters:
            stmt = stmt.where(and_(*filters))
            
        result = await self.db.execute(stmt)
        return result.scalar() or 0