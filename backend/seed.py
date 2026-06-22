# seed.py
import asyncio
import random
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

from app.database import Base
from app.models import Department, Country, Employee, Salary
from faker import Faker
from decimal import Decimal

fake = Faker()

# Departments
DEPARTMENTS = [
    ("Engineering", "ENG"),
    ("Product", "PROD"),
    ("Sales", "SALES"),
    ("Marketing", "MKT"),
    ("Finance", "FIN"),
    ("HR", "HR"),
    ("Operations", "OPS"),
    ("Customer Success", "CS"),
]

# Countries with currencies
COUNTRIES = [
    ("United States", "US", "USD"),
    ("India", "IN", "INR"),
    ("United Kingdom", "GB", "GBP"),
    ("Germany", "DE", "EUR"),
    ("Singapore", "SG", "SGD"),
    ("Canada", "CA", "CAD"),
    ("Australia", "AU", "AUD"),
    ("UAE", "AE", "AED"),
]

# Job titles by department
JOB_TITLES = {
    "Engineering": ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer", "Engineering Manager"],
    "Product": ["Product Manager", "Senior Product Manager", "Principal PM", "Director of Product"],
    "Sales": ["Sales Representative", "Account Executive", "Sales Manager", "Sales Director", "VP Sales"],
    "Marketing": ["Marketing Specialist", "Marketing Manager", "Senior Marketing Manager", "Director of Marketing"],
    "Finance": ["Financial Analyst", "Senior Financial Analyst", "Finance Manager", "CFO"],
    "HR": ["HR Coordinator", "HR Manager", "Senior HR Manager", "HR Director"],
    "Operations": ["Operations Coordinator", "Operations Manager", "Director of Operations"],
    "Customer Success": ["Support Specialist", "Customer Success Manager", "Senior CSM", "Director of CS"],
}

# Levels with salary ranges (in USD)
LEVELS = {
    "L1": (40000, 60000),
    "L2": (60000, 80000),
    "L3": (80000, 110000),
    "L4": (110000, 150000),
    "L5": (150000, 200000),
    "L6": (200000, 300000),
    "L7": (300000, 500000),
}

DATABASE_URL = "sqlite+aiosqlite:///./acme_salary.db"
BATCH_SIZE = 1000
TOTAL_EMPLOYEES = 10000


def print_warning():
    """Print a clear warning before seeding"""
    print("\n" + "=" * 60)
    print("⚠️  WARNING: DATABASE SEED SCRIPT")
    print("=" * 60)
    print("\nThis script will:")
    print("  • DROP all existing tables")
    print("  • DELETE all existing data")
    print("  • Create fresh tables")
    print(f"  • Seed {TOTAL_EMPLOYEES} employees with salary records")
    print("\nAll existing data will be LOST permanently!")
    print("=" * 60)
    print("Starting in 3 seconds... (Press Ctrl+C to cancel)\n")


async def clean_database(engine):
    """Drop all tables and recreate them fresh"""
    print("🗑️  Cleaning existing database...")
    async with engine.begin() as conn:
        # Drop all tables in correct order (respecting foreign keys)
        await conn.execute(text("DROP TABLE IF EXISTS salary_history"))
        await conn.execute(text("DROP TABLE IF EXISTS salaries"))
        await conn.execute(text("DROP TABLE IF EXISTS employees"))
        await conn.execute(text("DROP TABLE IF EXISTS exchange_rates"))
        await conn.execute(text("DROP TABLE IF EXISTS countries"))
        await conn.execute(text("DROP TABLE IF EXISTS departments"))
        
        # Create all tables fresh
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database cleaned and tables created\n")


