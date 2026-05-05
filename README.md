# Şirket Analiz ve Yorum Uygulaması (Desktop, Faz 1)

Bu proje **web değil**, tamamen **masaüstü** odaklı bir Python uygulamasıdır. PySide6 arayüzü, SQLite yerel veritabanı, pandas tabanlı import/export ve yerel kural tabanlı yorum motoru içerir.

## 1) Proje Özeti
- Şirket yönetimi (ekle/düzenle/sil)
- Finansal veri saklama (gelir tablosu, bilanço, nakit akışı, fiyat)
- Oran hesaplama motoru
- Trend grafikleri
- Veri kalitesi notu
- Yerel Türkçe yorum motoru (internet gerekmeden)
- Dashboard + şirket detay sekmeleri
- CSV/Excel import + CSV/Excel/DOCX export
- Demo veri ile ilk açılışta dolu ekran

## 2) Teknoloji Seçimi ve Neden
- **Python**: hızlı geliştirme, güçlü veri ekosistemi
- **PySide6**: modern native desktop arayüz
- **SQLite**: yerel, kurulum gerektirmeyen veritabanı
- **pandas/openpyxl**: CSV/Excel işleme
- **matplotlib**: masaüstünde stabil trend grafikleri
- **pydantic**: form/veri doğrulama
- **python-docx**: yatırımcı özeti raporu
- **PyInstaller**: .exe paketleme

## 3) Uzun Vadeli Mimari
Katmanlar:
- `ui/` kullanıcı etkileşimi
- `services/` iş akışı ve uygulama servisleri
- `analyzers/` oran, yorum, kalite analiz motorları
- `repositories/` veritabanı erişimi
- `database/` şema + seed
- `models/` veri doğrulama modelleri
- `imports/exports/` dosya operasyonları

## 4) Faz Planı
- **Faz 1 (tamamlandı):** çekirdek ürün, oranlar, yorum, dashboard, import/export
- **Faz 2:** şirket kıyas, sektör ortalaması, kırmızı bayrak skoru, tarama ekranı
- **Faz 3:** yatırım günlüğü, alarm, gelişmiş raporlar, değerleme simülatörü
- **Faz 4:** opsiyonel AI yorum modülü, makro panel, profil bazlı skorlama

## 5) Faz 1 Kapsamı
Bu sürümde çalışan fonksiyonlar:
- Şirket CRUD
- CSV/Excel şirket import
- Yıllık dönem finansal kayıt altyapısı
- 25+ oran hesaplama
- Veri eksiğinde `bilgi eksik / hesaplanamadı`
- Tek sayfa özet + güçlü/zayıf/risk yorumları
- Trend grafikleri
- Not/tez kartı veri modeli
- CSV/Excel/DOCX export servisleri

## 6) Klasör Ağacı
```text
app/
ui/
widgets/
services/
analyzers/
models/
repositories/
database/
resources/
imports/
exports/
demo_data/
utils/
tests/
main.py
```

## 7) Kurulum
```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py
```

## 8) PyInstaller ile EXE
```bash
pyinstaller --noconfirm --onefile --windowed main.py --name SirketAnaliz
```

## 9) Import Şablonu
- `imports/company_import_template.csv`

## 10) Veri Tabanı Şeması
Aşağıdaki tablolar tanımlı:
`companies, sectors, financial_periods, income_statements, balance_sheets, cash_flows, price_data, analysis_results, notes, thesis_cards, settings, watchlist, import_logs, data_quality_flags`.

## 11) Export
- CSV oran export
- Excel oran export
- DOCX tek sayfa yatırımcı özeti

## 12) Notlar
- Bu uygulama offline çalışır.
- Demo veriler eğitim amaçlıdır, yatırım tavsiyesi değildir.
