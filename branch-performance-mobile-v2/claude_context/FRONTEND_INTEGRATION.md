# Frontend Integration Guide

## Setup
Frontend ada di: branch-performance-mobile-fe-v2 (React Native, sudah ada)
Backend berjalan di: http://localhost:8080/api/v1

## Langkah Integrasi per Card
1. Cari file screen/component yang relevan di frontend
2. Ganti data hardcoded dengan API call ke endpoint yang sesuai (lihat API.md)
3. Gunakan query params: level, levelId, snapshotDate, periodCode, segmentCode
4. Pastikan loading state dan error handling ada

## API Base URL
Buat file config di frontend:
```js
// config/api.js
export const API_BASE_URL = 'http://localhost:8080/api/v1';
```

## Mapping Card → Endpoint
| Card | Endpoint |
|---|---|
| Dana (header) | GET /dana/summary |
| Pertumbuhan & Komposisi Dana | GET /dana/growth + /dana/chart |
| Komposisi Dana per Segmen | GET /dana/composition |
| Modal (i) Dana | GET /dana/detail |
| Tabungan (header) | GET /tabungan/summary |
| Pertumbuhan Ending Bal Tabungan | GET /tabungan/growth + /tabungan/chart |
| Komposisi Tabungan per Segmen | GET /tabungan/composition |
| Tabel Metrik Tabungan | GET /tabungan/metrics |
| Modal (i) Tabungan | GET /tabungan/detail |
| Akuisisi NTB Tabungan | GET /ntb/summary |
| Giro (header) | GET /giro/summary |
| Pertumbuhan Ending Bal Giro | GET /giro/growth |
| Komposisi Giro per Segmen | GET /giro/composition |
| Modal (i) Giro | GET /giro/detail |
| Akuisisi Giro Retail | GET /giro/acquisition |
| Deposito (header) | GET /deposito/summary |
| Pertumbuhan Avg Bal Deposito | GET /deposito/growth |
| Komposisi Deposito per Segmen | GET /deposito/composition |
| Komposisi Deposito per Valuta | GET /deposito/currency |
| Modal (i) Deposito | GET /deposito/detail |
| Dropdown filter Region/Area/Cabang | GET /org/regions + /org/areas + /org/branches |
| Dropdown Segmen | GET /segments |
| Dropdown Periode | GET /periods |

## Setelah Integrasi Selesai
1. Restart backend:
   ```bash
   cd branch-performance-mobile-be-v2
   ./mvnw spring-boot:run
   ```
2. Run emulator:
   ```bash
   cd branch-performance-mobile-fe-v2
   npx react-native run-android
   # atau
   npx react-native run-ios
   ```
