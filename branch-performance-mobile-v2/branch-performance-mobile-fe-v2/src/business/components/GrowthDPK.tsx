import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import Svg, {Polyline, Circle, Rect, Text as SvgText} from 'react-native-svg';
import {useDanaChart, useDanaGrowth} from '../../hooks/useDana';
import {formatGrowth, isPositive} from '../../utils/format';

// ─── Chart constants ──────────────────────────────────────────────────────────
const LINE_AREA = 70;
const CHART_H = 160;
const BAR_W = 46;
const BAR_GAP = 12;
const MAX_BARS = 5;
const BADGE_W = 28;
const BADGE_H = 13;
const BADGE_RX = 3;

// ─── Pill Toggle ──────────────────────────────────────────────────────────────
interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const Pill: React.FC<PillProps> = ({label, active, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pill, active && styles.pillActive]}>
    <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Scale helper ─────────────────────────────────────────────────────────────
function scaleToH(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map(v => Math.round((v / max) * CHART_H));
}

function lineYs(scaledH: number[]): number[] {
  return scaledH.map(h => LINE_AREA + CHART_H - h);
}

function buildPoints(ys: number[], count: number): string {
  return ys
    .slice(0, count)
    .map((y, i) => `${BAR_W / 2 + i * (BAR_W + BAR_GAP)},${y}`)
    .join(' ');
}

