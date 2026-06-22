from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    
    job_title = Column(String(200), nullable=False)
    level = Column(String(10), nullable=False)
    employment_type = Column(String(20), nullable=False)
    employment_status = Column(String(20), nullable=False, default="ACTIVE")
    
    hire_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    department = relationship("Department", back_populates="employees")
    country = relationship("Country", back_populates="employees")
    salary = relationship("Salary", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    salary_history = relationship("SalaryHistory", back_populates="employee", cascade="all, delete-orphan")