# API Design — Branch Performance Mobile

## Base URL
```
http://localhost:8080/api/v1
```

## Standard Response Wrapper
```json
{
  "success": true,
  "data": { },
  "message": "OK",
  "timestamp": "2025-12-31T00:00:00"
}
```

## Query Params Standar (berlaku di semua endpoint)
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `level` | String | `BRANCH` | `BRANCH` / `AREA` / `REGION` |
| `levelId` | String | required | hex UUID cabang/area/region |
| `snapshotDate` | String (yyyy-MM-dd) | latest | tanggal snapshot |
| `periodCode` | String | bulan berjalan | contoh: `2025-12` |
| `segmentCode` | String | `ALL` | filter segmen, ALL = semua segmen |

---

## Card: Dana + Pertumbuhan & Komposisi Dana + Komposisi Dana per Segmen

### GET /api/v1/dana/summary
Untuk card header Dana (Avg Balance, Ending Balance, CoF, % target).
```json
{
  "avgBalance": 20500000000,
  "endingBalance": 21400000000,
  "cof": 2.20,
  "avgBalanceTarget": 21000000000,
  "endingBalanceTarget": 23000000000,
  "avgBalanceAchievementPct": 96.2,
  "endingBalanceAchievementPct": 93.0
}
```

### GET /api/v1/dana/growth
Untuk badge pertumbuhan (-0.3% MtD, +9.9% YtD, +12.3% YoY, MoM computed).
```json
{
  "growthMtd": -0.3,
  "growthMom": 4.7,
  "growthYtd": 9.9,
  "growthYoy": 12.3
}
```

### GET /api/v1/dana/chart
Untuk chart time-series Pertumbuhan & Komposisi Dana.
Query param tambahan: `groupBy` = `MONTHLY` / `QUARTERLY` / `YEARLY`
```json
{
  "labels": ["Des'23", "Mar'24", "Jun'24", "Sep'24", "Des'24"],
  "endingBalance": [18000000000, 19000000000, 20000000000, 20500000000, 21400000000],
  "avgBalance":    [17000000000, 18000000000, 19000000000, 19500000000, 20500000000]
}
```

### GET /api/v1/dana/composition
Untuk bar chart Komposisi Dana per Segmen.
Query param tambahan: `displayMode` = `NOMINAL` / `PROPORTION`
```json
{
  "segments": [
    { "segmentCode": "WEALTH",  "segmentName": "Wealth",  "endingBalance": 5000000000, "proportion": 23.4 },
    { "segmentCode": "SME",     "segmentName": "SME",     "endingBalance": 4000000000, "proportion": 18.7 },
    { "segmentCode": "RETAIL",  "segmentName": "Retail",  "endingBalance": 3500000000, "proportion": 16.4 }
  ]
}
```

### GET /api/v1/dana/detail
Untuk modal (i) — drill-down tabel per area/cabang.
Query param tambahan: `detailLevel` = `AREA` / `BRANCH`, `metric` = `AVG_BAL` / `END_BAL`
```json
{
  "items": [
    {
      "code": "AREA-JKT-01",
      "name": "Area Jakarta Kyai Tapa",
      "avgBalance": 1600000000,
      "endingBalance": 1800000000,
      "target": 1800000000,
      "achievementPct": 89.0,
      "cof": 2.25
    }
  ]
}
```

---

## Card: Tabungan + Pertumbuhan Ending Balance Tabungan + Komposisi Tabungan per Segmen

### GET /api/v1/tabungan/summary
Sama strukturnya dengan /dana/summary.

### GET /api/v1/tabungan/growth
Sama strukturnya dengan /dana/growth.

### GET /api/v1/tabungan/chart
Sama strukturnya dengan /dana/chart.
Tambahan: return 3 series (End Bal tahun ini, End Bal tahun lalu, Avg Bal tahun ini).

