export type MetricStatus = 'good' | 'warning' | 'bad';

export interface SelectOption {
  label: string;
  value: string;
}

// Legacy types kept for backward compat
export interface KPIRingkasan {
  skorKPI: number;
  rankCabang: number;
  totalCabang: number;
  kategori: string;
  trend: 'up' | 'down' | 'flat';
  persentaseNaik: number;
}

export interface GrafikBulanan {
  judul: string;
  bulan: string[];
  pencapaian: number[];
  target: number[];
}

export interface MetricItem {
  id: string;
  nama: string;
  target: number;
  realisasi: number;
  pencapaian: number;
  status: MetricStatus;
  satuan: string;
  formatRingkas?: boolean;
  keterangan?: string;
  inversed?: boolean;
}

export interface MetricSection {
  judul: string;
  items: MetricItem[];
}

// New types matching revised design
export interface CabangInfo {
  id: string;
  nama: string;
  kota: string;
  area: string;
  pimpinan: string;
}

export interface PesanRCEO {
  teks: string;
  penulis: string;
}

export interface SkorKategoriItem {
  id: string;
  nama: string;
  skor: number;
}

export interface SkorCabang {
  skor: number;
  kategori: string;
  periode: string;
  skorKategori: SkorKategoriItem[];
}

export interface TrenDataItem {
  id: string;
  nama: string;
  nilai: number[];
  warna: string;
}

export interface TrenSkor {
  bulan: string[];
  data: TrenDataItem[];
}

export interface AlertItem {
  id: string;
  tipe: 'buruk' | 'warning';
  label: string;
  judul: string;
  deskripsi: string;
  cta: string | null;
}

export interface SkorSubItem {
  id: string;
  nama: string;
  skor: number;
}

export interface SkorSection {
  skor: number;
  periode: string;
  items: SkorSubItem[];
}

export interface DampakItem {
  label: string;
  jumlah: number;
  pct: number;
  warna: string;
}

export interface DurasiItem {
  label: string;
  jumlah: number;
  warna: string;
}

export interface TemuanAudit {
  updatedAt: string;
  total: number;
  open: number;
  levelPct: number;
  levelAt: number;
  levelOver30: number;
  distribusiDampak: DampakItem[];
  durasiOpen: DurasiItem[];
}

export interface BankShare {
  id: string;
  nama: string;
  pct: number;
  warna: string;
}

export interface MarketShare {
  area: string;
  banks: BankShare[];
}

export interface KPIRowItem {
  metrik: string;
  ureg: string;
  target: string;
  capaian: string;
  mom: string;
  statusCapaian: MetricStatus;
}

export interface KPISeksi {
  judul: string;
  items: KPIRowItem[];
}

export interface KPIKategoriData {
  seksi: KPISeksi[];
}

export interface RingkasanKPI {
  kategoriList: string[];
  periodList: string[];
  data: Record<string, KPIKategoriData>;
}

// Bisnis DPK types
export interface DPKPerbandingan {
  tanggal: string;
  nilai: string;
  growth: string;
  growthUp: boolean;
}

export interface DPKEndingBalance {
  label: string;
  tanggal: string;
  nilai: string;
  target: string;
  keterangan: string;
  keteranganUp: boolean;
  perbandingan: DPKPerbandingan[];
}

export interface BreakdownItem {
  label: string;
  pct: number;
  warna: string;
}

export interface DPKTableRow {
  produk: string;
  cif: string;
  balance: string;
  target: string;
  capaian: string;
  growth: string;
  growthUp: boolean;
  balanceStatus: MetricStatus;
  capaianStatus: MetricStatus;
}

export interface DPKBarTable {
  judul: string;
  periodList: string[];
  breakdown: BreakdownItem[];
  rows: DPKTableRow[];
}

export interface AkuisiChurnStat {
  label: string;
  nilai: string;
  keterangan: string;
  keteranganStatus: 'good' | 'warning' | 'bad' | 'neutral';
}

export interface AkuisiChurnRincian {
  segmen: string;
  akuisisi: number;
  churn: number;
  nett: number;
  nettUp: boolean;
}

export interface AkuisiChurn {
  stats: AkuisiChurnStat[];
  rincian: AkuisiChurnRincian[];
}

export interface TrendSeries {
  label: string;
  warna: string;
  nilai: (number | null)[];
}

export interface TrendMetrik {
  nama: string;
  y2024: string;
  y2025: string;
  y2026: string;
}

