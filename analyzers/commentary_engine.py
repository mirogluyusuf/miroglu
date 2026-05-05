def generate_commentary(r: dict) -> dict:
    strong, weak, risk = [], [], []

    if (r.get("ciro_buyumesi") or -1) > 0.15 and (r.get("favok_marji") or 0) > 0.15 and (r.get("serbest_nakit_akisi") or 0) > 0:
        strong.append("Yüksek büyüme + güçlü marj + pozitif serbest nakit akışı kombinasyonu olumlu.")
    if (r.get("ciro_buyumesi") or 0) > 0 and (r.get("net_kar_marji") or 0) < 0.05:
        weak.append("Ciro büyümesine rağmen net kâr marjı zayıf kalıyor.")
    if (r.get("favok_marji") or 0) < 0.1:
        weak.append("FAVÖK marjı düşük; operasyonel verim baskı altında olabilir.")
    if (r.get("borc_ozkaynak") or 0) > 1.0:
        risk.append("Borç/özkaynak oranı yüksek; kaldıraç riski artıyor.")
    if (r.get("net_borc_favok") or 0) < 0:
        strong.append("Net nakit pozisyonu şirketin finansal esnekliğini artırıyor.")
    if (r.get("serbest_nakit_akisi") or 0) < 0:
        risk.append("Serbest nakit akışı negatif; yatırım ve borç çevrim kalitesi izlenmeli.")
    if (r.get("net_kar") or 0) > 0 and (r.get("serbest_nakit_akisi") or 0) < 0:
        risk.append("Net kâr olmasına rağmen nakit yaratımı zayıf (kırmızı bayrak).")
    if (r.get("fk") or 0) > 25 or (r.get("fd_favok") or 0) > 14:
        risk.append("Değerleme çarpanları pahalı görünüyor.")
    if (r.get("fk") or 999) < 8 and (r.get("ciro_buyumesi") or 0) < 0.05:
        weak.append("Görece ucuz çarpanlara rağmen büyüme momentumu zayıf.")
    if (r.get("roe") or 0) > 0.2 and (r.get("borc_ozkaynak") or 0) > 1:
        risk.append("ROE güçlü ancak yüksek borç seviyesi temkin gerektirir.")

    overall = "Finansal görünüm dengeli." if not risk else "Finansal görünümde dikkat gerektiren unsurlar var."
    investor = "Uzun vadeli karar için nakit akışı ve borç trendi birlikte takip edilmeli."
    return {
        "genel_ozet": overall,
        "guclu_yonler": strong or ["Belirgin güçlü sinyal bulunamadı."],
        "zayif_yonler": weak or ["Belirgin zayıf sinyal bulunamadı."],
        "riskler": risk or ["Kritik risk sinyali sınırlı."],
        "yatirimci_yorumu": investor,
    }
