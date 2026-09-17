from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

Benchmark = Literal["^GSPC", "^NDX", "^DJI"]


class PortfolioRequest(BaseModel):
    tickers: list[str] = Field(min_length=1)
    weights: dict[str, float]
    start_date: date
    end_date: date
    risk_free_rate: float = 0.04
    benchmark: Benchmark = "^GSPC"


class StockSearchResult(BaseModel):
    symbol: str
    name: str | None = None


class PerformancePoint(BaseModel):
    date: str
    return_: float = Field(alias="return")
    benchmark_return: float | None
    model_config = {"populate_by_name": True}


class PortfolioAnalysisResponse(BaseModel):
    total_return: float
    annual_volatility: float
    sharpe_ratio: float
    max_drawdown: float
    performance_history: list[PerformancePoint]
    asset_contributions: dict[str, float]