// ─── Component ────────────────────────────────────────────────────────────────
const GrowthDPK: React.FC = () => {
  const [periodTab, setPeriodTab] = useState<'Kuartal' | 'Tahun'>('Kuartal');
  const [valueTab, setValueTab] = useState<'Nominal' | 'Proporsi'>('Nominal');

  const groupBy = periodTab === 'Kuartal' ? 'QUARTERLY' : 'YEARLY';
  const {data: chart, loading: chartLoading} = useDanaChart(groupBy);
  const {data: growth} = useDanaGrowth();

  const barCount = Math.min(chart?.labels?.length ?? 0, MAX_BARS);
  const hasChart = barCount > 0;
  const isProporsi = valueTab === 'Proporsi';

  // Take last MAX_BARS data points
  const labels = chart?.labels?.slice(-MAX_BARS) ?? [];
  const endBalsRaw = chart?.endingBalance?.slice(-MAX_BARS) ?? [];
  const avgBalsRaw = chart?.avgBalance?.slice(-MAX_BARS) ?? [];

  // Proporsi: % change relative to first point in visible window
  function toProporsi(vals: number[]): number[] {
    if (vals.length === 0 || vals[0] === 0) return vals;
    return vals.map(v => ((v - vals[0]) / Math.abs(vals[0])) * 100);
  }

  const endBals = isProporsi ? toProporsi(endBalsRaw) : endBalsRaw;
  const avgBals = isProporsi ? toProporsi(avgBalsRaw) : avgBalsRaw;

  const endScaled = scaleToH(endBals.map(v => (isProporsi ? Math.abs(v) : v)));
  const avgScaled = scaleToH(avgBals.map(v => (isProporsi ? Math.abs(v) : v)));
  const endLineYs = lineYs(endScaled);
  const avgLineYs = lineYs(avgScaled);

  const CHART_W = barCount * BAR_W + Math.max(barCount - 1, 0) * BAR_GAP;

  function fmtLabel(v: number): string {
    if (isProporsi) {
      const sign = v >= 0 ? '+' : '';
      return sign + v.toFixed(1).replace('.', ',') + '%';
    }
    if (Math.abs(v) >= 1e12) return (v / 1e12).toFixed(1).replace('.', ',');
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',');
    return v.toFixed(0);
  }

  const ytdGrowth = growth?.growthYtd ?? 0;
  const momGrowth = growth?.growthMom ?? 0;
  const ytdLabel = formatGrowth(ytdGrowth, 'YtD');
  const momLabel = formatGrowth(momGrowth, 'MoM');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Pertumbuhan & Komposisi Dana</Text>
          {chartLoading && <ActivityIndicator size="small" color="#0F2D5A" />}
        </View>
        <Text style={styles.lastUpdate}>Data dari API Backend</Text>
      </View>

      {/* Pill Toggles */}
      <View style={styles.pillsRow}>
        <View style={styles.pillGroup}>
          <Pill label="Kuartal" active={periodTab === 'Kuartal'} onPress={() => setPeriodTab('Kuartal')} />
          <Pill label="Tahun" active={periodTab === 'Tahun'} onPress={() => setPeriodTab('Tahun')} />
        </View>
        <View style={styles.pillGroup}>
          <Pill label="Nominal" active={valueTab === 'Nominal'} onPress={() => setValueTab('Nominal')} />
          <Pill label="Proporsi" active={valueTab === 'Proporsi'} onPress={() => setValueTab('Proporsi')} />
        </View>
      </View>

      <Text style={styles.chartLabel}>{isProporsi ? '% perubahan dari periode awal' : 'Dalam (Rp T)'}</Text>

      {/* ── Chart ── */}
      {hasChart ? (
        <View style={[styles.chartWrap, {width: CHART_W}]}>
          <Svg width={CHART_W} height={LINE_AREA + CHART_H} style={styles.svgOverlay}>

            {/* Ending Balance line (blue) */}
            {barCount >= 2 && (
              <Polyline
                points={buildPoints(endLineYs, barCount)}
                fill="none"
                stroke="#00467E"
                strokeWidth={1.5}
              />
            )}
            {endLineYs.slice(0, barCount).map((y, i) => {
              const cx = BAR_W / 2 + i * (BAR_W + BAR_GAP);
              const badgeTop = y - BADGE_H - 3;
              return (
                <React.Fragment key={`end-${i}`}>
                  <Rect x={cx - BADGE_W / 2} y={badgeTop} width={BADGE_W} height={BADGE_H} rx={BADGE_RX} fill="#00467E" />
                  <SvgText x={cx} y={badgeTop + BADGE_H - 3} fontSize={8} fill="#FFFFFF" textAnchor="middle" fontWeight="700">
                    {fmtLabel(endBals[i])}
                  </SvgText>
                  <Circle cx={cx} cy={y} r={3} fill="#00467E" />
                </React.Fragment>
              );
            })}

            {/* Avg Balance line (dark) */}
            {barCount >= 2 && (
              <Polyline
                points={buildPoints(avgLineYs, barCount)}
                fill="none"
                stroke="#121417"
                strokeWidth={1.5}
              />
            )}
            {avgLineYs.slice(0, barCount).map((y, i) => {
              const cx = BAR_W / 2 + i * (BAR_W + BAR_GAP);
              const badgeTop = y - BADGE_H - 3;
              return (
                <React.Fragment key={`avg-${i}`}>
                  <Rect x={cx - BADGE_W / 2} y={badgeTop} width={BADGE_W} height={BADGE_H} rx={BADGE_RX} fill="#121417" />
                  <SvgText x={cx} y={badgeTop + BADGE_H - 3} fontSize={8} fill="#FFFFFF" textAnchor="middle" fontWeight="700">
                    {fmtLabel(avgBals[i])}
                  </SvgText>
                  <Circle cx={cx} cy={y} r={3} fill="#121417" />
                </React.Fragment>
              );
            })}
          </Svg>

          {/* Bars = ending balance heights */}
          <View style={[styles.barsRow, {marginTop: LINE_AREA}]}>
            {endScaled.slice(0, barCount).map((h, i) => (
              <View key={i} style={styles.barGroup}>
                <View style={[styles.barContainer, {height: CHART_H}]}>
                  <View style={[styles.barSegment, {height: h, backgroundColor: '#00467E'}, styles.barRounded]} />
                </View>
                <Text style={styles.barLabel}>{labels[i]}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>
            {chartLoading ? 'Memuat data...' : 'Data chart tidak tersedia'}
          </Text>
        </View>
      )}

      {/* Ending Balance badge */}
      <View style={styles.badge}>
        <View style={[styles.badgeDot, {backgroundColor: '#00467E'}]} />
        <Text style={styles.badgeName}>Ending Balance</Text>
        <Text style={[styles.badgeValue, isPositive(ytdGrowth) ? styles.green : styles.red]}>
          {ytdLabel}
        </Text>
      </View>

      {/* Avg Balance badge */}
      <View style={styles.badge}>
        <View style={[styles.badgeDot, {backgroundColor: '#121417'}]} />
        <Text style={styles.badgeName}>Avg Balance</Text>
        <Text style={[styles.badgeValue, isPositive(momGrowth) ? styles.green : styles.red]}>
          {momLabel}
        </Text>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#00467E',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.14,
    shadowRadius: 25,
    elevation: 4,
  },
  headerBlock: {gap: 2},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {fontSize: 16, fontWeight: '700', color: '#0F2D5A', lineHeight: 24},
  lastUpdate: {fontSize: 10, color: '#7B8798', fontStyle: 'italic', lineHeight: 15},
  pillsRow: {flexDirection: 'row', justifyContent: 'space-between'},
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F6',
    borderRadius: 17,
    height: 32,
    alignItems: 'center',
    padding: 2,
  },
  pill: {
    paddingHorizontal: 12,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
  },
  pillActive: {backgroundColor: '#0F2D5A'},
  pillText: {fontSize: 12, fontWeight: '400', color: '#0F2D5A', lineHeight: 18},
  pillTextActive: {fontWeight: '700', color: '#FFFFFF'},
  chartLabel: {fontSize: 12, color: '#7B8798', lineHeight: 18, marginBottom: -8},
  chartWrap: {position: 'relative', alignSelf: 'center'},
  svgOverlay: {position: 'absolute', top: 0, left: 0, zIndex: 2},
  barsRow: {flexDirection: 'row', gap: BAR_GAP, alignItems: 'flex-end'},
  barGroup: {alignItems: 'center', gap: 8, width: BAR_W},
  barContainer: {width: BAR_W, justifyContent: 'flex-end'},
  barSegment: {width: BAR_W, alignItems: 'center', justifyContent: 'center'},
  barRounded: {borderTopLeftRadius: 4, borderTopRightRadius: 4},
  barLabel: {fontSize: 10, color: '#7B8798', lineHeight: 15, textAlign: 'center'},
  emptyChart: {
    height: LINE_AREA + CHART_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {fontSize: 12, color: '#7B8798'},
  badge: {
    backgroundColor: '#F4F5F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  badgeDot: {width: 8, height: 8, borderRadius: 2},
  badgeName: {fontSize: 12, fontWeight: '700', color: '#00467E', lineHeight: 18},
  badgeValue: {fontSize: 12, fontWeight: '700', lineHeight: 18},
  green: {color: '#2E7D32'},
  red: {color: '#D3000E'},
});

export default GrowthDPK;
