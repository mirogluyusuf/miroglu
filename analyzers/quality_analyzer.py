def quality_score(data: dict, ratio_count: int, missing_ratio: int) -> tuple[str, list[str]]:
    flags = []
    if not data.get("cash"):
        flags.append("Nakit akış tablosu eksik")
    if not data.get("income"):
        flags.append("Gelir tablosu eksik")
    if not data.get("balance"):
        flags.append("Bilanço eksik")
    if missing_ratio > max(3, ratio_count // 3):
        flags.append("Hesaplanamayan oran sayısı yüksek")

    if len(flags) <= 1:
        return "Yüksek", flags
    if len(flags) <= 3:
        return "Orta", flags
    return "Düşük", flags
