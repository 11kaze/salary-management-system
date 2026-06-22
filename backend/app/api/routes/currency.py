# app/api/routes/currency.py
from fastapi import APIRouter, Depends
from decimal import Decimal
from app.api.deps import get_current_user
from app.services.currency import currency_service

router = APIRouter(prefix="/currency", tags=["currency"])

@router.get("/convert")
async def convert_currency(
    amount: Decimal,
    from_currency: str,
    to_currency: str,
    current_user: str = Depends(get_current_user)
):
    if from_currency == to_currency:
        return {"converted_amount": amount, "rate": 1.0}
    
    rate = await currency_service.get_exchange_rate(from_currency, to_currency)
    converted = amount * rate
    
    return {
        "original_amount": amount,
        "converted_amount": converted,
        "rate": rate,
        "from_currency": from_currency,
        "to_currency": to_currency
    }