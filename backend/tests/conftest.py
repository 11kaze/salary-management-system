import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# 1. Import Base FIRST
from app.database import Base, get_db
from app.api.deps import get_current_user

# 2. Import ALL models explicitly
from app.models.department import Department
from app.models.country import Country
from app.models.exchange_rate import ExchangeRate
from app.models.employee import Employee
from app.models.salary import Salary, SalaryHistory

# 3. Import app AFTER models are registered
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite://" 

@pytest_asyncio.fixture(scope="function")
async def async_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(async_engine):
    async_session = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Override dependencies for testing"""
    async def override_get_db():
        yield db_session

    async def override_get_current_user():
        return "test_hr@acme.com" # Bypass JWT validation in tests

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture(scope="function")
def auth_headers():
    # Headers are no longer strictly needed for auth since we override the dependency,
    # but keeping them is good practice if you add other middleware later.
    return {"Authorization": "Bearer test_token"}