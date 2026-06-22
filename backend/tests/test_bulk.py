# tests/test_bulk.py
import pytest
import io
from datetime import datetime, timezone
from app.models import Department, Country, Employee, Salary

@pytest.mark.asyncio
async def test_bulk_salary_upsert(client, db_session, auth_headers):
    # Setup
    dept = Department(name="Finance", code="FIN")
    country = Country(name="Germany", code="DE", currency_code="EUR")
    db_session.add_all([dept, country])
    await db_session.commit()
    await db_session.refresh(dept)
    await db_session.refresh(country)

    now = datetime.now(timezone.utc)
    emp1 = Employee(
        employee_code="EMP101", first_name="Bob", last_name="Builder", 
        email="bob@acme.com", department_id=dept.id, country_id=country.id, 
        job_title="Analyst", level="L3", employment_type="FULL_TIME", hire_date=now
    )
    emp2 = Employee(
        employee_code="EMP102", first_name="Charlie", last_name="Brown", 
        email="charlie@acme.com", department_id=dept.id, country_id=country.id, 
        job_title="Analyst", level="L3", employment_type="FULL_TIME", hire_date=now
    )
    db_session.add_all([emp1, emp2])
    await db_session.commit()
    await db_session.refresh(emp1)
    await db_session.refresh(emp2)

    # FIX: Create an EXISTING salary for emp1 so the bulk update actually UPDATES it
    existing_salary = Salary(
        employee_id=emp1.id,
        base_salary_usd=60000,
        bonus_usd=1000,
        effective_date=now
    )
    db_session.add(existing_salary)
    await db_session.commit()

    # CSV Content: Update emp1, Create for emp2, Fail for non-existent emp999
    csv_data = (
        "employee_id,base_salary_usd,bonus_usd,effective_date,reason\n"
        f"{emp1.id},70000,2000,2024-01-01,Update\n"
        f"{emp2.id},75000,3000,2024-01-01,Create\n"
        f"99999,80000,4000,2024-01-01,Fail\n"
    )
    
    file = io.BytesIO(csv_data.encode('utf-8'))
    files = {'file': ('salaries.csv', file, 'text/csv')}
    
    response = await client.post("/api/v1/bulk/salaries/update", files=files, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["updated_count"] == 1
    assert data["created_count"] == 1
    assert data["failed_count"] == 1
    assert len(data["failed_rows"]) == 1
    assert "not found" in data["failed_rows"][0]["error"].lower()