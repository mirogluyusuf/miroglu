from analyzers.commentary_engine import generate_commentary
from analyzers.quality_analyzer import quality_score
from analyzers.ratio_calculator import calculate_ratios, cagr
from repositories.company_repository import CompanyRepository
from database.db_manager import DatabaseManager


class AnalysisService:
    def __init__(self, db: DatabaseManager, repo: CompanyRepository) -> None:
        self.db = db
        self.repo = repo

    def analyze_company(self, company_id: int) -> dict:
        periods = self.repo.periods(company_id, "Y")
        if not periods:
            return {"error": "Dönem verisi bulunamadı"}

        current_period = periods[-1]
        prev_period = periods[-2] if len(periods) > 1 else None

        current_data = self.repo.financial_rows(current_period["id"])
        prev_data = self.repo.financial_rows(prev_period["id"]) if prev_period else None
        snap = self.repo.company_snapshot(company_id)

        ratios = calculate_ratios(current_data, prev_data, snap.get("close_price"), snap.get("market_cap"))
        missing = len([k for k, v in ratios.items() if v is None])
        quality, flags = quality_score(current_data, len(ratios), missing)
        commentary = generate_commentary(ratios)

        first = self.repo.financial_rows(periods[0]["id"]).get("income", {}).get("revenue")
        last = current_data.get("income", {}).get("revenue")
        ratios["ciro_cagr"] = cagr(first, last, max(1, len(periods) - 1))

        score = self._score(ratios)
        return {
            "snapshot": snap,
            "current_period": current_period,
            "ratios": ratios,
            "quality": quality,
            "quality_flags": flags,
            "commentary": commentary,
            "score": score,
            "periods": periods,
        }

    def _score(self, r: dict) -> int:
        score = 50
        score += 10 if (r.get("ciro_buyumesi") or 0) > 0.1 else 0
        score += 10 if (r.get("favok_marji") or 0) > 0.15 else 0
        score += 10 if (r.get("net_kar_marji") or 0) > 0.1 else 0
        score += 10 if (r.get("roe") or 0) > 0.15 else 0
        score += 10 if (r.get("serbest_nakit_akisi") or 0) > 0 else -10
        score -= 10 if (r.get("borc_ozkaynak") or 0) > 1 else 0
        return max(0, min(100, score))

    def dashboard_data(self) -> dict:
        stats = self.repo.dashboard_stats()
        companies = self.repo.list_companies()
        scored = []
        for c in companies:
            a = self.analyze_company(c["id"])
            if "error" not in a:
                scored.append({"name": c["name"], "score": a["score"], "risk": len(a["commentary"]["riskler"])})
        top = sorted(scored, key=lambda x: x["score"], reverse=True)[:5]
        risky = sorted(scored, key=lambda x: x["risk"], reverse=True)[:5]
        stats.update({"top": top, "risky": risky})
        return stats
