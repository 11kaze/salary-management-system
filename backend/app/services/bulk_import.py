from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Employee, Department, Country, Salary, SalaryHistory
from app.schemas.bulk import BulkImportResult, BulkUpdateResult
from datetime import datetime
import csv
from io import StringIO

class BulkImportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def import_employees(self, csv_content: str, changed_by: str) -> BulkImportResult:
        reader = csv.DictReader(StringIO(csv_content))
        
        success_count = 0
        created_count = 0
        updated_count = 0
        failed_rows = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Validate required fields
                required = ['employee_code', 'first_name', 'last_name', 'email', 'department_code', 'country_code']
                for field in required:
                    if not row.get(field):
                        raise ValueError(f"Missing required field: {field}")
                
                # Get department and country
                dept_result = await self.db.execute(
                    select(Department).where(Department.code == row['department_code'])
                )
                dept = dept_result.scalar_one_or_none()
                if not dept:
                    raise ValueError(f"Department code '{row['department_code']}' not found")
                
                country_result = await self.db.execute(
                    select(Country).where(Country.code == row['country_code'])
                )
                country = country_result.scalar_one_or_none()
                if not country:
                    raise ValueError(f"Country code '{row['country_code']}' not found")
                
                # Check if employee already exists
                existing_result = await self.db.execute(
                    select(Employee).where(Employee.employee_code == row['employee_code'])
                )
                existing = existing_result.scalar_one_or_none()
                
                if existing:
                    # Update existing employee
                    existing.first_name = row['first_name']
                    existing.last_name = row['last_name']
                    existing.email = row['email']
                    existing.department_id = dept.id
                    existing.country_id = country.id
                    existing.job_title = row.get('job_title', existing.job_title)
                    existing.level = row.get('level', existing.level)
                    existing.employment_type = row.get('employment_type', existing.employment_type)
                    existing.employment_status = row.get('employment_status', existing.employment_status)
                    if row.get('hire_date'):
                        existing.hire_date = datetime.strptime(row['hire_date'], '%Y-%m-%d')
                    
                    updated_count += 1
                    success_count += 1
                else:
                    # Create new employee
                    employee = Employee(
                        employee_code=row['employee_code'],
                        first_name=row['first_name'],
                        last_name=row['last_name'],
                        email=row['email'],
                        department_id=dept.id,
                        country_id=country.id,
                        job_title=row.get('job_title', ''),
                        level=row.get('level', 'L1'),
                        employment_type=row.get('employment_type', 'FULL_TIME'),
                        employment_status=row.get('employment_status', 'ACTIVE'),
                        hire_date=datetime.strptime(row.get('hire_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d')
                    )
                    self.db.add(employee)
                    await self.db.flush()
                    
                    # Create initial salary
                    salary = Salary(
                        employee_id=employee.id,
                        base_salary_usd=50000,
                        bonus_usd=0,
                        effective_date=employee.hire_date
                    )
                    self.db.add(salary)
                    
                    created_count += 1
                    success_count += 1
                
            except Exception as e:
                failed_rows.append({
                    "row_number": row_num,
                    "error": str(e),
                    "data": {k: v for k, v in row.items() if v}
                })
        
        await self.db.commit()
        
        return BulkImportResult(
            success_count=success_count,
            created_count=created_count,
            updated_count=updated_count,
            failed_count=len(failed_rows),
            failed_rows=failed_rows
        )

    async def update_salaries(self, csv_content: str, changed_by: str) -> BulkUpdateResult:
        reader = csv.DictReader(StringIO(csv_content))
        
        updated_count = 0
        created_count = 0
        failed_rows = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                if not row.get('employee_id'):
                    raise ValueError("Missing employee_id")
                
                employee_id = int(row['employee_id'])
                
                # Get employee and salary
                result = await self.db.execute(
                    select(Employee, Salary)
                    .join(Salary, Employee.id == Salary.employee_id)
                    .where(Employee.id == employee_id)
                )
                row_data = result.first()
                
                if not row_data:
                    raise ValueError(f"Employee ID {employee_id} not found or has no salary record")
                
                employee, salary = row_data
                
                old_base = float(salary.base_salary_usd)
                old_bonus = float(salary.bonus_usd)
                
                new_base = float(row.get('base_salary_usd', old_base))
                new_bonus = float(row.get('bonus_usd', old_bonus))
                
                # Update salary
                salary.base_salary_usd = new_base
                salary.bonus_usd = new_bonus
                
                # Log to history
                history = SalaryHistory(
                    employee_id=employee_id,
                    old_base_salary=old_base,
                    new_base_salary=new_base,
                    old_bonus=old_bonus,
                    new_bonus=new_bonus,
                    reason=row.get('reason', 'Bulk CSV update'),
                    changed_by=changed_by,
                    changed_at=datetime.utcnow()
                )
                self.db.add(history)
                
                updated_count += 1
                
            except Exception as e:
                failed_rows.append({
                    "row_number": row_num,
                    "error": str(e),
                    "data": {k: v for k, v in row.items() if v}
                })
        
        await self.db.commit()
        
        return BulkUpdateResult(
            updated_count=updated_count,
            created_count=created_count,
            failed_count=len(failed_rows),
            failed_rows=failed_rows
        )