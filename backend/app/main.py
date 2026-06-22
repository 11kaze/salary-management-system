# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import create_tables, engine
import logging

# 1. Import routers directly from their files (avoids circular imports)
from app.api.routes.auth import router as auth_router
from app.api.routes.employees import router as employees_router
from app.api.routes.salaries import router as salaries_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.bulk import router as bulk_router
from app.api.routes.currency import router as currency_router

# 2. Import models to register them with SQLAlchemy
from app.models.department import Department
from app.models.country import Country
from app.models.exchange_rate import ExchangeRate
from app.models.employee import Employee
from app.models.salary import Salary, SalaryHistory

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('app.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables...")
    # async with engine.begin() as conn:
    #     await conn.run_sync(create_tables)

    await create_tables()
    logger.info("Database ready.")
    yield
    logger.info("Shutting down...")
    await engine.dispose()

app = FastAPI(title="ACME Corp Salary Management", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# 3. Include the routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(employees_router, prefix="/api/v1")
app.include_router(salaries_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(bulk_router, prefix="/api/v1")
app.include_router(currency_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)