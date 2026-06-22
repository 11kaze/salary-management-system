from pydantic import BaseModel
from typing import List, Dict

class BulkImportResult(BaseModel):
    success_count: int
    created_count: int
    updated_count: int
    failed_count: int
    failed_rows: List[Dict]

class BulkUpdateResult(BaseModel):
    updated_count: int
    created_count: int
    failed_count: int
    failed_rows: List[Dict]