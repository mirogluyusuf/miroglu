from PySide6.QtWidgets import QApplication

from database.db_manager import DatabaseManager
from database.seed import seed_demo_data
from repositories.company_repository import CompanyRepository
from services.analysis_service import AnalysisService
from services.import_service import ImportService
from services.export_service import ExportService
from ui.main_window import MainWindow


def run_app() -> None:
    app = QApplication([])
    db = DatabaseManager()
    db.initialize()
    seed_demo_data(db)

    company_repo = CompanyRepository(db)
    analysis_service = AnalysisService(db, company_repo)
    import_service = ImportService(db)
    export_service = ExportService(db, analysis_service)

    window = MainWindow(db, company_repo, analysis_service, import_service, export_service)
    window.show()
    app.exec()