export interface TrendEndbal {
  subtitle: string;
  bulan: string[];
  series: TrendSeries[];
  metrik: TrendMetrik[];
  catatan: string;
}

export interface BisnisDPK {
  endingBalance: DPKEndingBalance;
  rincianDPK: DPKBarTable;
  tabungan3PI: DPKBarTable;
  akuisiChurn: AkuisiChurn;
  trendEndbal: TrendEndbal;
}

export interface PencapaianRow {
  produk: string;
  kategori: string;
  aktual: string;
  target: string;
  capaian: string;
  growth: string;
  growthUp: boolean;
  statusCapaian: MetricStatus;
}

export interface RingkasanPencapaian {
  periodList: string[];
  rows: PencapaianRow[];
}

export interface BisnisRingkasan {
  ringkasanPencapaian: RingkasanPencapaian;
}

// Bisnis Kredit types
export interface KreditKPIStat {
  label: string;
  nilai: string;
  keterangan: string;
  keteranganStatus: 'good' | 'warning' | 'bad' | 'neutral';
  target?: string;
}

export interface KreditRingkasanKPIData {
  stats: KreditKPIStat[];
}

export interface KreditBookingStat {
  label: string;
  nilai: string;
  target?: string;
  keteranganStatus: 'good' | 'warning' | 'bad' | 'neutral';
}

export interface KreditBookingData {
  chips: string[];
  stats: KreditBookingStat[];
}

export interface TrenPencairanBar {
  date: string;   // ISO "2026-03-30"
  label: string;  // display "30 Mar"
  nilai: number;
}

export interface TrenPencairanData {
  chips: string[];
  allBars: TrenPencairanBar[];
  defaultRange: { start: string; end: string };
}

export interface KreditProdukGrowth {
  pct: string;
  up: boolean;
}

export interface KreditProdukItem {
  label: string;
  nilai: string;
  npl?: string;
  growth: Record<string, KreditProdukGrowth>;
}

export interface ShiftingRow {
  fromKol: string;
  toValues: (number | null)[];
}

export interface ShiftingSummary {
  label: string;
  warna: string;
  rekening: string;
  nilai: string;
}

export interface ShiftingKolektibilitas {
  kolList: string[];
  rows: ShiftingRow[];
  summary: ShiftingSummary[];
}

export interface KreditProdukData {
  chips: string[];
  produkList: KreditProdukItem[];
  shiftingByProduk: Record<string, ShiftingKolektibilitas>;
}

export interface BisnisKredit {
  endingBalance: DPKEndingBalance;
  ringkasanKPI: KreditRingkasanKPIData;
  booking: KreditBookingData;
  trendPencairan: TrenPencairanData;
  produk: KreditProdukData;
}

// Bisnis Livin types
export interface LivinKPIStat {
  label: string;
  nilai: string;
  keterangan?: string | null;
  keteranganStatus?: 'good' | 'warning' | 'bad' | 'neutral';
}

export interface LivinRingkasanKPIData {
  stats: LivinKPIStat[];
}

export interface LivinChannelSegment {
  label: string;
  pct: number;
  warna: string;
}

export interface LivinChannelRow {
  channel: string;
  ureg: number;
  growth: string;
  growthUp: boolean;
}

export interface LivinChannelData {
  title: string;
  segments: LivinChannelSegment[];
  rows: LivinChannelRow[];
}

export interface LivinProgresItem {
  label: string;
  nilai: number;
  pct: number;
}

export interface LivinProgresData {
  chips: string[];
  byChip: Record<string, LivinProgresItem[]>;
  infoBox: string;
}

export interface LivinFrekuensiItem {
  label: string;
  jumlah: number;
  pct: number;
}

export interface LivinFrekuensiData {
  chips: string[];
  byChip: Record<string, LivinFrekuensiItem[]>;
}

// Bisnis Kopra types
export interface KopraKeaktifanItem {
  label: string;
  jumlah: number;
  pct: number;
}

export interface KopraKeaktifanSegmen {
  nama: string;
  items: KopraKeaktifanItem[];
}

export interface KopraKeaktifanData {
  segmen: KopraKeaktifanSegmen[];
}

export interface KopraPipelineArea {
  nama: string;
  jarak: string;
  perusahaan: string;
  estimasiSV: string;
  target: number;
  onboard: number;
}

export interface KopraPipelineData {
  areas: KopraPipelineArea[];
  infoBox: string;
}

