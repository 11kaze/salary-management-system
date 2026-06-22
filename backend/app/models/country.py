from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Country(Base):
    __tablename__ = "countries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(3), unique=True, nullable=False)
    currency_code = Column(String(3), nullable=False)
    
    employees = relationship("Employee", back_populates="country")