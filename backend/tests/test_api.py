import pandas as pd
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

VALID_PAYLOAD = {
    "tickers": ["AAPL", "MSFT"],
    "weights": {"AAPL": 0.5, "MSFT": 0.5},
    "start_date": "2024-01-01",
    "end_date": "2024-01-05",
}


@pytest.fixture
def mock_benchmark_returns(sample_price_frame):
    dates = sample_price_frame.index[1:]
    return pd.Series([0.01, 0.02, -0.01], index=dates)


def test_root_returns_message():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Portfolio Analytics API"}


def test_search_stocks_returns_results(monkeypatch):
    def fake_search_stocks(query):
        return [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "AAPL.TO", "name": None},
        ]

    monkeypatch.setattr("main.search_stocks", fake_search_stocks)

    response = client.get("/stocks/search", params={"query": "AAPL"})

    assert response.status_code == 200
    assert response.json() == [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "AAPL.TO", "name": None},
    ]


def test_search_stocks_requires_query_param():
    response = client.get("/stocks/search")
    assert response.status_code == 422


def test_analyze_portfolio_happy_path(monkeypatch, sample_price_frame, mock_benchmark_returns):
    monkeypatch.setattr(
        "main.get_multiple_prices",
        lambda tickers, start_date, end_date: sample_price_frame,
    )
    monkeypatch.setattr(
        "main.get_benchmark_returns",
        lambda start_date, end_date, benchmark: mock_benchmark_returns,
    )

    response = client.post("/portfolio/analyze", json=VALID_PAYLOAD)

    assert response.status_code == 200
    data = response.json()

    for key in (
        "total_return",
        "annual_volatility",
        "sharpe_ratio",
        "max_drawdown",
        "performance_history",
        "asset_contributions",
    ):
        assert key in data

    for field in ("total_return", "annual_volatility", "sharpe_ratio", "max_drawdown"):
        assert isinstance(data[field], float)

    assert len(data["performance_history"]) == 3
    for point in data["performance_history"]:
        assert set(point.keys()) == {"date", "return", "benchmark_return"}
        assert point["benchmark_return"] is not None

    assert set(data["asset_contributions"].keys()) == {"AAPL", "MSFT"}


def test_analyze_portfolio_rejects_start_date_after_end_date():
    payload = {**VALID_PAYLOAD, "start_date": "2024-01-05", "end_date": "2024-01-01"}

    response = client.post("/portfolio/analyze", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Start date must be before end date"


def test_analyze_portfolio_rejects_empty_tickers():
    payload = {**VALID_PAYLOAD, "tickers": []}

    response = client.post("/portfolio/analyze", json=payload)

    assert response.status_code == 422


def test_analyze_portfolio_rejects_invalid_benchmark():
    payload = {**VALID_PAYLOAD, "benchmark": "^BOGUS"}

    response = client.post("/portfolio/analyze", json=payload)

    assert response.status_code == 422


def test_analyze_portfolio_returns_400_when_prices_unavailable(monkeypatch):
    def fake_get_multiple_prices(tickers, start_date, end_date):
        raise ValueError("No market data found for: BADTICKER")

    monkeypatch.setattr("main.get_multiple_prices", fake_get_multiple_prices)

    response = client.post("/portfolio/analyze", json=VALID_PAYLOAD)

    assert response.status_code == 400
    assert response.json()["detail"] == "No market data found for: BADTICKER"


def test_analyze_portfolio_returns_400_when_prices_empty(monkeypatch):
    monkeypatch.setattr(
        "main.get_multiple_prices",
        lambda tickers, start_date, end_date: pd.DataFrame(),
    )

    response = client.post("/portfolio/analyze", json=VALID_PAYLOAD)

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "No market data found for the selected tickers and date range"
    )


def test_analyze_portfolio_returns_400_when_weights_dont_sum_to_one(
    monkeypatch, sample_price_frame
):
    monkeypatch.setattr(
        "main.get_multiple_prices",
        lambda tickers, start_date, end_date: sample_price_frame,
    )
    payload = {**VALID_PAYLOAD, "weights": {"AAPL": 0.6, "MSFT": 0.6}}

    response = client.post("/portfolio/analyze", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Portfolio weights must sum to 1.0"


def test_analyze_portfolio_returns_400_when_ticker_weight_keys_mismatch(
    monkeypatch, sample_price_frame
):
    monkeypatch.setattr(
        "main.get_multiple_prices",
        lambda tickers, start_date, end_date: sample_price_frame,
    )
    payload = {**VALID_PAYLOAD, "weights": {"AAPL": 0.5, "GOOGL": 0.5}}

    response = client.post("/portfolio/analyze", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Portfolio tickers and weight keys must match"


def test_analyze_portfolio_returns_400_when_sharpe_ratio_undefined(
    monkeypatch, sample_price_frame, mock_benchmark_returns
):
    short_prices = sample_price_frame.iloc[:2]

    monkeypatch.setattr(
        "main.get_multiple_prices",
        lambda tickers, start_date, end_date: short_prices,
    )
    monkeypatch.setattr(
        "main.get_benchmark_returns",
        lambda start_date, end_date, benchmark: mock_benchmark_returns,
    )

    response = client.post("/portfolio/analyze", json=VALID_PAYLOAD)

    assert response.status_code == 400
    assert "Sharpe ratio cannot be calculated" in response.json()["detail"]
