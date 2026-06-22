import statistics
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.analytics import AnalyticsService
from sqlalchemy import select
from app.schemas import AnalyticsOverview, AnalyticsByDepartment, AnalyticsByCountry, AnalyticsByLevel
from app.api.deps import get_current_user
from typing import List, Optional
from app.models import Employee, Salary

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return await service.get_overview()

@router.get("/by-department", response_model=List[AnalyticsByDepartment])
async def get_analytics_by_department(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return await service.get_by_department()

@router.get("/by-country", response_model=List[AnalyticsByCountry])
async def get_analytics_by_country(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return await service.get_by_country()

@router.get("/by-level", response_model=List[AnalyticsByLevel])
async def get_analytics_by_level(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return await service.get_by_level()



@router.get("/filtered-snapshot")
async def get_filtered_snapshot(
    department_id: Optional[int] = Query(None),
    country_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Base query joining Employee and Salary
    stmt = select(Employee, Salary).join(Salary, Employee.id == Salary.employee_id)
    
    # Apply filters
    if department_id:
        stmt = stmt.where(Employee.department_id == department_id)
    if country_id:
        stmt = stmt.where(Employee.country_id == country_id)
        
    result = await db.execute(stmt)
    rows = result.all()
    
    # Handle empty state
    if not rows:
        return {
            "headcount": 0, "total_payroll": 0, "average_salary": 0, "median_salary": 0,
            "salary_bands": [
                {"range": "< $50K", "count": 0}, {"range": "$50K - $100K", "count": 0},
                {"range": "$100K - $150K", "count": 0}, {"range": "> $150K", "count": 0}
            ]
        }
        
    # Extract salaries for calculations
    salaries = [float(row[1].base_salary_usd) for row in rows]
    
    headcount = len(salaries)
    total_payroll = sum(salaries)
    average_salary = total_payroll / headcount
    median_salary = statistics.median(salaries)
    
    # Calculate Salary Bands (Histogram buckets)
    bands = {"< $50K": 0, "$50K - $100K": 0, "$100K - $150K": 0, "> $150K": 0}
    for sal in salaries:
        if sal < 50000: bands["< $50K"] += 1
        elif sal < 100000: bands["$50K - $100K"] += 1
        elif sal < 150000: bands["$100K - $150K"] += 1
        else: bands["> $150K"] += 1
        
    return {
        "headcount": headcount,
        "total_payroll": total_payroll,
        "average_salary": average_salary,
        "median_salary": median_salary,
        "salary_bands": [{"range": k, "count": v} for k, v in bands.items()]
    }