# app/services/currency.py
import httpx
from decimal import Decimal
from app.config import settings
from functools import lru_cache
import asyncio

class CurrencyService:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
    
    async def get_exchange_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """Fetch live exchange rate"""
        if from_currency == to_currency:
            return Decimal("1.0")
        
        cache_key = f"{from_currency}_{to_currency}"
        # Check cache
        if cache_key in self.cache:
            rate, timestamp = self.cache[cache_key]
            import time
            if time.time() - timestamp < self.cache_ttl:
                return rate
        
        # Fetch from API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{settings.FX_API_URL}/{to_currency}")
                data = response.json()
                rate = Decimal(str(data["rates"][to_currency]))
                
                # Cache it
                import time
                self.cache[cache_key] = (rate, time.time())
                
                return rate
        except Exception as e:
            # Fallback to 1.0 if API fails
            return Decimal("1.0")
    
    async def convert(self, amount: Decimal, from_currency: str, to_currency: str) -> Decimal:
        """Convert amount from one currency to another"""
        rate = await self.get_exchange_rate(from_currency, to_currency)
        return amount * rate

currency_service = CurrencyService()