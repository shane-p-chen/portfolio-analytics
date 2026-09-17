import yfinance as yf
import math

## Portfolio Analysis
def get_historical_prices(ticker, start_date, end_date, interval="1d"):
    company = yf.Ticker(ticker)
    history = company.history(start = start_date, end = end_date, interval = interval)
    return history["Close"]

def get_multiple_prices(tickers, start_date, end_date):
    companies = yf.download(tickers, start_date, end_date, auto_adjust=True)
    close_prices = companies['Close']
    missing_tickers = [
        ticker for ticker in tickers
        if ticker not in close_prices.columns
        or close_prices[ticker].dropna().empty
    ]
    if missing_tickers:
        raise ValueError(
            f"No market data found for: {', '.join(missing_tickers)}"
        )
    return close_prices

def calculate_daily_returns(prices):
    return prices.pct_change().dropna()

def validate_weights(weights):
    if not all(0 <= weight <= 1 for weight in weights.values()):
        return False
    return math.isclose(sum(weights.values()), 1.0)

def validate_tickers(asset_returns, weights):
    return set(asset_returns.columns) == set(weights.keys())

def calculate_portfolio_daily_returns(asset_returns, weights):
    if not validate_weights(weights):
        raise ValueError("Portfolio weights must sum to 1.0")

    if not validate_tickers(asset_returns, weights):
        raise ValueError("Portfolio tickers and weight keys must match")

    weighted_returns = asset_returns.copy()
    for ticker, weight in weights.items():
        weighted_returns[ticker] = weighted_returns[ticker] * weight

    return weighted_returns.sum(axis=1)

def calculate_asset_contributions(asset_returns, weights):
    if not validate_weights(weights):
        raise ValueError("Portfolio weights must sum to 1.0")
    if not validate_tickers(asset_returns, weights):
        raise ValueError("Portfolio tickers and weight keys must match")

    weighted_returns = asset_returns.copy()
    for ticker, weight in weights.items():
        weighted_returns[ticker] = weighted_returns[ticker] * weight

    portfolio_daily_returns = weighted_returns.sum(axis = 1)
    portfolio_growth = (1 + portfolio_daily_returns).cumprod()
    previous_growth = portfolio_growth.shift(1, fill_value=1)

    contributions = {}
    for ticker in weights:
        contribution = (
            previous_growth * weighted_returns[ticker]
        ).sum()

        contributions[ticker] = contribution

    return contributions

def calculate_cumulative_returns(portfolio_daily_returns):
    portfolio_cumulative_returns = (1 + portfolio_daily_returns).cumprod() - 1
    return portfolio_cumulative_returns

def calculate_volatility(portfolio_daily_returns):
    daily_volatility = portfolio_daily_returns.std()
    annual_volatility = daily_volatility * math.sqrt(252)
    return annual_volatility

def calculate_sharpe_ratio(portfolio_daily_returns, risk_free_rate = 0.04):
    annual_return = portfolio_daily_returns.mean() * 252
    annual_volatility = calculate_volatility(portfolio_daily_returns)

    if math.isnan(annual_volatility):
        raise ValueError(
            "Sharpe ratio cannot be calculated: insufficient return data to compute volatility"
        )

    if math.isclose(annual_volatility, 0.0):
        raise ValueError("Sharpe ratio cannot be calculated when annual volatility is 0")

    sharpe_ratio = (annual_return - risk_free_rate) / annual_volatility
    return sharpe_ratio

def calculate_max_drawdown(portfolio_daily_returns):
    portfolio_value = 1 + calculate_cumulative_returns(portfolio_daily_returns)
    running_peak = portfolio_value.cummax()
    drawdowns = portfolio_value / running_peak - 1
    return drawdowns.min()

def get_benchmark_returns(start_date, end_date, ticker="^GSPC"):
    prices = get_historical_prices(
        ticker,
        start_date,
        end_date
    )
    daily_returns = calculate_daily_returns(prices)

    cumulative_returns = calculate_cumulative_returns(daily_returns)

    return cumulative_returns

## Stock search
def search_stocks(query):
    search = yf.Search(query, max_results = 10)
    quotes = search.quotes

    results =[]

    for quote in quotes:
        if quote.get("quoteType") == "EQUITY":
            results.append({
                "symbol": quote.get("symbol"),
                "name": quote.get("shortname")
            })
    if not results and query != query.lower():
        search = yf.Search(query.lower(), max_results = 10)
        quotes = search.quotes

        for quote in quotes:
            if quote.get("quoteType") == "EQUITY":
                results.append({
                    "symbol": quote.get("symbol"),
                    "name": quote.get("shortname")
                })

    return results