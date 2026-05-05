from database.db_manager import DatabaseManager


def seed_demo_data(db: DatabaseManager) -> None:
    with db.connect() as conn:
        count = conn.execute("SELECT COUNT(*) AS c FROM companies").fetchone()["c"]
        if count > 0:
            return

        conn.execute("INSERT INTO sectors(name) VALUES ('Sanayi'), ('Perakende')")
        conn.execute(
            """
            INSERT INTO companies(code,name,sector_id,sub_sector,currency,country,notes,watchlist)
            VALUES
            ('DEMO1','Demo Sanayi A.Ş.',1,'Otomotiv Yan Sanayi','TRY','Türkiye','Demo eğitim şirketi',1),
            ('DEMO2','Demo Perakende A.Ş.',2,'Gıda Perakende','TRY','Türkiye','Demo eğitim şirketi',0)
            """
        )
        company_ids = [r["id"] for r in conn.execute("SELECT id FROM companies ORDER BY id").fetchall()]

        for cid in company_ids:
            for year, rev, ebitda, net in [(2021, 1200, 180, 90), (2022, 1600, 260, 130), (2023, 2100, 350, 175), (2024, 2500, 390, 210), (2025, 2900, 470, 260)]:
                conn.execute(
                    "INSERT INTO financial_periods(company_id,period_type,period_label,fiscal_year) VALUES(?,?,?,?)",
                    (cid, "Y", str(year), year),
                )
                pid = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
                conn.execute(
                    """INSERT INTO income_statements(period_id,revenue,cost_of_sales,gross_profit,operating_profit,ebitda,net_income,shares_outstanding)
                    VALUES(?,?,?,?,?,?,?,?)""",
                    (pid, rev, rev * 0.62, rev * 0.38, rev * 0.17, ebitda, net, 100),
                )
                debt = 300 if cid == company_ids[0] else 180
                conn.execute(
                    """INSERT INTO balance_sheets(period_id,cash_and_equivalents,total_assets,total_liabilities,short_term_debt,long_term_debt,total_equity,current_assets,current_liabilities,inventory,receivables,payables)
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (pid, 220, rev * 1.8, rev * 0.9, debt * 0.4, debt * 0.6, rev * 0.9, rev * 0.7, rev * 0.45, rev * 0.12, rev * 0.14, rev * 0.11),
                )
                conn.execute(
                    """INSERT INTO cash_flows(period_id,operating_cash_flow,capex,investing_cash_flow,financing_cash_flow,free_cash_flow)
                    VALUES(?,?,?,?,?,?)""",
                    (pid, net * 1.1, -net * 0.45, -net * 0.55, net * 0.15, net * 0.65),
                )

            conn.execute(
                "INSERT INTO price_data(company_id,price_date,close_price,market_cap) VALUES(?,?,?,?)",
                (cid, "2026-03-31", 125.5 + cid, 12000 + cid * 500),
            )
            conn.execute(
                "INSERT INTO notes(company_id,content) VALUES(?,?)",
                (cid, "Demo not: Bu veriler yatırım tavsiyesi değildir."),
            )
            conn.execute(
                """INSERT INTO thesis_cards(company_id,why_interesting,catalyst,main_risk,invalidation,stance)
                VALUES(?,?,?,?,?,?)""",
                (cid, "Marj iyileşme trendi", "İhracat artışı", "Talep daralması", "2 çeyrek marj bozulması", "Nötr-Pozitif"),
            )
        conn.commit()