export interface BisnisKopra {
  endingBalance: DPKEndingBalance;
  ringkasanKPI: LivinRingkasanKPIData;
  trendUreg: TrenPencairanData;
  keaktifan: KopraKeaktifanData;
  pipeline: KopraPipelineData;
}

export interface BisnisLivin {
  endingBalance: DPKEndingBalance;
  ringkasanKPI: LivinRingkasanKPIData;
  channel: LivinChannelData;
  trendUreg: TrenPencairanData;
  progres: LivinProgresData;
  frekuensi: LivinFrekuensiData;
}

// Bisnis Merchant types
export interface MerchantPenguasaanLegend {
  label: string;
  warna: string;
}

export interface MerchantPenguasaanMarker {
  lat: number;
  lng: number;
  tipe: 'kopra' | 'edc' | 'lm' | 'belum';
}

export interface MerchantPenguasaanData {
  legend: MerchantPenguasaanLegend[];
  markers: MerchantPenguasaanMarker[];
}

export interface MerchantCakupanRow {
  segmen: string;
  edc: number;
  lm: number;
  kopra: number;
  belum: number;
}

export interface MerchantCakupanData {
  rows: MerchantCakupanRow[];
}

export interface MerchantCASASegment {
  label: string;
  pct: number;
  warna: string;
}

export interface MerchantCASARow {
  produk: string;
  balance: string;
  target: string;
  capaian: string;
  capaianStatus: MetricStatus;
  growth: string;
  growthUp: boolean;
}

export interface MerchantCASAData {
  segments: MerchantCASASegment[];
  rows: MerchantCASARow[];
  infoBox: string;
}

export interface BisnisEDC {
  endingBalance: DPKEndingBalance;
  ringkasanKPI: LivinRingkasanKPIData;
  trendAkuisisi: TrenPencairanData;
}

export interface BisnisLivinMerchant {
  endingBalance: DPKEndingBalance;
  ringkasanKPI: LivinRingkasanKPIData;
  trendAkuisisi: TrenPencairanData;
}

export interface BisnisMerchant {
  edc: BisnisEDC;
  livinMerchant: BisnisLivinMerchant;
  penguasaan: MerchantPenguasaanData;
  cakupan: MerchantCakupanData;
  casa: MerchantCASAData;
}

// ─────────────────────────────────────────────
// DPK Figma-aligned types
// ─────────────────────────────────────────────

export interface DpkPertumbuhan {
  label: string; // e.g. "MtD"
  nilai: string; // e.g. "-0,1%"
  up: boolean;
}

export interface DpkProductHero {
  label: string;           // section title e.g. "Tabungan"
  tanggal: string;         // "Last Update: 12 Mei 2026"
  avgBalance: string;      // "Rp9,4 T"
  avgTarget: string;       // "95% target"
  avgTargetUp: boolean;
  cof: string;             // "CoF 2,12%"
  endBalance?: string;     // "Rp9,8 T" (optional – Deposito has none)
  endTarget?: string;      // "95% target"
  endTargetUp?: boolean;
  pertumbuhanLabel: string; // "Pertumbuhan Ending Balance"
  pertumbuhan: DpkPertumbuhan[];
}

export interface DpkSegmenTile {
  nama: string;    // "Payroll"
  pct: number;     // 36
  nilai: string;   // "Rp3,5 T"
  targetPct: string; // "94%"
  mtdGrowth: string; // "+5,5% MtD"
  mtdUp: boolean;
  warna: string;
}

export interface DpkKomposisiSegmenData {
  judul: string;
  segments: { label: string; pct: number; nilai: string; warna: string }[];
}

export interface DpkNTBAkuisiRow {
  segmen: string;
  newVal: number;
  target: number;
  livin: number;
  churn: number;
  net: number;
}

export interface DpkNTBAkuisiData {
  judul: string;
  rows: DpkNTBAkuisiRow[];
  total: DpkNTBAkuisiRow;
}

export interface DpkTrendData {
  judul: string;
  yLabel: string;  // "Dalam (Rp T)"
  yTicks: number[];
  bulan: string[];
  series: { label: string; warna: string; nilai: (number | null)[] }[];
  tooltipDate: string;   // "12 Mei 2026"
  tooltipAvg: string;    // "Avg Bal: 9,4"
  tooltipEnd: string;    // "End Bal: 9,8"
  metriks: { nama: string; mar: string; apr: string; mei: string }[];
}