### GET /api/v1/tabungan/composition
Query param tambahan: `growthPeriod` = `MTD` / `YOY` / `YTD`
```json
{
  "segments": [
    {
      "segmentCode": "PAYROLL",
      "segmentName": "Payroll",
      "endingBalance": 3500000000,
      "proportion": 36.0,
      "achievementPct": 94.0,
      "growth": 6.5
    }
  ]
}
```

### GET /api/v1/tabungan/metrics
Untuk tabel metrik (kemaksinan 5 hari, % Tab Retail).
```json
{
  "delta5Days": 142000000,
  "retailProportion": 42.5,
  "retailProportionDelta": 1.9
}
```

### GET /api/v1/tabungan/detail
Sama strukturnya dengan /dana/detail.

---

## Card: Akuisisi NTB Tabungan

### GET /api/v1/ntb/summary
Query param tambahan: `periodType` = `MTD` / `YTD`
```json
{
  "periodType": "MTD",
  "total": {
    "total": 32, "newAccount": 36, "target": 23, "live": 5, "churn": 0, "net": 27
  },
  "segments": [
    {
      "segmentCode": "PAYROLL",
      "segmentName": "Payroll",
      "achievementPct": 75.0,
      "total": 8, "newAccount": 10, "target": 6, "live": 1, "churn": 0, "net": 7
    }
  ]
}
```

---

## Card: Giro + Pertumbuhan Ending Balance Giro + Komposisi Giro per Segmen

### GET /api/v1/giro/summary
Sama dengan /dana/summary.

### GET /api/v1/giro/growth
Sama dengan /dana/growth.

### GET /api/v1/giro/composition
Sama dengan /dana/composition.

### GET /api/v1/giro/detail
Sama dengan /dana/detail.

### GET /api/v1/giro/acquisition
Untuk card Akuisisi Giro Retail.
Query param tambahan: `periodType` = `MTD` / `YTD`
```json
{
  "newCif": 26,
  "newCifTarget": 42,
  "newCifAchievementPct": 61.9,
  "churn": 8,
  "netCif": 26,
  "endingBalance": 1420000000
}
```

---

## Card: Deposito + Pertumbuhan Avg Balance Deposito + Komposisi per Segmen + per Valuta

### GET /api/v1/deposito/summary
Khusus deposito: yang ditampilkan adalah AVG_BALANCE (bukan Ending Balance).
```json
{
  "avgBalance": 5700000000,
  "avgBalanceTarget": 6300000000,
  "avgBalanceAchievementPct": 90.0,
  "cof": 4.62
}
```

### GET /api/v1/deposito/growth
Sama dengan /dana/growth.

### GET /api/v1/deposito/composition
Sama dengan /dana/composition — query WHERE CURRENCY_CODE = 'IDR' untuk total.

### GET /api/v1/deposito/detail
Sama dengan /dana/detail.

### GET /api/v1/deposito/currency
Untuk chart Komposisi Deposito per Valuta.
```json
{
  "currencies": [
    { "currencyCode": "IDR", "label": "OJK / IDR", "endingBalance": 4332000000, "proportion": 76.0 },
    { "currencyCode": "USD", "label": "USD",        "endingBalance": 1026000000, "proportion": 18.0 }
  ]
}
```

---

## Helper Endpoints

### GET /api/v1/org/regions
```json
[{ "id": "abc123", "regionCode": "RGN-JKT", "regionName": "Jakarta" }]
```

### GET /api/v1/org/areas?regionId=xxx
```json
[{ "id": "def456", "areaCode": "AREA-JKT-01", "areaName": "Area Jakarta Kyai Tapa" }]
```

### GET /api/v1/org/branches?areaId=xxx
```json
[{ "id": "ghi789", "branchCode": "KCP-0001", "branchName": "KCP Taman Duta Mas" }]
```

### GET /api/v1/segments
```json
[{ "id": "jkl012", "segmentCode": "WEALTH", "segmentName": "Wealth" }]
```

### GET /api/v1/periods?type=MONTHLY
```json
[{ "id": "mno345", "periodCode": "2025-12", "periodType": "MONTHLY", "year": 2025, "month": 12 }]
```
