# app/models/salary.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Salary(Base):
    __tablename__ = "salaries"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    
    base_salary_usd = Column(DECIMAL(12, 2), nullable=False)
    bonus_usd = Column(DECIMAL(12, 2), default=0)
    
    effective_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    employee = relationship("Employee", back_populates="salary")

class SalaryHistory(Base):
    __tablename__ = "salary_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    old_base_salary = Column(DECIMAL(12, 2))
    new_base_salary = Column(DECIMAL(12, 2), nullable=False)
    old_bonus = Column(DECIMAL(12, 2))
    new_bonus = Column(DECIMAL(12, 2), nullable=False)
    
    changed_by = Column(String(100), nullable=False)
    reason = Column(Text)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    employee = relationship("Employee", back_populates="salary_history")