export interface DpkAkuisiGiroData {
  judul: string;
  newCIF: string;         // "312"
  newCIFTarget: string;   // "dari target 420"
  newCIFPct: string;      // "74%"
  newCIFPctUp: boolean;
  tiles: { label: string; nilai: string }[];
}

export interface DpkValutaData {
  judul: string;
  tiles: { mata: string; pct: number; nilai: string; warna: string }[];
}

export interface BisnisDPKTabungan {
  hero: DpkProductHero;
  trend: DpkTrendData;
  segmenGrid: DpkSegmenTile[];
  ntb: DpkNTBAkuisiData;
}

export interface BisnisDPKGiro {
  hero: DpkProductHero;
  komposisiSegmen: DpkKomposisiSegmenData;
  akuisiGiro: DpkAkuisiGiroData;
}

export interface BisnisDPKDeposito {
  hero: DpkProductHero;
  komposisiSegmen: DpkKomposisiSegmenData;
  valuta: DpkValutaData;
}

// ─────────────────────────────────────────────
// Kredit Figma-aligned types
// ─────────────────────────────────────────────

export interface KreditHeroData {
  label: string;
  tanggal: string;
  bakiDebet: string;
  bakiDebetTarget: string;
  bakiDebetPct: string;
  bakiDebetUp: boolean;
  yol: string;
  npl: string;
  nplStatus: string;   // "Terjaga"
  nplTarget: string;   // "Target ≤ 2,50%"
  nplUp: boolean;
  pertumbuhan: DpkPertumbuhan[];
}

export interface KreditVintageSeriesItem {
  tahun: string;
  warna: string;
  data: number[];
}

export interface KreditVintageData {
  judul: string;
  produkList: string[];
  bulanAxis: number[];  // [0,3,6,9,12,18,24,30,36]
  seriesByProduk: Record<string, KreditVintageSeriesItem[]>;
}

export interface KreditStatusAplikasiRow {
  produk: string;
  jumlah: string;
  nominal: string;
  proses: number;
  approved: number;
  reject: number;
  disb: number;
  disbNominal: string;
}

export interface KreditStatusAplikasiData {
  judul: string;
  rows: KreditStatusAplikasiRow[];
  total: KreditStatusAplikasiRow;
}

export interface KreditPotensiStage {
  dari: string;  // "01"
  ke: string;    // "2A"
  rekTotal: string;
  rekDowngrade: string;
  bakiTotal: string;
  bakiDowngrade: string;
  belumTertagih: string;
}

export interface KreditPotensiDowngradeData {
  judul: string;
  stages: KreditPotensiStage[];
  total: {
    rekTotal: string;
    bakiTotal: string;
    rekDowngrade: string;
    bakiDowngrade: string;
    belumTertagih: string;
  };
}

export interface KreditGuidelineRange {
  label: string;
  pct: number;
}

export interface KreditGuidelineItem {
  produk: string;
  status: 'Sesuai' | 'Tidak Sesuai';
  ranges: KreditGuidelineRange[];
}

export interface KreditGuidelineLimitData {
  judul: string;
  items: KreditGuidelineItem[];
}

// ─────────────────────────────────────────────
// Livin Figma-aligned types
// ─────────────────────────────────────────────

export interface LivinHeroData {
  label: string;
  tanggal: string;
  ureg: string;
  uregTarget: string;
  uregTargetUp: boolean;
  usakFin: string;
  usakFinTarget: string;
  usakFinTargetUp: boolean;
  pertumbuhanUreg: DpkPertumbuhan[];
  pertumbuhanUsak: DpkPertumbuhan[];
}

export interface LivinFBIData {
  judul: string;
  total: string;
  perUreg: string;
  jumlahAkun: string;
}

export interface LivinDataTerhubungData {
  judul: string;
  total: string;
  perUser: string;
  growthMom: string;
  growthUp: boolean;
}

export interface LivinPerformaRow {
  metrik: string;
  values: string[];
}

export interface LivinPerformaTransaksiData {
  judul: string;
  periods: string[];
  rows: LivinPerformaRow[];
}

export interface BisnisLivinV2 {
  hero: LivinHeroData;
  ringkasanKPI: LivinRingkasanKPIData;
  channel: LivinChannelData;
  trendUreg: TrenPencairanData;
  progres: LivinProgresData;
  frekuensi: LivinFrekuensiData;
  fbi: LivinFBIData;
  dataTerhubung: LivinDataTerhubungData;
  performa: LivinPerformaTransaksiData;
}

