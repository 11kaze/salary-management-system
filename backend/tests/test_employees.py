import pytest
from app.models import Department, Country

@pytest.mark.asyncio
async def test_create_and_get_employee(client, db_session, auth_headers):
    # 1. Setup dependencies (Department & Country)
    dept = Department(name="Engineering", code="ENG")
    country = Country(name="United States", code="US", currency_code="USD")
    db_session.add_all([dept, country])
    await db_session.commit()
    await db_session.refresh(dept)
    await db_session.refresh(country)

    # 2. Create Employee
    payload = {
        "employee_code": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@acme.com",
        "department_id": dept.id,
        "country_id": country.id,
        "job_title": "Software Engineer",
        "level": "L3",
        "employment_type": "FULL_TIME",
        "hire_date": "2023-01-01T00:00:00Z"
    }
    response = await client.post("/api/v1/employees", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["employee_code"] == "EMP001"
    emp_id = data["id"]

    # 3. Get Employee
    response = await client.get(f"/api/v1/employees/{emp_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "john.doe@acme.com"

@pytest.mark.asyncio
async def test_search_employees(client, db_session, auth_headers):
    # Setup
    dept = Department(name="Sales", code="SALES")
    country = Country(name="India", code="IN", currency_code="INR")
    db_session.add_all([dept, country])
    await db_session.commit()
    await db_session.refresh(dept)
    await db_session.refresh(country)

    # Create a few employees
    for i in range(3):
        await client.post("/api/v1/employees", json={
            "employee_code": f"EMP00{i}",
            "first_name": f"Jane{i}",
            "last_name": "Smith",
            "email": f"jane{i}.smith@acme.com",
            "department_id": dept.id,
            "country_id": country.id,
            "job_title": "Sales Rep",
            "level": "L2",
            "employment_type": "FULL_TIME",
            "hire_date": "2023-01-01T00:00:00Z"
        }, headers=auth_headers)

    # Search
    response = await client.get("/api/v1/employees?q=Jane1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["first_name"] == "Jane1"