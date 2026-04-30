# Database Context — BRANCHPERFDB (Oracle)

## Hierarki Organisasi
```
ORG_REGIONS
  └── ORG_AREAS       (FK: REGION_ID)
        └── ORG_BRANCHES   (FK: AREA_ID)
              └── AUTH_USERS    (FK: BRANCH_ID — nullable untuk super admin)
```

## Tabel & Kolom Lengkap

### ORG_REGIONS
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | UUID |
| REGION_CODE | VARCHAR2(20) | Contoh: RGN-JKT |
| REGION_NAME | VARCHAR2(100) | Contoh: Jakarta |
| FLAG | NUMBER(1) | 1=aktif, 0=nonaktif |
| CREATED_DATE, UPDATED_DATE | TIMESTAMP | audit |
| CREATED_BY, UPDATED_BY | VARCHAR2(100) | audit |

### ORG_AREAS
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| REGION_ID | RAW(16) FK | → ORG_REGIONS |
| AREA_CODE | VARCHAR2(20) | Contoh: AREA-JKT-01 |
| AREA_NAME | VARCHAR2(100) | |
| FLAG | NUMBER(1) | |

### ORG_BRANCHES
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| AREA_ID | RAW(16) FK | → ORG_AREAS |
| BRANCH_CODE | VARCHAR2(20) | Contoh: KCP-0001 |
| BRANCH_NAME | VARCHAR2(100) | |
| FLAG | NUMBER(1) | |

### MST_SEGMENTS
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| SEGMENT_CODE | VARCHAR2(20) | WEALTH, SME, RETAIL, CB, CMB, FI, PAYROLL, PEKERMA, PRIORITAS, INDIVIDUAL |
| SEGMENT_NAME | VARCHAR2(100) | |
| FLAG | NUMBER(1) | |

### MST_PERIODS
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| PERIOD_CODE | VARCHAR2(20) | Contoh: 2025-12, 2025-Q4, 2025 |
| PERIOD_TYPE | VARCHAR2(20) | MONTHLY / QUARTERLY / YEARLY |
| YEAR | NUMBER(4) | |
| MONTH | NUMBER(2) | NULL jika YEARLY |
| START_DATE | DATE | |
| END_DATE | DATE | |

### FACT_DANA_DAILY
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| BRANCH_ID | RAW(16) FK | → ORG_BRANCHES |
| SEGMENT_ID | RAW(16) FK | → MST_SEGMENTS |
| SNAPSHOT_DATE | DATE | tanggal snapshot harian |
| AVG_BALANCE | NUMBER(20,2) | rata-rata saldo |
| ENDING_BALANCE | NUMBER(20,2) | saldo akhir |
| COF | NUMBER(8,4) | Cost of Fund dalam % |
| GROWTH_MTD | NUMBER(8,4) | % growth Month to Date |
| GROWTH_YTD | NUMBER(8,4) | % growth Year to Date |
| GROWTH_YOY | NUMBER(8,4) | % growth Year on Year |
| CREATED_DATE | TIMESTAMP | |

### FACT_TABUNGAN_DAILY
Kolom sama persis dengan FACT_DANA_DAILY.

### FACT_GIRO_DAILY
Sama dengan FACT_DANA_DAILY, ditambah:
| Kolom | Tipe | Keterangan |
|---|---|---|
| NEW_CIF | NUMBER(10,0) | jumlah CIF baru |
| CHURN | NUMBER(10,0) | jumlah CIF keluar |
| NET_CIF | NUMBER(10,0) | NEW_CIF - CHURN |

### FACT_DEPOSITO_DAILY
Sama dengan FACT_DANA_DAILY, ditambah:
| Kolom | Tipe | Keterangan |
|---|---|---|
| CURRENCY_CODE | VARCHAR2(10) | 'IDR' (default) atau 'USD' |

**Penting**: granularitas = BRANCH + SEGMENT + SNAPSHOT_DATE + CURRENCY_CODE.
Query total deposito tanpa breakdown valuta = SUM GROUP BY atau filter WHERE CURRENCY_CODE='IDR'.

### FACT_NTB_DAILY
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| BRANCH_ID | RAW(16) FK | → ORG_BRANCHES |
| SEGMENT_ID | RAW(16) FK | → MST_SEGMENTS |
| SNAPSHOT_DATE | DATE | |
| TOTAL | NUMBER(10,0) | total CIF aktif kumulatif |
| NEW_ACCOUNT | NUMBER(10,0) | CIF baru masuk |
| LIVE | NUMBER(10,0) | CIF aktif bertransaksi |
| CHURN | NUMBER(10,0) | CIF keluar |
| NET | NUMBER(10,0) | NEW_ACCOUNT - CHURN |

