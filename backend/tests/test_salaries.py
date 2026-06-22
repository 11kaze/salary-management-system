# tests/test_salaries.py
import pytest
from datetime import datetime, timezone
from app.models import Department, Country, Employee, Salary

@pytest.mark.asyncio
async def test_update_salary_creates_history(client, db_session, auth_headers):
    # Setup Employee & Initial Salary
    dept = Department(name="HR", code="HR")
    country = Country(name="UK", code="GB", currency_code="GBP")
    db_session.add_all([dept, country])
    await db_session.commit()
    await db_session.refresh(dept)
    await db_session.refresh(country)

    now = datetime.now(timezone.utc)
    emp = Employee(
        employee_code="EMP999", first_name="Alice", last_name="Wonder",
        email="alice@acme.com", department_id=dept.id, country_id=country.id,
        job_title="HR Manager", level="L5", employment_type="FULL_TIME",
        hire_date=now
    )
    db_session.add(emp)
    await db_session.commit()
    await db_session.refresh(emp)

    # Create initial salary
    initial_salary = Salary(
        employee_id=emp.id, base_salary_usd=80000, bonus_usd=0, effective_date=now
    )
    db_session.add(initial_salary)
    await db_session.commit()

    # Update Salary via API
    update_payload = {
        "base_salary_usd": 95000,
        "bonus_usd": 5000,
        "reason": "Annual performance review"
    }
    response = await client.put(f"/api/v1/employees/{emp.id}/salary", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["base_salary_usd"] == "95000.00"

    # Verify History was created
    response = await client.get(f"/api/v1/employees/{emp.id}/salary/history", headers=auth_headers)
    assert response.status_code == 200
    history = response.json()
    assert len(history) == 1
    assert history[0]["old_base_salary"] == "80000.00"
    assert history[0]["new_base_salary"] == "95000.00"
    assert history[0]["reason"] == "Annual performance review"