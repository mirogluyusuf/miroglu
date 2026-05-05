from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QFileDialog,
    QFormLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QSplitter,
    QTabWidget,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from models.company import CompanyCreate
from widgets.charts import TrendChart


class MainWindow(QMainWindow):
    def __init__(self, db, company_repo, analysis_service, import_service, export_service):
        super().__init__()
        self.db = db
        self.company_repo = company_repo
        self.analysis_service = analysis_service
        self.import_service = import_service
        self.export_service = export_service
        self.setWindowTitle("Şirket Analiz ve Yorum Uygulaması - Faz 1")
        self.resize(1500, 900)

        self.company_list = QListWidget()
        self.company_list.currentRowChanged.connect(self.on_company_select)

        left = QWidget()
        left_layout = QVBoxLayout(left)
        left_layout.addWidget(QLabel("Şirketler"))
        left_layout.addWidget(self.company_list)

        btn_row = QHBoxLayout()
        for txt, fn in [
            ("Ekle", self.add_company),
            ("Düzenle", self.edit_company),
            ("Sil", self.delete_company),
            ("CSV/Excel İçe Aktar", self.import_companies),
        ]:
            b = QPushButton(txt)
            b.clicked.connect(fn)
            btn_row.addWidget(b)
        left_layout.addLayout(btn_row)

        self.tabs = QTabWidget()
        self.summary = QTextEdit(readOnly=True)
        self.income = QTextEdit(readOnly=True)
        self.balance = QTextEdit(readOnly=True)
        self.cash = QTextEdit(readOnly=True)
        self.ratios = QTextEdit(readOnly=True)
        self.charts = QWidget()
        self.comments = QTextEdit(readOnly=True)
        self.notes = QTextEdit()
        self.report = QTextEdit(readOnly=True)

        for n, w in [
            ("Genel Görünüm", self.summary),
            ("Gelir Tablosu", self.income),
            ("Bilanço", self.balance),
            ("Nakit Akışı", self.cash),
            ("Oranlar", self.ratios),
            ("Grafikler", self.charts),
            ("Yorumlar", self.comments),
            ("Notlar", self.notes),
            ("Rapor", self.report),
        ]:
            self.tabs.addTab(w, n)

        self.build_dashboard()

        splitter = QSplitter(Qt.Horizontal)
        splitter.addWidget(left)
        splitter.addWidget(self.tabs)
        splitter.setSizes([350, 1150])
        self.setCentralWidget(splitter)

        self._populate_companies()

    def build_dashboard(self):
        stats = self.analysis_service.dashboard_data()
        dashboard = QTextEdit(readOnly=True)
        dashboard.setText(
            f"Toplam şirket: {stats['total_companies']}\n"
            f"İzleme listesi: {stats['watchlist_count']}\n"
            f"Veri eksik şirketler: {stats['missing_data']}\n\n"
            f"En yüksek skorlar:\n" + "\n".join([f"- {x['name']}: {x['score']}" for x in stats.get('top', [])]) + "\n\n"
            f"Riskli görünenler:\n" + "\n".join([f"- {x['name']}" for x in stats.get('risky', [])])
        )
        self.tabs.insertTab(0, dashboard, "Dashboard")

    def _populate_companies(self):
        self.companies = self.company_repo.list_companies()
        self.company_list.clear()
        for c in self.companies:
            self.company_list.addItem(f"{c['code']} - {c['name']}")

    def _selected_company(self):
        idx = self.company_list.currentRow()
        if idx < 0 or idx >= len(self.companies):
            return None
        return self.companies[idx]

    def on_company_select(self, _):
        selected = self._selected_company()
        if not selected:
            return
        analysis = self.analysis_service.analyze_company(selected["id"])
        if "error" in analysis:
            QMessageBox.warning(self, "Uyarı", analysis["error"])
            return

        snap = analysis["snapshot"]
        r = analysis["ratios"]
        c = analysis["commentary"]

        self.summary.setText(
            f"Şirket: {snap.get('name')}\n"
            f"Sektör: {snap.get('sector_name')} / {snap.get('sub_sector')}\n"
            f"Son Fiyat: {snap.get('close_price')}\n"
            f"Piyasa Değeri: {snap.get('market_cap')}\n"
            f"Büyüme: {self._fmt_pct(r.get('ciro_buyumesi'))}\n"
            f"FAVÖK Marjı: {self._fmt_pct(r.get('favok_marji'))}\n"
            f"Net Kâr Marjı: {self._fmt_pct(r.get('net_kar_marji'))}\n"
            f"Net Borç/FAVÖK: {self._fmt_num(r.get('net_borc_favok'))}\n"
            f"F/K: {self._fmt_num(r.get('fk'))}\n"
            f"PD/DD: {self._fmt_num(r.get('pddd'))}\n"
            f"Genel Skor: {analysis.get('score')}\n"
            f"Veri Kalitesi: {analysis.get('quality')}\n"
        )
        self.ratios.setText("\n".join([f"{k}: {self._fmt_num(v)}" for k, v in r.items()]))
        self.comments.setText(
            f"Genel Özet:\n{c['genel_ozet']}\n\n"
            f"Güçlü Yönler:\n- " + "\n- ".join(c["guclu_yonler"]) + "\n\n"
            f"Zayıf Yönler:\n- " + "\n- ".join(c["zayif_yonler"]) + "\n\n"
            f"Riskler:\n- " + "\n- ".join(c["riskler"]) + "\n\n"
            f"Yatırımcı Yorumu:\n{c['yatirimci_yorumu']}"
        )
        self.report.setText("Tek sayfa yatırımcı özeti bu bölümden export edilebilir.")
        self.income.setText(str(self.company_repo.financial_rows(analysis["current_period"]["id"])["income"]))
        self.balance.setText(str(self.company_repo.financial_rows(analysis["current_period"]["id"])["balance"]))
        self.cash.setText(str(self.company_repo.financial_rows(analysis["current_period"]["id"])["cash"]))
        self._render_charts(selected["id"])

    def _render_charts(self, company_id: int):
        periods = self.company_repo.periods(company_id)
        labels, revenue, ebitda, net = [], [], [], []
        for p in periods[-5:]:
            data = self.company_repo.financial_rows(p["id"])
            labels.append(p["period_label"])
            revenue.append(data["income"].get("revenue") or 0)
            ebitda.append(data["income"].get("ebitda") or 0)
            net.append(data["income"].get("net_income") or 0)

        layout = QVBoxLayout()
        layout.addWidget(TrendChart("Ciro Trendi", labels, revenue))
        layout.addWidget(TrendChart("FAVÖK Trendi", labels, ebitda))
        layout.addWidget(TrendChart("Net Kâr Trendi", labels, net))

        container = QWidget()
        container.setLayout(layout)
        self.tabs.removeTab(self.tabs.indexOf(self.charts))
        self.charts = container
        self.tabs.addTab(self.charts, "Grafikler")

    def add_company(self):
        data = self._company_dialog()
        if data:
            self.company_repo.create_company(data)
            self._populate_companies()

    def edit_company(self):
        selected = self._selected_company()
        if not selected:
            return
        data = self._company_dialog(selected)
        if data:
            self.company_repo.update_company(selected["id"], data)
            self._populate_companies()

    def delete_company(self):
        selected = self._selected_company()
        if not selected:
            return
        self.company_repo.delete_company(selected["id"])
        self._populate_companies()

    def import_companies(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Dosya seç", str(Path("imports")), "CSV/Excel (*.csv *.xlsx)")
        if not file_path:
            return
        result = self.import_service.import_companies(file_path)
        QMessageBox.information(self, "İçe Aktarma", f"{result.status}: {result.message}")
        self._populate_companies()

    def _company_dialog(self, selected: dict | None = None):
        w = QWidget()
        form = QFormLayout(w)
        code = QLineEdit(selected["code"] if selected else "")
        name = QLineEdit(selected["name"] if selected else "")
        sector = QComboBox()
        sectors = self.company_repo.list_sectors()
        sector.addItem("(Seçiniz)", None)
        for s in sectors:
            sector.addItem(s["name"], s["id"])
        sub_sector = QLineEdit(selected.get("sub_sector", "") if selected else "")
        currency = QLineEdit(selected.get("currency", "TRY") if selected else "TRY")
        country = QLineEdit(selected.get("country", "Türkiye") if selected else "Türkiye")
        notes = QLineEdit(selected.get("notes", "") if selected else "")
        watch = QCheckBox()
        if selected and selected.get("watchlist"):
            watch.setChecked(True)

        form.addRow("Kod", code)
        form.addRow("Ad", name)
        form.addRow("Sektör", sector)
        form.addRow("Alt Sektör", sub_sector)
        form.addRow("Para Birimi", currency)
        form.addRow("Ülke", country)
        form.addRow("Not", notes)
        form.addRow("İzleme", watch)

        box = QMessageBox(self)
        box.setWindowTitle("Şirket Formu")
        box.layout().addWidget(w)
        box.setStandardButtons(QMessageBox.Ok | QMessageBox.Cancel)
        if box.exec() == QMessageBox.Ok:
            try:
                return CompanyCreate(
                    code=code.text().strip(),
                    name=name.text().strip(),
                    sector_id=sector.currentData(),
                    sub_sector=sub_sector.text().strip(),
                    currency=currency.text().strip() or "TRY",
                    country=country.text().strip() or "Türkiye",
                    notes=notes.text().strip(),
                    watchlist=watch.isChecked(),
                )
            except Exception as exc:
                QMessageBox.warning(self, "Doğrulama Hatası", str(exc))
                return None
        return None

    def _fmt_num(self, v):
        if v is None:
            return "bilgi eksik / hesaplanamadı"
        if isinstance(v, float):
            return f"{v:.2f}"
        return str(v)

    def _fmt_pct(self, v):
        if v is None:
            return "bilgi eksik / hesaplanamadı"
        return f"%{v * 100:.1f}"