### FACT_DANA_TARGET
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| BRANCH_ID | RAW(16) FK | → ORG_BRANCHES |
| SEGMENT_ID | RAW(16) FK | → MST_SEGMENTS |
| PERIOD_ID | RAW(16) FK | → MST_PERIODS |
| TARGET_AVG_BALANCE | NUMBER(20,2) | |
| TARGET_ENDING_BALANCE | NUMBER(20,2) | |
| TARGET_COF | NUMBER(8,4) | |
| CREATED_DATE | TIMESTAMP | |
| CREATED_BY | VARCHAR2(100) | |

### FACT_TABUNGAN_TARGET
Sama dengan FACT_DANA_TARGET.

### FACT_GIRO_TARGET
Sama dengan FACT_DANA_TARGET, ditambah:
| Kolom | Tipe | Keterangan |
|---|---|---|
| TARGET_NEW_CIF | NUMBER(10,0) | |

### FACT_DEPOSITO_TARGET
Sama dengan FACT_DANA_TARGET.

### FACT_NTB_TARGET
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | RAW(16) PK | |
| BRANCH_ID | RAW(16) FK | |
| SEGMENT_ID | RAW(16) FK | |
| PERIOD_ID | RAW(16) FK | |
| TARGET_TOTAL | NUMBER(10,0) | |
| TARGET_NEW_ACCOUNT | NUMBER(10,0) | |
| TARGET_LIVE | NUMBER(10,0) | |
| TARGET_CHURN | NUMBER(10,0) | |
| TARGET_NET | NUMBER(10,0) | |

---

## Query Patterns Penting

### 1. Agregasi per Level Hierarki
```sql
-- BRANCH level
WHERE b.ID = :branchId

-- AREA level (SUM semua cabang dalam area)
JOIN ORG_BRANCHES b ON fact.BRANCH_ID = b.ID
WHERE b.AREA_ID = :areaId

-- REGION level (SUM semua cabang dalam region)
JOIN ORG_BRANCHES b ON fact.BRANCH_ID = b.ID
JOIN ORG_AREAS a ON b.AREA_ID = a.ID
WHERE a.REGION_ID = :regionId
```

### 2. Latest Snapshot
```sql
WHERE SNAPSHOT_DATE = (
  SELECT MAX(SNAPSHOT_DATE) FROM FACT_DANA_DAILY
  WHERE BRANCH_ID = :branchId
)
```

### 3. Achievement % (on-the-fly)
```sql
ROUND((SUM(d.ENDING_BALANCE) / NULLIF(SUM(t.TARGET_ENDING_BALANCE), 0)) * 100, 2) AS ACHIEVEMENT_PCT
```

### 4. MoM (on-the-fly dari 2 snapshot)
```sql
-- Ambil 2 snapshot: bulan ini vs bulan lalu
-- Hitung di service layer: (current - previous) / previous * 100
```

### 5. Kemaksinan 5 Hari (Tabungan)
```sql
-- Ambil snapshot T dan T-5, hitung selisih ENDING_BALANCE di service layer
WHERE SNAPSHOT_DATE IN (
  SELECT SNAPSHOT_DATE FROM FACT_TABUNGAN_DAILY
  WHERE BRANCH_ID = :branchId
  ORDER BY SNAPSHOT_DATE DESC
  FETCH FIRST 2 ROWS ONLY  -- ambil T dan T-5
)
```

### 6. Filter Periode MtD / YtD (NTB)
```sql
-- MtD: dari awal bulan berjalan sampai snapshot terbaru
WHERE SNAPSHOT_DATE >= TRUNC(SYSDATE, 'MM')

-- YtD: dari awal tahun berjalan
WHERE SNAPSHOT_DATE >= TRUNC(SYSDATE, 'YYYY')
```

---

## UUID / RAW(16) Handling di JPA

```java
// Di Entity
@Id
@Column(name = "ID", columnDefinition = "RAW(16)")
private UUID id;

// application.yml — tambahkan ini agar Hibernate handle RAW(16) Oracle dengan benar
spring:
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.OracleDialect
```

Gunakan `UUIDToByteConverter` atau biarkan Hibernate handle otomatis dengan dialect Oracle yang benar.
ID dari frontend/request dikirim sebagai hex string → convert ke UUID di controller/service.
