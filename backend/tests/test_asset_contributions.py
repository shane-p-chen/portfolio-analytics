import pytest

from services.market_data import (
    calculate_asset_contributions,
    calculate_cumulative_returns,
    calculate_portfolio_daily_returns,
)


class TestCalculateAssetContributions:
    def test_raises_on_invalid_weights(self, sample_asset_returns):
        with pytest.raises(ValueError, match="Portfolio weights must sum to 1.0"):
            calculate_asset_contributions(sample_asset_returns, {"AAPL": 0.5, "MSFT": 0.4})

    def test_raises_on_ticker_mismatch(self, sample_asset_returns):
        with pytest.raises(ValueError, match="Portfolio tickers and weight keys must match"):
            calculate_asset_contributions(sample_asset_returns, {"AAPL": 0.5, "GOOG": 0.5})

    def test_raises_on_out_of_range_weights(self, sample_asset_returns):
        # Sums to 1.0 and tickers match, but individual weights are
        # outside [0, 1] (a leveraged/short allocation).
        with pytest.raises(ValueError, match="Portfolio weights must sum to 1.0"):
            calculate_asset_contributions(sample_asset_returns, {"AAPL": 1.5, "MSFT": -0.5})

    def test_two_ticker_known_example(self, sample_asset_returns, balanced_weights):
        result = calculate_asset_contributions(sample_asset_returns, balanced_weights)
        assert result["AAPL"] == pytest.approx(0.033994)
        assert result["MSFT"] == pytest.approx(0.020653)

    def test_contributions_sum_to_total_portfolio_return(self, sample_asset_returns, uneven_weights):
        # The contributions should always add up to the total portfolio
        # cumulative return -- this checks the decomposition is
        # internally consistent, not just correct for one example.
        contributions = calculate_asset_contributions(sample_asset_returns, uneven_weights)
        total_return = calculate_cumulative_returns(
            calculate_portfolio_daily_returns(sample_asset_returns, uneven_weights)
        ).iloc[-1]
        assert sum(contributions.values()) == pytest.approx(total_return)

    def test_single_ticker_contribution_equals_total_return(self, sample_asset_returns_single):
        weights = {"AAPL": 1.0}
        contributions = calculate_asset_contributions(sample_asset_returns_single, weights)
        total_return = calculate_cumulative_returns(
            calculate_portfolio_daily_returns(sample_asset_returns_single, weights)
        ).iloc[-1]
        assert contributions["AAPL"] == pytest.approx(total_return)

    def test_zero_weight_ticker_contributes_zero(self, sample_asset_returns):
        weights = {"AAPL": 1.0, "MSFT": 0.0}
        contributions = calculate_asset_contributions(sample_asset_returns, weights)
        assert contributions["MSFT"] == pytest.approx(0.0, abs=1e-9)
        total_return = calculate_cumulative_returns(
            calculate_portfolio_daily_returns(sample_asset_returns, weights)
        ).iloc[-1]
        assert contributions["AAPL"] == pytest.approx(total_return)
