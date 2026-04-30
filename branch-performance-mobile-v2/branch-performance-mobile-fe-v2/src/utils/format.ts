const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];

export function formatRupiah(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '-';
  const abs = Math.abs(value);
  let result: string;
  if (abs >= 1e12) {
    result = (value / 1e12).toFixed(1).replace('.', ',') + ' T';
  } else if (abs >= 1e9) {
    result = (value / 1e9).toFixed(1).replace('.', ',') + ' M';
  } else if (abs >= 1e6) {
    result = (value / 1e6).toFixed(1).replace('.', ',') + ' Jt';
  } else {
    result = value.toFixed(0);
  }
  return 'Rp' + result;
}

export function formatPct(value: number | null | undefined, decimals = 1): string {
  if (value == null || isNaN(value)) return '-';
  return value.toFixed(decimals).replace('.', ',') + '%';
}

export function formatGrowth(value: number | null | undefined, label?: string): string {
  if (value == null || isNaN(value)) return '-';
  const sign = value > 0 ? '+' : '';
  const pct = sign + value.toFixed(1).replace('.', ',') + '%';
  return label ? pct + ' ' + label : pct;
}

export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function isPositive(value: number | null | undefined): boolean {
  return (value ?? 0) >= 0;
}
