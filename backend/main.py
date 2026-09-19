from fastapi import FastAPI, HTTPException
from services.market_data import (
    get_multiple_prices,
    calculate_daily_returns,
    calculate_portfolio_daily_returns,
    calculate_cumulative_returns,
    calculate_volatility,
    calculate_sharpe_ratio,
    calculate_max_drawdown,
    search_stocks,
    get_benchmark_returns,
    calculate_asset_contributions,
)
from schemas import (
    PortfolioRequest,
    StockSearchResult,
    PortfolioAnalysisResponse,
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://portfolio-analytics-lemon.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root ():
    return {"message": "Portfolio Analytics API"}

@app.get("/stocks/search", response_model=list[StockSearchResult])
def search_stock_endpoint(query: str):
    return search_stocks(query)

@app.post("/portfolio/analyze", response_model=PortfolioAnalysisResponse)
def analyze_portfolio(request: PortfolioRequest):
    if request.start_date >= request.end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date must be before end date"
        )

    try:
        prices = get_multiple_prices(
            request.tickers,
            str(request.start_date),
            str(request.end_date)
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if prices.empty:
        raise HTTPException(
            status_code=400,
            detail="No market data found for the selected tickers and date range"
        )

    asset_returns = calculate_daily_returns(prices)

    try:
        portfolio_daily_returns = calculate_portfolio_daily_returns(
            asset_returns,
            request.weights
        )
        asset_contributions = calculate_asset_contributions(
            asset_returns,
            request.weights
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    cumulative_returns = calculate_cumulative_returns(
        portfolio_daily_returns
    )

    benchmark_returns = get_benchmark_returns(
            request.start_date,
            request.end_date,
            request.benchmark
        )
    
    benchmark_returns.index = benchmark_returns.index.strftime("%Y-%m-%d")
    performance_history = []

    for date, value in cumulative_returns.items():
        date_string = date.strftime("%Y-%m-%d")
        benchmark_value = benchmark_returns.get(date_string)

        performance_history.append({
            "date": date_string,
            "return": value,
            "benchmark_return": benchmark_value
        })

    annual_volatility = calculate_volatility(
        portfolio_daily_returns
    )

    try:
        sharpe_ratio = calculate_sharpe_ratio(
            portfolio_daily_returns,
            request.risk_free_rate
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    max_drawdown = calculate_max_drawdown(
        portfolio_daily_returns
    )

    return {
        "total_return": cumulative_returns.iloc[-1],
        "annual_volatility": annual_volatility,
        "sharpe_ratio": sharpe_ratio,
        "max_drawdown": max_drawdown,
        "performance_history": performance_history,
        "asset_contributions": asset_contributions,
    }