async def seed_database():
    # Show warning
    print_warning()
    
    # Give user 3 seconds to cancel
    try:
        await asyncio.sleep(3)
    except KeyboardInterrupt:
        print("\n\n❌ Seeding cancelled by user.")
        return
    
    # Create engine with echo=False (no SQL queries printed)
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Clean and recreate database
    await clean_database(engine)
    
    async with async_session() as session:
        # 1. Create departments
        print("📁 Creating departments...")
        departments = []
        for name, code in DEPARTMENTS:
            dept = Department(name=name, code=code)
            session.add(dept)
            departments.append(dept)
        await session.commit()
        print(f"✅ Created {len(departments)} departments\n")
        
        # 2. Create countries
        print("🌍 Creating countries...")
        countries = []
        for name, code, currency in COUNTRIES:
            country = Country(name=name, code=code, currency_code=currency)
            session.add(country)
            countries.append(country)
        await session.commit()
        print(f"✅ Created {len(countries)} countries\n")
        
        # 3. Create employees in batches
        print(f"👥 Creating {TOTAL_EMPLOYEES} employees in batches of {BATCH_SIZE}...")
        total_batches = (TOTAL_EMPLOYEES + BATCH_SIZE - 1) // BATCH_SIZE
        
        for batch_num in range(total_batches):
            batch_start = batch_num * BATCH_SIZE
            batch_end = min(batch_start + BATCH_SIZE, TOTAL_EMPLOYEES)
            batch_count = batch_end - batch_start
            
            for i in range(batch_start, batch_end):
                dept = random.choice(departments)
                country = random.choice(countries)
                
                # Weight towards US and India
                if random.random() < 0.4:
                    country = countries[0]  # US
                elif random.random() < 0.3:
                    country = countries[1]  # India
                
                # Generate employee with unique email
                first_name = fake.first_name()
                last_name = fake.last_name()
                employee_code = f"EMP{i+1:05d}"
                email = f"{first_name.lower()}.{last_name.lower()}.{i+1:05d}@acme.com"
                
                job_title = random.choice(JOB_TITLES[dept.name])
                level = random.choice(list(LEVELS.keys()))
                
                # Adjust level based on job title seniority
                if "Director" in job_title or "VP" in job_title or "CFO" in job_title:
                    level = random.choice(["L6", "L7"])
                elif "Manager" in job_title or "Senior" in job_title:
                    level = random.choice(["L4", "L5"])
                elif "Principal" in job_title or "Staff" in job_title:
                    level = random.choice(["L5", "L6"])
                
                # Calculate salary based on level and country
                min_sal, max_sal = LEVELS[level]
                base_salary = random.uniform(min_sal, max_sal)
                
                # Adjust for country cost of living
                if country.code == "IN":
                    base_salary *= 0.4
                elif country.code == "GB":
                    base_salary *= 1.1
                elif country.code == "DE":
                    base_salary *= 0.9
                
                hire_date = fake.date_between(start_date="-10y", end_date="today")
                
                employee = Employee(
                    employee_code=employee_code,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    department_id=dept.id,
                    country_id=country.id,
                    job_title=job_title,
                    level=level,
                    employment_type=random.choice(["FULL_TIME"] * 9 + ["CONTRACT", "PART_TIME"]),
                    employment_status=random.choice(["ACTIVE"] * 95 + ["ON_LEAVE", "TERMINATED"]),
                    hire_date=hire_date
                )
                session.add(employee)
                await session.flush()  # Get the employee ID
                
                # Create salary record
                salary = Salary(
                    employee_id=employee.id,
                    base_salary_usd=Decimal(str(base_salary)).quantize(Decimal('0.01')),
                    bonus_usd=Decimal(str(base_salary * random.uniform(0, 0.2))).quantize(Decimal('0.01')),
                    effective_date=hire_date
                )
                session.add(salary)
            
            # Commit batch
            await session.commit()
            print(f"  ✅ Batch {batch_num + 1}/{total_batches} complete — Added {batch_count} employees (Total: {batch_end}/{TOTAL_EMPLOYEES})")
        
        print(f"\n🎉 Seeding complete! Successfully created {TOTAL_EMPLOYEES} employees with salary records.")
        print("   You can now start the server with: uvicorn app.main:app --reload\n")


if __name__ == "__main__":
    asyncio.run(seed_database())