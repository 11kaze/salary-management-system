# app/api/routes/employees.py
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models import Salary, SalaryHistory
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.repositories.employee import EmployeeRepository
from app.schemas import Employee, EmployeeCreate, EmployeeUpdate, Employee as EmployeeSchema
from app.api.deps import get_current_user
import csv
import io
from fastapi.responses import StreamingResponse
from datetime import datetime

router = APIRouter(prefix="/employees", tags=["employees"])

@router.post("", status_code=201, response_model=Employee)
async def create_employee(
    employee_in: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    repo = EmployeeRepository(db)
    
    # Check if email already exists
    existing = await repo.get_by_email(employee_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Extract salary fields
    salary_data = {
        "base_salary_usd": employee_in.base_salary_usd,
        "bonus_usd": employee_in.bonus_usd,
    }
    
    # Create employee without salary fields
    employee_data = employee_in.model_dump(exclude={"base_salary_usd", "bonus_usd"})
    employee = await repo.create(employee_data)
    
    # Create salary record
    salary = Salary(
        employee_id=employee.id,
        base_salary_usd=salary_data["base_salary_usd"],
        bonus_usd=salary_data["bonus_usd"],
        effective_date=employee.hire_date
    )
    db.add(salary)
    await db.commit()
    
    # Return complete employee
    return await repo.get(employee.id)

@router.get("", response_model=List[Employee])
async def list_employees(
    q: Optional[str] = Query(None, description="Search query"),
    department_id: Optional[int] = None,
    country_id: Optional[int] = None,
    employment_status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    repo = EmployeeRepository(db)
    skip = (page - 1) * page_size
    employees = await repo.search(
        query=q,
        department_id=department_id,
        country_id=country_id,
        employment_status=employment_status,
        skip=skip,
        limit=page_size
    )
    return employees

@router.get("/count")
async def count_employees(
    q: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    country_id: Optional[int] = Query(None),
    employment_status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    repo = EmployeeRepository(db)
    # Pass filters to the count method
    count = await repo.count(q, department_id, country_id, employment_status)
    return {"total": count}

@router.get("/export/csv")
async def export_employees_csv(
    q: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    country_id: Optional[int] = Query(None),
    employment_status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    try:
        repo = EmployeeRepository(db)
        employees = await repo.search(
            query=q,
            department_id=department_id,
            country_id=country_id,
            employment_status=employment_status,
            skip=0,
            limit=10000
        )
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers
        writer.writerow([
            'Employee Code', 'First Name', 'Last Name', 'Email',
            'Department', 'Country', 'Currency', 'Job Title', 'Level',
            'Employment Type', 'Employment Status', 'Hire Date',
            'Base Salary (USD)', 'Bonus (USD)'
        ])
        
        # Data - with null safety
        for emp in employees:
            writer.writerow([
                emp.employee_code,
                emp.first_name,
                emp.last_name,
                emp.email,
                emp.department.name if emp.department else '',
                emp.country.name if emp.country else '',
                emp.country.currency_code if emp.country else 'USD',
                emp.job_title,
                emp.level,
                emp.employment_type,
                emp.employment_status,
                emp.hire_date.strftime('%Y-%m-%d') if emp.hire_date else '',
                f"{emp.salary.base_salary_usd:.2f}" if emp.salary else '',
                f"{emp.salary.bonus_usd:.2f}" if emp.salary else ''
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=employees_{datetime.now().strftime('%Y-%m-%d')}.csv",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        import logging
        logging.error(f"Export failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/top-salary")
async def get_top_employees_by_salary(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    from app.models import Employee, Salary
    from sqlalchemy.orm import selectinload
    
    # Join Employee and Salary, order by base_salary_usd DESC
    stmt = (
        select(Employee, Salary.base_salary_usd)
        .join(Salary, Employee.id == Salary.employee_id)
        .options(selectinload(Employee.department))
        .order_by(desc(Salary.base_salary_usd))
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    # Format the response
    response = []
    for emp, salary in rows:
        response.append({
            "id": emp.id,
            "employee_code": emp.employee_code,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "department": emp.department.name if emp.department else "N/A",
            "job_title": emp.job_title,
            "base_salary_usd": float(salary)
        })
        
    return response

@router.get("/{employee_id}", response_model=Employee)
async def get_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    repo = EmployeeRepository(db)
    employee = await repo.get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{employee_id}", response_model=Employee)
async def update_employee(
    employee_id: int,
    employee_in: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    repo = EmployeeRepository(db)
    employee = await repo.get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Extract salary fields from the input
    update_data = employee_in.model_dump(exclude_unset=True)
    new_base_salary = update_data.pop("base_salary_usd", None)
    new_bonus = update_data.pop("bonus_usd", None)
    
    # 1. Update Employee fields
    for key, value in update_data.items():
        setattr(employee, key, value)
    
    # Update Salary and CREATE HISTORY RECORD
    if employee.salary and (new_base_salary is not None or new_bonus is not None):
        old_base = float(employee.salary.base_salary_usd)
        old_bonus = float(employee.salary.bonus_usd)
        
        final_base = float(new_base_salary) if new_base_salary is not None else old_base
        final_bonus = float(new_bonus) if new_bonus is not None else old_bonus
        
        # Only create history if values actually changed
        if old_base != final_base or old_bonus != final_bonus:
            employee.salary.base_salary_usd = final_base
            employee.salary.bonus_usd = final_bonus

            # dynamic reson update
            update_reasons = []
            if old_base != final_base:
                update_reasons.append(f"Base salary updated from ${old_base:,.2f} to ${final_base:,.2f}")
            if old_bonus != final_bonus:
                update_reasons.append(f"Bonus updated from ${old_bonus:,.2f} to ${final_bonus:,.2f}")
            
            reason_text = "; ".join(update_reasons)
            
            # Create the history log
            history = SalaryHistory(
                employee_id=employee.id,
                old_base_salary=old_base,
                new_base_salary=final_base,
                old_bonus=old_bonus,
                new_bonus=final_bonus,
                reason=reason_text,
                changed_by=current_user,
                changed_at=datetime.utcnow()
            )
            db.add(history)
            
    await db.commit()
    await db.refresh(employee)
    return await repo.get(employee_id)

@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    repo = EmployeeRepository(db)
    success = await repo.delete(employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

@router.get("/{employee_id}/salary/history")
async def get_salary_history(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    stmt = (
        select(SalaryHistory)
        .where(SalaryHistory.employee_id == employee_id)
        .order_by(desc(SalaryHistory.changed_at))
    )
    result = await db.execute(stmt)
    return result.scalars().all()


