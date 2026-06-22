from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.bulk_import import BulkImportService
from app.schemas import BulkImportResult, BulkUpdateResult
from app.api.deps import get_current_user
from fastapi.responses import StreamingResponse
import csv
from io import StringIO

router = APIRouter(prefix="/bulk", tags=["bulk"])

@router.post("/employees/import", response_model=BulkImportResult)
async def bulk_import_employees(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    service = BulkImportService(db)
    result = await service.import_employees(csv_content, current_user)
    return result

@router.post("/salaries/update", response_model=BulkUpdateResult)
async def bulk_update_salaries(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    service = BulkImportService(db)
    result = await service.update_salaries(csv_content, current_user)
    return result

@router.get("/employees/template")
async def download_employee_template():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "employee_code", "first_name", "last_name", "email", 
        "department_code", "country_code", "job_title", "level",
        "employment_type", "employment_status", "hire_date"
    ])
    writer.writerow([
        "EMP00001", "John", "Doe", "john.doe@acme.com",
        "ENG", "US", "Software Engineer", "L3",
        "FULL_TIME", "ACTIVE", "2024-01-15"
    ])
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees_template.csv"}
    )

@router.get("/salaries/template")
async def download_salary_template():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "employee_id", "base_salary_usd", "bonus_usd", 
        "effective_date", "reason"
    ])
    writer.writerow([
        "1", "90000", "5000", "2024-01-01", "Annual raise"
    ])
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=salaries_template.csv"}
    )

@router.get("/salaries/failed/download")
async def download_failed_salary_rows(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # This would need session storage for failed rows
    # Simplified version - in production use Redis or temp files
    raise HTTPException(status_code=501, detail="Not implemented - use session-based approach")