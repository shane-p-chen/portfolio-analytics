import pandas as pd
import pytest


@pytest.fixture
def balanced_weights():
    return {"AAPL": 0.5, "MSFT": 0.5}


@pytest.fixture
def uneven_weights():
    return {"AAPL": 0.7, "MSFT": 0.3}


@pytest.fixture
def sample_prices():
    dates = pd.date_range("2024-01-01", periods=4)
    return pd.Series([100, 110, 121, 108.9], index=dates)


@pytest.fixture
def sample_price_frame():
    dates = pd.date_range("2024-01-01", periods=4)
    return pd.DataFrame(
        {
            "AAPL": [100, 110, 121, 108.9],
            "MSFT": [50, 55, 49.5, 54.45],
        },
        index=dates,
    )


@pytest.fixture
def sample_asset_returns():
    dates = pd.date_range("2024-01-02", periods=3)
    return pd.DataFrame(
        {
            "AAPL": [0.10, -0.05, 0.02],
            "MSFT": [0.02, 0.03, -0.01],
        },
        index=dates,
    )


@pytest.fixture
def sample_asset_returns_single():
    dates = pd.date_range("2024-01-02", periods=3)
    return pd.DataFrame({"AAPL": [0.10, -0.05, 0.02]}, index=dates)
