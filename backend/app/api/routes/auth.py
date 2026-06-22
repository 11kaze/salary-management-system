# app/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# Hardcoded HR Manager credentials for the assessment
HR_EMAIL = "hr@acme.com"
HR_PASSWORD = "admin123"

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != HR_EMAIL or form_data.password != HR_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.encode(
        {"sub": form_data.username, "exp": datetime.utcnow() + access_token_expires},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return {"access_token": access_token, "token_type": "bearer"}