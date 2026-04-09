#!/usr/bin/env python3
"""Kalite kontrol için parça ölçüm sonuçlarının kaydedileceği Excel şablonu oluşturur."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation


HEADER_FILL = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
HEADER_FONT = Font(color="FFFFFF", bold=True)
CENTER = Alignment(horizontal="center", vertical="center")
PASS_FILL = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
FAIL_FILL = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
WARN_FILL = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")


def style_header_row(ws, row: int, max_col: int) -> None:
    for col in range(1, max_col + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER


def autosize_columns(ws) -> None:
    for col_cells in ws.columns:
        max_length = 0
        col_letter = col_cells[0].column_letter
        for cell in col_cells:
            value = "" if cell.value is None else str(cell.value)
            max_length = max(max_length, len(value))
        ws.column_dimensions[col_letter].width = min(max_length + 2, 40)


def build_workbook() -> Workbook:
    wb = Workbook()

    ws_form = wb.active
    ws_form.title = "Ölçüm_Girişi"

    ws_tol = wb.create_sheet("Toleranslar")
    ws_summary = wb.create_sheet("Özet")
    ws_guide = wb.create_sheet("Kullanım")

    # Kullanım sayfası
    ws_guide["A1"] = "Kalite Kontrol Ölçüm Şablonu"
    ws_guide["A1"].font = Font(size=14, bold=True)
    ws_guide["A3"] = "1) Toleranslar sayfasında parça kodu ve ölçüm kriterlerini doldurun."
    ws_guide["A4"] = "2) Ölçüm_Girişi sayfasında her parça için ölçüm değerlerini girin."
    ws_guide["A5"] = "3) Durum sütunu otomatik olarak OK / NOK üretir."
    ws_guide["A6"] = "4) Özet sayfasında günlük başarı oranı ve kritik metrikleri izleyin."
    ws_guide["A8"] = f"Oluşturulma zamanı: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"
    ws_guide.column_dimensions["A"].width = 110

    # Toleranslar
    tol_headers = [
        "Parça Kodu",
        "Ölçüm Kriteri",
        "Hedef Değer",
        "Alt Tolerans",
        "Üst Tolerans",
        "Ölçüm Birimi",
        "Kontrol Sıklığı",
        "Not",
    ]
    ws_tol.append(tol_headers)
    style_header_row(ws_tol, 1, len(tol_headers))

    sample_tolerances = [
        ["P-1001", "Çap", 25.00, 24.90, 25.10, "mm", "Her Parti", ""],
        ["P-1001", "Uzunluk", 80.00, 79.70, 80.30, "mm", "Her Parti", ""],
        ["P-1002", "Kalınlık", 3.20, 3.10, 3.30, "mm", "Saatlik", ""],
    ]
    for row in sample_tolerances:
        ws_tol.append(row)

    for col in ["C", "D", "E"]:
        for cell in ws_tol[col][1:]:
            cell.number_format = "0.00"

    ws_tol.freeze_panes = "A2"
    autosize_columns(ws_tol)

    # Ölçüm Girişi
    form_headers = [
        "Kayıt No",
        "Tarih",
        "Operatör",
        "Vardiya",
        "Parça Kodu",
        "Ölçüm Kriteri",
        "Nominal",
        "Alt Limit",
        "Üst Limit",
        "Ölçülen Değer",
        "Sapma",
        "Durum",
        "Cihaz No",
        "Lot/Parti No",
        "Açıklama",
    ]
    ws_form.append(form_headers)
    style_header_row(ws_form, 1, len(form_headers))

    for row in range(2, 502):
        ws_form.cell(row=row, column=1, value=f"=IF(E{row}<>\"\",ROW()-1,\"\")")
        ws_form.cell(row=row, column=2, value=f"=IF(E{row}<>\"\",TODAY(),\"\")")
        ws_form.cell(row=row, column=7, value=f"=IFERROR(XLOOKUP(E{row}&F{row},Toleranslar!A:A&Toleranslar!B:B,Toleranslar!C:C,\"\"),\"\")")
        ws_form.cell(row=row, column=8, value=f"=IFERROR(XLOOKUP(E{row}&F{row},Toleranslar!A:A&Toleranslar!B:B,Toleranslar!D:D,\"\"),\"\")")
        ws_form.cell(row=row, column=9, value=f"=IFERROR(XLOOKUP(E{row}&F{row},Toleranslar!A:A&Toleranslar!B:B,Toleranslar!E:E,\"\"),\"\")")
        ws_form.cell(row=row, column=11, value=f"=IF(J{row}=\"\",\"\",J{row}-G{row})")
        ws_form.cell(row=row, column=12, value=f"=IF(J{row}=\"\",\"\",IF(AND(J{row}>=H{row},J{row}<=I{row}),\"OK\",\"NOK\"))")

    for col in ["G", "H", "I", "J", "K"]:
        for cell in ws_form[col][1:]:
            cell.number_format = "0.00"

    for cell in ws_form["B"][1:]:
        cell.number_format = "yyyy-mm-dd"

    ws_form.freeze_panes = "A2"

    # Veri doğrulama
    shift_validation = DataValidation(type="list", formula1='"1.Vardiya,2.Vardiya,3.Vardiya"', allow_blank=True)
    ws_form.add_data_validation(shift_validation)
    shift_validation.add("D2:D501")

    code_validation = DataValidation(type="list", formula1="=UNIQUE(Toleranslar!$A$2:$A$500)", allow_blank=True)
    ws_form.add_data_validation(code_validation)
    code_validation.add("E2:E501")

    criteria_validation = DataValidation(type="list", formula1="=UNIQUE(Toleranslar!$B$2:$B$500)", allow_blank=True)
    ws_form.add_data_validation(criteria_validation)
    criteria_validation.add("F2:F501")

    # Koşullu biçimlendirme
    ok_rule = FormulaRule(formula=["$L2=\"OK\""], stopIfTrue=False, fill=PASS_FILL)
    nok_rule = FormulaRule(formula=["$L2=\"NOK\""], stopIfTrue=False, fill=FAIL_FILL)
    missing_rule = FormulaRule(formula=["=AND($E2<>'',$J2='')"], stopIfTrue=False, fill=WARN_FILL)

    ws_form.conditional_formatting.add("A2:O501", ok_rule)
    ws_form.conditional_formatting.add("A2:O501", nok_rule)
    ws_form.conditional_formatting.add("A2:O501", missing_rule)

    autosize_columns(ws_form)

    # Özet
    summary_headers = ["Metrik", "Değer"]
    ws_summary.append(summary_headers)
    style_header_row(ws_summary, 1, len(summary_headers))

    summary_rows = [
        ["Toplam Ölçüm", "=COUNTA(Ölçüm_Girişi!J2:J501)"],
        ["OK Adedi", '=COUNTIF(Ölçüm_Girişi!L2:L501,"OK")'],
        ["NOK Adedi", '=COUNTIF(Ölçüm_Girişi!L2:L501,"NOK")'],
        ["Başarı Oranı", '=IF(B2=0,0,B3/B2)'],
        ["Ortalama Sapma", "=AVERAGEIF(Ölçüm_Girişi!K2:K501,\"<>\",Ölçüm_Girişi!K2:K501)"],
        ["Maksimum Sapma", "=MAX(Ölçüm_Girişi!K2:K501)"],
        ["Minimum Sapma", "=MIN(Ölçüm_Girişi!K2:K501)"],
    ]
    for row in summary_rows:
        ws_summary.append(row)

    ws_summary["B5"].number_format = "0.00%"
    for cell in ws_summary["B"][5:8]:
        cell.number_format = "0.00"

    ws_summary.column_dimensions["A"].width = 28
    ws_summary.column_dimensions["B"].width = 22

    return wb


def main(output: str = "Kalite_Kontrol_Olcum_Takip.xlsx") -> None:
    workbook = build_workbook()
    out_path = Path(output)
    workbook.save(out_path)
    print(f"Excel şablonu oluşturuldu: {out_path.resolve()}")


if __name__ == "__main__":
    main()
