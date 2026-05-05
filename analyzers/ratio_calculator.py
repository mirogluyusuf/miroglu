def safe_div(a, b):
    if a is None or b in (None, 0):
        return None
    return a / b


def calculate_ratios(current: dict, previous: dict | None, price: float | None, market_cap: float | None) -> dict:
    i = current.get("income", {})
    b = current.get("balance", {})
    c = current.get("cash", {})
    p_i = (previous or {}).get("income", {})

    revenue = i.get("revenue")
    gross_profit = i.get("gross_profit")
    operating_profit = i.get("operating_profit")
    ebitda = i.get("ebitda")
    net_income = i.get("net_income")

    total_debt = (b.get("short_term_debt") or 0) + (b.get("long_term_debt") or 0)
    cash = b.get("cash_and_equivalents")
    equity = b.get("total_equity")
    assets = b.get("total_assets")
    shares = i.get("shares_outstanding")
    fcf = c.get("free_cash_flow") if c.get("free_cash_flow") is not None else (c.get("operating_cash_flow") or 0) + (c.get("capex") or 0)

    ratios = {
        "ciro_buyumesi": safe_div((revenue or 0) - (p_i.get("revenue") or 0), p_i.get("revenue")),
        "brut_kar": gross_profit,
        "brut_kar_marji": safe_div(gross_profit, revenue),
        "faaliyet_kari": operating_profit,
        "faaliyet_kar_marji": safe_div(operating_profit, revenue),
        "favok": ebitda,
        "favok_marji": safe_div(ebitda, revenue),
        "net_kar": net_income,
        "net_kar_marji": safe_div(net_income, revenue),
        "cari_oran": safe_div(b.get("current_assets"), b.get("current_liabilities")),
        "likidite_orani": safe_div((b.get("current_assets") or 0) - (b.get("inventory") or 0), b.get("current_liabilities")),
        "borc_ozkaynak": safe_div(total_debt, equity),
        "net_borc_favok": safe_div(total_debt - (cash or 0), ebitda),
        "roe": safe_div(net_income, equity),
        "roa": safe_div(net_income, assets),
        "roic": safe_div(net_income, (equity or 0) + total_debt),
        "serbest_nakit_akisi": fcf,
        "hisse_basi_kar": safe_div(net_income, shares),
        "hisse_basi_defter": safe_div(equity, shares),
        "fk": safe_div(price, safe_div(net_income, shares)),
        "pddd": safe_div(market_cap, equity),
        "fd_favok": safe_div((market_cap or 0) + total_debt - (cash or 0), ebitda),
        "temettu_verimi": safe_div(i.get("dividend_paid"), market_cap),
        "isletme_sermayesi": (b.get("current_assets") or 0) - (b.get("current_liabilities") or 0),
        "stok_devir_hizi": safe_div(i.get("cost_of_sales"), b.get("inventory")),
        "alacak_tahsil_suresi": safe_div((b.get("receivables") or 0) * 365, revenue),
        "borc_odeme_suresi": safe_div((b.get("payables") or 0) * 365, i.get("cost_of_sales")),
    }
    return ratios


def cagr(first: float | None, last: float | None, years: int) -> float | None:
    if first in (None, 0) or last is None or years <= 0:
        return None
    return (last / first) ** (1 / years) - 1
