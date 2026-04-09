# Kalite Kontrol Excel Çalışma Otomasyonu

Bu proje, kalite kontrol bölümünde parça ölçüm sonuçlarını standart şekilde kaydetmek için otomatik bir Excel şablonu üretir.

## Özellikler

- **Ölçüm_Girişi** sayfası:
  - Operatör, vardiya, parça kodu, kriter ve ölçülen değer girişi.
  - Toleranslardan otomatik limit çekme (XLOOKUP).
  - Otomatik **OK / NOK** karar mekanizması.
  - Koşullu renklendirme (OK = yeşil, NOK = kırmızı, eksik ölçüm = sarı).
- **Toleranslar** sayfası:
  - Parça bazında kriter, hedef ve tolerans tanımlama.
- **Özet** sayfası:
  - Toplam ölçüm, OK/NOK adedi, başarı oranı, sapma istatistikleri.
- **Kullanım** sayfası:
  - Operasyon adımlarının kısa talimatı.

## Kurulum

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Çalıştırma

```bash
python3 create_qc_excel.py
```

Varsayılan dosya adı: `Kalite_Kontrol_Olcum_Takip.xlsx`

## Not

Şablonda kullanılan bazı formüller (ör. `XLOOKUP`, `UNIQUE`) Excel 365 / Excel 2021 sürümlerinde desteklenir.
