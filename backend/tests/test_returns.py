import pandas as pd
import pytest

from services.market_data import (
    calculate_cumulative_returns,
    calculate_daily_returns,
    calculate_portfolio_daily_returns,
)


class TestCalculateDailyReturns:
    def test_series_known_prices(self, sample_prices):
        result = calculate_daily_returns(sample_prices)
        assert result.tolist() == pytest.approx([0.10, 0.10, -0.10])

    def test_dataframe_known_prices(self, sample_price_frame):
        result = calculate_daily_returns(sample_price_frame)
        assert result["AAPL"].tolist() == pytest.approx([0.10, 0.10, -0.10])
        assert result["MSFT"].tolist() == pytest.approx([0.10, -0.10, 0.10])

    def test_nan_price_drops_entire_row_for_all_tickers(self):
        # A missing price for ONE ticker on one day makes that day's
        # return NaN for that ticker on both the day of and the day
        # after the gap. DataFrame.dropna() then drops those whole
        # rows, discarding the OTHER ticker's valid same-day returns
        # too, not just the affected ticker's.
        dates = pd.date_range("2024-01-01", periods=4)
        prices = pd.DataFrame(
            {
                "AAPL": [100, 110, 121, 108.9],
                "MSFT": [50, 55, None, 54.45],
            },
            index=dates,
        )
        result = calculate_daily_returns(prices)
        assert len(result) == 1
        assert result["AAPL"].iloc[0] == pytest.approx(0.10)
        assert result["MSFT"].iloc[0] == pytest.approx(0.10)

    def test_single_row_prices_returns_empty(self):
        prices = pd.Series([100.0], index=pd.date_range("2024-01-01", periods=1))
        result = calculate_daily_returns(prices)
        assert len(result) == 0

    def test_empty_prices_returns_empty(self):
        result = calculate_daily_returns(pd.Series([], dtype=float))
        assert len(result) == 0


class TestCalculatePortfolioDailyReturns:
    def test_balanced_weights(self, sample_asset_returns, balanced_weights):
        result = calculate_portfolio_daily_returns(sample_asset_returns, balanced_weights)
        assert result.tolist() == pytest.approx([0.06, -0.01, 0.005])

    def test_uneven_weights(self, sample_asset_returns, uneven_weights):
        result = calculate_portfolio_daily_returns(sample_asset_returns, uneven_weights)
        assert result.tolist() == pytest.approx([0.076, -0.026, 0.011])

    def test_single_ticker_weight_one_equals_its_own_returns(self, sample_asset_returns_single):
        result = calculate_portfolio_daily_returns(sample_asset_returns_single, {"AAPL": 1.0})
        assert result.tolist() == pytest.approx([0.10, -0.05, 0.02])

    def test_raises_on_invalid_weights(self, sample_asset_returns):
        with pytest.raises(ValueError, match="Portfolio weights must sum to 1.0"):
            calculate_portfolio_daily_returns(sample_asset_returns, {"AAPL": 0.5, "MSFT": 0.4})

    def test_raises_on_ticker_mismatch(self, sample_asset_returns):
        with pytest.raises(ValueError, match="Portfolio tickers and weight keys must match"):
            calculate_portfolio_daily_returns(sample_asset_returns, {"AAPL": 0.5, "GOOG": 0.5})

    def test_raises_on_out_of_range_weights(self, sample_asset_returns):
        # Sums to 1.0 and tickers match, but individual weights are
        # outside [0, 1] (a leveraged/short allocation).
        with pytest.raises(ValueError, match="Portfolio weights must sum to 1.0"):
            calculate_portfolio_daily_returns(sample_asset_returns, {"AAPL": 1.5, "MSFT": -0.5})

    def test_weights_error_takes_precedence_over_ticker_mismatch(self, sample_asset_returns):
        # Both invalid: weights don't sum to 1 AND tickers don't match.
        # validate_weights is checked first, so its message wins.
        with pytest.raises(ValueError, match="Portfolio weights must sum to 1.0"):
            calculate_portfolio_daily_returns(sample_asset_returns, {"AAPL": 0.5, "GOOG": 0.6})


class TestCalculateCumulativeReturns:
    def test_compounding_not_summing(self):
        # +10% then -10% compounds to -1%, not the naive sum of 0%.
        result = calculate_cumulative_returns(pd.Series([0.10, -0.10]))
        assert result.iloc[-1] == pytest.approx(-0.01)

    def test_all_zero_returns(self):
        result = calculate_cumulative_returns(pd.Series([0.0, 0.0, 0.0]))
        assert result.tolist() == pytest.approx([0.0, 0.0, 0.0])

    def test_single_value(self):
        result = calculate_cumulative_returns(pd.Series([0.05]))
        assert result.tolist() == pytest.approx([0.05])

    def test_empty_series(self):
        result = calculate_cumulative_returns(pd.Series([], dtype=float))
        assert len(result) == 0
