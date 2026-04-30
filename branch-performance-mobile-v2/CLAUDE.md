# Branch Performance Mobile — Claude Code Context

## Project Overview
Aplikasi dashboard kinerja cabang bank (internal). Menampilkan data performa produk
Dana, Tabungan, Giro, Deposito, dan NTB per cabang/area/region.

---

## Stack
- **Backend** : Spring Boot 3.x, Java 17, JPA/Hibernate, Oracle DB
- **Frontend** : React Native (sudah ada, masih hardcoded — akan diintegrasikan)
- **Database** : Oracle (BRANCHPERFDB schema)

---

## Directory Structure
```
branch-performance-mobile-v2/
├── CLAUDE.md                              ← file ini
├── branch-performance-mobile-be-v2/      ← Spring Boot backend
│   ├── src/main/java/com/mandiri/branchperformance/
│   │   ├── BranchPerformanceApplication.java
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   └── util/
│   └── src/main/resources/
│       └── application.yml
└── branch-performance-mobile-fe-v2/      ← React Native frontend (existing)
```

---

## Database — Oracle Schema: BRANCHPERFDB

### Hierarki Organisasi
```
ORG_REGIONS (3 region: Jakarta, Jawa Barat, Jawa Timur)
  └── ORG_AREAS (9 area, 3 per region)
        └── ORG_BRANCHES (45 cabang, 5 per area)
```

### Auth & User
- `AUTH_USERS` — user dengan FK `BRANCH_ID` → `ORG_BRANCHES`
- `AUTH_ROLES` — role: OFFICER, BRANCH_MANAGER, AREA_HEAD, RCEO, SUPER_ADMIN
- `AUTH_USERS_ROLES` — junction M:N
- `AUTH_MENU_ACCESS`, `AUTH_ROLE_MENU_ACCESS`, `API_MENU_ACCESS`
- `AUTH_AUDIT_TRAIL`, `AUTH_USER_TOKEN_LOGS`

### Master Data
- `MST_SEGMENTS` — segmen: WEALTH, SME, RETAIL, CB, CMB, FI, PAYROLL, PEKERMA, PRIORITAS, INDIVIDUAL
- `MST_PERIODS` — periode MONTHLY/QUARTERLY/YEARLY, 2023–2026

### Fact Tables (semua FK ke ORG_BRANCHES + MST_SEGMENTS)
| Tabel | Kolom Khusus |
|---|---|
| `FACT_DANA_DAILY` | AVG_BALANCE, ENDING_BALANCE, COF, GROWTH_MTD, GROWTH_YTD, GROWTH_YOY, SNAPSHOT_DATE |
| `FACT_TABUNGAN_DAILY` | sama seperti DANA |
| `FACT_GIRO_DAILY` | + NEW_CIF, CHURN, NET_CIF |
| `FACT_DEPOSITO_DAILY` | + CURRENCY_CODE ('IDR'/'USD') |
| `FACT_NTB_DAILY` | TOTAL, NEW_ACCOUNT, LIVE, CHURN, NET, SNAPSHOT_DATE |
| `FACT_DANA_TARGET` | TARGET_AVG_BALANCE, TARGET_ENDING_BALANCE, TARGET_COF, FK PERIOD_ID |
| `FACT_TABUNGAN_TARGET` | sama seperti DANA TARGET |
| `FACT_GIRO_TARGET` | + TARGET_NEW_CIF |
| `FACT_DEPOSITO_TARGET` | sama seperti DANA TARGET |
| `FACT_NTB_TARGET` | TARGET_TOTAL, TARGET_NEW_ACCOUNT, TARGET_LIVE, TARGET_CHURN, TARGET_NET |

### Catatan DB Penting
- ID semua tabel: `RAW(16)` (UUID Oracle), bukan VARCHAR
- Di JPA gunakan `@Column(columnDefinition = "RAW(16)")` dan converter khusus untuk UUID↔RAW(16)
- Query agregasi ke atas (area/region) = JOIN ke ORG_BRANCHES → ORG_AREAS → ORG_REGIONS
- Achievement % dihitung on-the-fly: `(aktual / target) * 100`
- MoM dihitung dari 2 snapshot berbeda, bukan kolom tersendiri
- `FACT_DEPOSITO_DAILY` granularitas per CURRENCY_CODE — query total harus SUM + GROUP BY

---

## API Design

### Base URL
```
/api/v1
```

### Konvensi Response
```json
{
  "success": true,
  "data": { ... },
  "message": "OK",
  "timestamp": "2025-12-31T00:00:00"
}
```

