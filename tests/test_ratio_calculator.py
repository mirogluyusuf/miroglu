from analyzers.ratio_calculator import calculate_ratios


def test_calculate_ratios_basic():
    current = {
        "income": {"revenue": 100, "gross_profit": 40, "operating_profit": 20, "ebitda": 25, "net_income": 10, "shares_outstanding": 5, "cost_of_sales": 60},
        "balance": {"short_term_debt": 10, "long_term_debt": 10, "cash_and_equivalents": 5, "total_equity": 50, "total_assets": 100, "current_assets": 30, "current_liabilities": 20, "inventory": 5, "receivables": 10, "payables": 8},
        "cash": {"free_cash_flow": 7, "operating_cash_flow": 9, "capex": -2},
    }
    previous = {"income": {"revenue": 80}}
    ratios = calculate_ratios(current, previous, 20, 120)
    assert ratios["brut_kar_marji"] == 0.4
