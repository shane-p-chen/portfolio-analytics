import pandas as pd

from services.market_data import validate_tickers, validate_weights


def test_validate_weights_exact_sum_returns_true():
    assert validate_weights({"AAPL": 0.5, "MSFT": 0.5}) is True


def test_validate_weights_float_imprecision_returns_true():
    assert validate_weights({"A": 0.1, "B": 0.2, "C": 0.7}) is True


def test_validate_weights_under_sum_returns_false():
    assert validate_weights({"AAPL": 0.5, "MSFT": 0.4}) is False


def test_validate_weights_over_sum_returns_false():
    assert validate_weights({"AAPL": 0.6, "MSFT": 0.6}) is False


def test_validate_weights_empty_returns_false():
    assert validate_weights({}) is False


def test_validate_weights_out_of_range_weights_return_false():
    # This app doesn't support short selling or leverage: every
    # individual weight must be within [0, 1], even if the weights
    # still sum to 1.0 (e.g. +150% / -50%).
    assert validate_weights({"A": 1.5, "B": -0.5}) is False


def test_validate_weights_boundary_zero_and_one_are_valid():
    assert validate_weights({"AAPL": 1.0, "MSFT": 0.0}) is True


def test_validate_tickers_matching_sets_returns_true():
    asset_returns = pd.DataFrame(columns=["AAPL", "MSFT"])
    assert validate_tickers(asset_returns, {"MSFT": 0.5, "AAPL": 0.5}) is True


def test_validate_tickers_extra_weight_ticker_returns_false():
    asset_returns = pd.DataFrame(columns=["AAPL", "MSFT"])
    weights = {"AAPL": 0.5, "MSFT": 0.3, "GOOG": 0.2}
    assert validate_tickers(asset_returns, weights) is False


def test_validate_tickers_extra_return_column_returns_false():
    asset_returns = pd.DataFrame(columns=["AAPL", "MSFT", "GOOG"])
    assert validate_tickers(asset_returns, {"AAPL": 0.5, "MSFT": 0.5}) is False


def test_validate_tickers_disjoint_sets_returns_false():
    asset_returns = pd.DataFrame(columns=["AAPL", "MSFT"])
    assert validate_tickers(asset_returns, {"GOOG": 0.5, "TSLA": 0.5}) is False


def test_validate_tickers_both_empty_returns_true():
    assert validate_tickers(pd.DataFrame(), {}) is True