// ─────────────────────────────────────────────
// Kopra Figma-aligned types
// ─────────────────────────────────────────────

export interface KopraHeroData {
  label: string;
  tanggal: string;
  ureg: string;
  uregTarget: string;
  uregTargetUp: boolean;
  usak: string;
  usakTarget: string;
  usakTargetUp: boolean;
  pertumbuhanUreg: DpkPertumbuhan[];
  pertumbuhanUsak: DpkPertumbuhan[];
}

export interface KopraTransaksiFBIRow {
  metrik: string;
  prev: string;
  curr: string;
  target: string;
  pctAch: string;
  pctAchUp: boolean;
  growth: string;
  growthUp: boolean;
}

export interface KopraTransaksiFBIData {
  judul: string;
  prevLabel: string;
  currLabel: string;
  rows: KopraTransaksiFBIRow[];
}

export interface BisnisKopraV2 {
  hero: KopraHeroData;
  ringkasanKPI: LivinRingkasanKPIData;
  trendUreg: TrenPencairanData;
  keaktifan: KopraKeaktifanData;
  pipeline: KopraPipelineData;
  transaksiFBI: KopraTransaksiFBIData;
}

// ─────────────────────────────────────────────
// Merchant Figma-aligned types
// ─────────────────────────────────────────────

export interface MerchantHeroData {
  label: string;
  tanggal: string;
  jumlah: string;
  jumlahTarget: string;
  jumlahTargetUp: boolean;
  pertumbuhanJumlah: DpkPertumbuhan[];
  sv: string;
  svTarget: string;
  svTargetUp: boolean;
  pertumbuhanSV: DpkPertumbuhan[];
}

export interface MerchantStatusEDCSegmen {
  nama: string;
  total: number;
  optimal: number;
  optimalPct: number;
  kurang: number;
  kurangPct: number;
  tidak: number;
  tidakPct: number;
}

export interface MerchantStatusEDCData {
  judul: string;
  segments: MerchantStatusEDCSegmen[];
}

export interface MerchantIdleData {
  judul: string;
  bulan: string[];
  categories: string[];
  colors: string[];
  data: number[][];  // [bulanIdx][categoryIdx] = pct
}

export interface MerchantPerformaEDCRow {
  metrik: string;
  currVal: string;
  prevVal: string;
  growth: string;
  growthUp: boolean;
  target: string;
  pctAch: string;
  pctAchUp: boolean;
}

export interface MerchantPerformaEDCData {
  judul: string;
  currLabel: string;
  prevLabel: string;
  rows: MerchantPerformaEDCRow[];
}

export interface BisnisMerchantV2 {
  hero: MerchantHeroData;
  edc: BisnisEDC;
  livinMerchant: BisnisLivinMerchant;
  penguasaan: MerchantPenguasaanData;
  cakupan: MerchantCakupanData;
  casa: MerchantCASAData;
  statusEDC: MerchantStatusEDCData;
  idle: MerchantIdleData;
  performaEDC: MerchantPerformaEDCData;
}

// ─────────────────────────────────────────────
// GMM types
// ─────────────────────────────────────────────

export interface GMMKPIItem {
  label: string;
  nilai: string;
  target?: string;
  targetUp?: boolean;
}

export interface GMMTrendSeries {
  label: string;
  warna: string;
  nilai: number[];
}

export interface GMMBlockData {
  judul: string;
  tanggal: string;
  kpiItems: GMMKPIItem[];
  pertumbuhan: DpkPertumbuhan[];
  chartBulan: string[];
  chartSeries: GMMTrendSeries[];
}

export interface BisnisGMM {
  livin: GMMBlockData;
  dutaTransaksi: GMMBlockData;
  livinMerchant: GMMBlockData;
}

export interface DashboardData {
  cabang: CabangInfo;
  periode: string;
  periodeList: SelectOption[];
  cabangList: SelectOption[];
  pesanRCEO: PesanRCEO;
  skorCabang: SkorCabang;
  trenSkor: TrenSkor;
  alertProyeksi: AlertItem[];
  skorBisnis: SkorSection;
  skorStrategi: SkorSection;
  skorFinansial: SkorSection;
  skorOperasional: SkorSection;
  temuanAudit: TemuanAudit;
  marketShare: MarketShare;
  ringkasanKPI: RingkasanKPI;
}
