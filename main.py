# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
# ADDED: DimTime imported here
from app.models import FactSales, DimOrganization, DimTime 
# ADDED: TimeSeriesMetrics imported here
from app.schemas import DepartmentMetrics, TimeSeriesMetrics 

app = FastAPI(title="Enterprise BI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Enterprise BI API is running live."}

@app.get("/api/v1/metrics/departments", response_model=List[DepartmentMetrics])
def get_department_metrics(db: Session = Depends(get_db)):
    results = (
        db.query(
            DimOrganization.region,
            DimOrganization.department_name,
            func.count(FactSales.sale_id).label("total_transactions"),
            func.sum(FactSales.revenue).label("total_revenue"),
            func.sum(FactSales.margin).label("total_margin")
        )
        .join(FactSales, DimOrganization.org_id == FactSales.org_id)
        .group_by(DimOrganization.region, DimOrganization.department_name)
        .order_by(func.sum(FactSales.revenue).desc())
        .all()
    )
    return results

# --- NEW TIME SERIES ENDPOINT ---
@app.get("/api/v1/metrics/timeseries", response_model=List[TimeSeriesMetrics])
def get_time_series_metrics(db: Session = Depends(get_db)):
    """
    Retrieves revenue and margin aggregated by year and month 
    to power historical line charts.
    """
    results = (
        db.query(
            DimTime.year,
            DimTime.month,
            func.sum(FactSales.revenue).label("revenue"),
            func.sum(FactSales.margin).label("margin")
        )
        .join(FactSales, DimTime.date_key == FactSales.date_key)
        .group_by(DimTime.year, DimTime.month)
        .order_by(DimTime.year, DimTime.month)
        .all()
    )
    return results