from database.db_manager import DatabaseManager
from models.company import CompanyCreate


class CompanyRepository:
    def __init__(self, db: DatabaseManager) -> None:
        self.db = db

    def list_companies(self) -> list[dict]:
        q = """
        SELECT c.*, s.name AS sector_name
        FROM companies c
        LEFT JOIN sectors s ON s.id = c.sector_id
        ORDER BY c.name
        """
        with self.db.connect() as conn:
            return [dict(r) for r in conn.execute(q).fetchall()]

    def list_sectors(self) -> list[dict]:
        with self.db.connect() as conn:
            return [dict(r) for r in conn.execute("SELECT * FROM sectors ORDER BY name").fetchall()]

    def create_company(self, data: CompanyCreate) -> None:
        with self.db.connect() as conn:
            conn.execute(
                """INSERT INTO companies(code,name,sector_id,sub_sector,currency,country,notes,watchlist)
                VALUES(?,?,?,?,?,?,?,?)""",
                (data.code, data.name, data.sector_id, data.sub_sector, data.currency, data.country, data.notes, int(data.watchlist)),
            )
            conn.commit()

    def update_company(self, company_id: int, data: CompanyCreate) -> None:
        with self.db.connect() as conn:
            conn.execute(
                """UPDATE companies SET code=?,name=?,sector_id=?,sub_sector=?,currency=?,country=?,notes=?,watchlist=?
                WHERE id=?""",
                (data.code, data.name, data.sector_id, data.sub_sector, data.currency, data.country, data.notes, int(data.watchlist), company_id),
            )
            conn.commit()

    def delete_company(self, company_id: int) -> None:
        with self.db.connect() as conn:
            conn.execute("DELETE FROM companies WHERE id=?", (company_id,))
            conn.commit()

    def company_snapshot(self, company_id: int) -> dict:
        q = """
        SELECT c.*, s.name AS sector_name, p.close_price, p.market_cap
        FROM companies c
        LEFT JOIN sectors s ON s.id = c.sector_id
        LEFT JOIN price_data p ON p.company_id = c.id
        WHERE c.id=?
        ORDER BY p.price_date DESC
        LIMIT 1
        """
        with self.db.connect() as conn:
            row = conn.execute(q, (company_id,)).fetchone()
            return dict(row) if row else {}

    def periods(self, company_id: int, period_type: str = "Y") -> list[dict]:
        with self.db.connect() as conn:
            rows = conn.execute(
                "SELECT * FROM financial_periods WHERE company_id=? AND period_type=? ORDER BY fiscal_year, fiscal_quarter",
                (company_id, period_type),
            ).fetchall()
            return [dict(r) for r in rows]

    def financial_rows(self, period_id: int) -> dict:
        with self.db.connect() as conn:
            income = conn.execute("SELECT * FROM income_statements WHERE period_id=?", (period_id,)).fetchone()
            balance = conn.execute("SELECT * FROM balance_sheets WHERE period_id=?", (period_id,)).fetchone()
            cash = conn.execute("SELECT * FROM cash_flows WHERE period_id=?", (period_id,)).fetchone()
        return {
            "income": dict(income) if income else {},
            "balance": dict(balance) if balance else {},
            "cash": dict(cash) if cash else {},
        }

    def dashboard_stats(self) -> dict:
        with self.db.connect() as conn:
            total = conn.execute("SELECT COUNT(*) c FROM companies").fetchone()["c"]
            watch = conn.execute("SELECT COUNT(*) c FROM companies WHERE watchlist=1").fetchone()["c"]
            missing = conn.execute(
                "SELECT COUNT(*) c FROM companies c LEFT JOIN cash_flows cf ON 1=1 LEFT JOIN financial_periods fp ON fp.id=cf.period_id AND fp.company_id=c.id WHERE cf.id IS NULL"
            ).fetchone()["c"]
            updated = conn.execute("SELECT name FROM companies ORDER BY created_at DESC LIMIT 5").fetchall()
        return {
            "total_companies": total,
            "watchlist_count": watch,
            "missing_data": missing,
            "recent": [r["name"] for r in updated],
        }