### Query Params Standar (berlaku di semua endpoint)
| Param | Type | Keterangan |
|---|---|---|
| `level` | String | `BRANCH` / `AREA` / `REGION` |
| `levelId` | String (hex UUID) | ID cabang/area/region yang dipilih |
| `snapshotDate` | String (yyyy-MM-dd) | Tanggal snapshot, default = latest |
| `periodCode` | String | Contoh: `2025-12`, `2025-Q4`, `2025` |
| `segmentCode` | String (optional) | Filter segmen, default = ALL |

---

## Endpoint List per Card

### Card: Dana
```
GET /api/v1/dana/summary
→ AVG_BALANCE, ENDING_BALANCE, COF, badge % target Avg & End Bal

GET /api/v1/dana/growth
→ GROWTH_MTD, GROWTH_YTD, GROWTH_YOY, MoM (computed)

GET /api/v1/dana/chart
→ time-series ENDING_BALANCE + AVG_BALANCE, grouped by bulan/kuartal/tahun

GET /api/v1/dana/composition
→ ENDING_BALANCE per SEGMENT_ID (untuk bar chart komposisi)

GET /api/v1/dana/detail
→ drill-down per area/cabang: AVG_BALANCE, ENDING_BALANCE, TARGET, % Ach, COF
```

### Card: Tabungan
```
GET /api/v1/tabungan/summary
GET /api/v1/tabungan/growth
GET /api/v1/tabungan/chart
GET /api/v1/tabungan/composition
GET /api/v1/tabungan/detail
GET /api/v1/tabungan/metrics
→ kemaksinan 5 hari (delta T vs T-5), % Tab Retail
```

### Card: Giro
```
GET /api/v1/giro/summary
GET /api/v1/giro/growth
GET /api/v1/giro/composition
GET /api/v1/giro/detail
GET /api/v1/giro/acquisition
→ NEW_CIF, CHURN, NET_CIF, TARGET_NEW_CIF, End Bal (untuk card Akuisisi Giro Retail)
```

### Card: Deposito
```
GET /api/v1/deposito/summary
GET /api/v1/deposito/growth
GET /api/v1/deposito/composition
GET /api/v1/deposito/detail
GET /api/v1/deposito/currency
→ breakdown ENDING_BALANCE per CURRENCY_CODE (IDR vs USD)
```

### NTB (embedded di card Tabungan)
```
GET /api/v1/ntb/summary
→ TOTAL, NEW_ACCOUNT, LIVE, CHURN, NET per segmen + target
→ support filter periode MtD / YtD
```

### Organisasi (helper endpoints)
```
GET /api/v1/org/regions
GET /api/v1/org/areas?regionId=xxx
GET /api/v1/org/branches?areaId=xxx
GET /api/v1/segments
GET /api/v1/periods?type=MONTHLY
```

---

## JPA / Query Notes

### UUID Handling (RAW(16) Oracle)
```java
// Entity
@Id
@Column(name = "ID", columnDefinition = "RAW(16)")
@GeneratedValue(generator = "uuid2")
@GenericGenerator(name = "uuid2", strategy = "uuid2")
private UUID id;
```

### Query Agregasi Hierarki
```java
// Branch level → langsung WHERE branch_id = :branchId
// Area level   → JOIN ORG_BRANCHES b ON b.AREA_ID = :areaId
// Region level → JOIN ORG_BRANCHES b JOIN ORG_AREAS a ON b.AREA_ID = a.ID WHERE a.REGION_ID = :regionId
```

### Achievement % Calculation
```java
// Di service layer
double achievement = (actual / target) * 100;
```

---

## Dev Setup
- Java 17
- Spring Boot 3.x
- Oracle JDBC Driver: `com.oracle.database.jdbc:ojdbc11`
- Port: 8080
- DB: Oracle (host/port/sid sesuai environment)
- Profile: `dev` untuk local development

---

## Coding Conventions
- Package: `com.mandiri.branchperformance`
- Semua DTO pakai suffix `Dto`
- Semua Entity pakai nama tabel tanpa prefix (contoh: `FactDanaDaily`, bukan `FactDanaDailyEntity`)
- Service hanya boleh diakses lewat Controller — tidak boleh inject Repository langsung di Controller
- Semua endpoint return `ApiResponseDto<T>` wrapper
- Gunakan `@Slf4j` untuk logging
- Tidak perlu auth/security untuk saat ini — fokus ke data layer dulu
