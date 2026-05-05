from pathlib import Path
import pandas as pd

from database.db_manager import DatabaseManager
from models.import_models import ImportResult


class ImportService:
    REQUIRED_COMPANY_COLUMNS = ["code", "name", "sector", "sub_sector", "currency", "country"]

    def __init__(self, db: DatabaseManager) -> None:
        self.db = db

    def import_companies(self, file_path: str) -> ImportResult:
        path = Path(file_path)
        df = pd.read_csv(path) if path.suffix.lower() == ".csv" else pd.read_excel(path)
        missing = [c for c in self.REQUIRED_COMPANY_COLUMNS if c not in df.columns]
        if missing:
            return ImportResult(status="error", message=f"Eksik zorunlu sütunlar: {missing}")

        inserted = 0
        with self.db.connect() as conn:
            for _, row in df.iterrows():
                if not row["code"] or not row["name"]:
                    continue
                sector_id = self._get_or_create_sector(conn, str(row["sector"]))
                try:
                    conn.execute(
                        """INSERT OR IGNORE INTO companies(code,name,sector_id,sub_sector,currency,country,watchlist)
                        VALUES(?,?,?,?,?,?,?)""",
                        (
                            str(row["code"]),
                            str(row["name"]),
                            sector_id,
                            str(row.get("sub_sector", "")),
                            str(row.get("currency", "TRY")),
                            str(row.get("country", "Türkiye")),
                            int(bool(row.get("watchlist", 0))),
                        ),
                    )
                    inserted += 1
                except Exception:
                    pass
            conn.execute(
                "INSERT INTO import_logs(source_file,import_type,status,detail) VALUES(?,?,?,?)",
                (str(path), "companies", "ok", f"{inserted} satır işlendi"),
            )
            conn.commit()
        return ImportResult(status="ok", message="İçe aktarma tamamlandı", row_count=inserted)

    def _get_or_create_sector(self, conn, sector_name: str) -> int:
        row = conn.execute("SELECT id FROM sectors WHERE name=?", (sector_name,)).fetchone()
        if row:
            return row["id"]
        conn.execute("INSERT INTO sectors(name) VALUES(?)", (sector_name,))
        return conn.execute("SELECT last_insert_rowid() as id").fetchone()["id"]
