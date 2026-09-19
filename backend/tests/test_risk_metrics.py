import math
import statistics

import pandas as pd
import pytest

from services.market_data import (
    calculate_max_drawdown,
    calculate_sharpe_ratio,
    calculate_volatility,
)

KNOWN_RETURNS = [0.01, 0.02, -0.01, 0.03, -0.02]


class TestCalculateVolatility:
    def test_known_series(self):
        result = calculate_volatility(pd.Series(KNOWN_RETURNS))
        expected = statistics.stdev(KNOWN_RETURNS) * math.sqrt(252)
        assert result == pytest.approx(expected)

    def test_zero_variance_returns_zero(self):
        result = calculate_volatility(pd.Series([0.01, 0.01, 0.01, 0.01]))
        assert result == pytest.approx(0.0)

    def test_single_value_returns_nan(self):
        # pandas .std() defaults to ddof=1 (sample std), which is
        # undefined for a single observation.
        result = calculate_volatility(pd.Series([0.02]))
        assert math.isnan(result)

    def test_empty_series_returns_nan(self):
        result = calculate_volatility(pd.Series([], dtype=float))
        assert math.isnan(result)


class TestCalculateSharpeRatio:
    def test_known_series_default_risk_free_rate(self):
        returns = pd.Series(KNOWN_RETURNS)
        result = calculate_sharpe_ratio(returns)
        expected_vol = statistics.stdev(KNOWN_RETURNS) * math.sqrt(252)
        expected = (statistics.mean(KNOWN_RETURNS) * 252 - 0.04) / expected_vol
        assert result == pytest.approx(expected)

    def test_default_risk_free_rate_matches_explicit_004(self):
        returns = pd.Series(KNOWN_RETURNS)
        assert calculate_sharpe_ratio(returns) == pytest.approx(
            calculate_sharpe_ratio(returns, risk_free_rate=0.04)
        )

    def test_custom_risk_free_rate(self):
        returns = pd.Series(KNOWN_RETURNS)
        result = calculate_sharpe_ratio(returns, risk_free_rate=0.02)
        expected_vol = statistics.stdev(KNOWN_RETURNS) * math.sqrt(252)
        expected = (statistics.mean(KNOWN_RETURNS) * 252 - 0.02) / expected_vol
        assert result == pytest.approx(expected)

    def test_raises_on_zero_volatility(self):
        returns = pd.Series([0.001, 0.001, 0.001, 0.001])
        with pytest.raises(
            ValueError,
            match="Sharpe ratio cannot be calculated when annual volatility is 0",
        ):
            calculate_sharpe_ratio(returns)

    def test_raises_when_return_series_is_too_short_for_volatility(self):
        # A single observation makes volatility NaN (pandas .std()
        # with ddof=1 is undefined for n=1); this must raise a clear
        # error instead of silently returning NaN.
        with pytest.raises(
            ValueError,
            match="Sharpe ratio cannot be calculated: insufficient return data",
        ):
            calculate_sharpe_ratio(pd.Series([0.02]))

    def test_raises_on_empty_return_series(self):
        with pytest.raises(
            ValueError,
            match="Sharpe ratio cannot be calculated: insufficient return data",
        ):
            calculate_sharpe_ratio(pd.Series([], dtype=float))


class TestCalculateMaxDrawdown:
    def test_known_rise_fall_sequence(self):
        result = calculate_max_drawdown(pd.Series([0.10, -0.20, 0.05]))
        assert result == pytest.approx(-0.20)

    def test_monotonic_increase_has_zero_drawdown(self):
        result = calculate_max_drawdown(pd.Series([0.05, 0.03, 0.02]))
        assert result == pytest.approx(0.0)

    def test_monotonic_decrease_equals_decline_from_peak(self):
        # The initial investment of 1.0 remains the peak, so all three
        # losses contribute to the drawdown.
        result = calculate_max_drawdown(pd.Series([-0.10, -0.10, -0.10]))
        expected = (0.9 ** 3) - 1
        assert result == pytest.approx(expected)

    def test_single_negative_return_drawdown_equals_loss(self):
        result = calculate_max_drawdown(pd.Series([-0.05]))
        assert result == pytest.approx(-0.05)

    def test_initial_loss_followed_by_partial_recovery(self):
        result = calculate_max_drawdown(pd.Series([-0.10, 0.05]))
        assert result == pytest.approx(-0.10)

    def test_later_peak_above_initial_investment(self):
        result = calculate_max_drawdown(pd.Series([-0.10, 0.50, -0.20]))
        assert result == pytest.approx(-0.20)

    def test_all_zero_returns_has_zero_drawdown(self):
        result = calculate_max_drawdown(pd.Series([0.0, 0.0, 0.0]))
        assert result == pytest.approx(0.0)
