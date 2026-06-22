# app/api/routes/salaries.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Salary, SalaryHistory, Employee
from app.schemas import Salary as SalarySchema, SalaryUpdate, SalaryHistory as SalaryHistorySchema
from app.api.deps import get_current_user
from sqlalchemy import select
from datetime import datetime
import uuid

router = APIRouter(prefix="/employees/{employee_id}/salary", tags=["salaries"])

@router.get("", response_model=SalarySchema)
async def get_salary(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(Salary).where(Salary.employee_id == employee_id))
    salary = result.scalar_one_or_none()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return salary

@router.put("", response_model=SalarySchema)
async def update_salary(
    employee_id: int,
    salary_update: SalaryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Get existing salary
    result = await db.execute(select(Salary).where(Salary.employee_id == employee_id))
    salary = result.scalar_one_or_none()
    
    if not salary:
        # Create new salary record
        employee = await db.get(Employee, employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        salary = Salary(
            employee_id=employee_id,
            base_salary_usd=salary_update.base_salary_usd or 0,
            bonus_usd=salary_update.bonus_usd or 0,
            effective_date=salary_update.effective_date or datetime.utcnow()
        )
        db.add(salary)
    else:
        # Log history before update
        if salary_update.base_salary_usd is not None or salary_update.bonus_usd is not None:
            history = SalaryHistory(
                id=str(uuid.uuid4()),
                employee_id=employee_id,
                old_base_salary=salary.base_salary_usd,
                new_base_salary=salary_update.base_salary_usd or salary.base_salary_usd,
                old_bonus=salary.bonus_usd,
                new_bonus=salary_update.bonus_usd or salary.bonus_usd,
                changed_by=current_user,
                reason=salary_update.reason
            )
            db.add(history)
            
            # Update salary
            if salary_update.base_salary_usd is not None:
                salary.base_salary_usd = salary_update.base_salary_usd
            if salary_update.bonus_usd is not None:
                salary.bonus_usd = salary_update.bonus_usd
            if salary_update.effective_date:
                salary.effective_date = salary_update.effective_date
    
    await db.commit()
    await db.refresh(salary)
    return salary

@router.get("/history", response_model=list[SalaryHistorySchema])
async def get_salary_history(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(
        select(SalaryHistory)
        .where(SalaryHistory.employee_id == employee_id)
        .order_by(SalaryHistory.changed_at.desc())
    )
    return result.scalars().all()