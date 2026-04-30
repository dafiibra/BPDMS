import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, PanResponder} from 'react-native';
import Svg, {
  Polyline,
  Circle,
  Line,
  Path,
} from 'react-native-svg';
import {
  useTabunganSummary, useTabunganGrowth, useTabunganChart,
  useTabunganComposition, useTabunganMetrics, useNtbSummary,
} from '../../hooks/useTabungan';
import {TabunganChart, TabunganMetrics, NtbSummary} from '../../api/tabunganApi';

// ─── Shared sub-components ───────────────────────────────────────────────────

interface InfoIconProps {
  color?: string;
}
const InfoIcon: React.FC<InfoIconProps> = ({color = '#0081E9'}) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M12 8v1M12 11v5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const Pill: React.FC<PillProps> = ({label, active, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[tabStyles.pill, active && tabStyles.pillActive]}>
    <Text style={[tabStyles.pillText, active && tabStyles.pillTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtRp(val?: number | null): string {
  if (val == null) return 'Rp—';
  if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `Rp${(val / 1e9).toFixed(1)}M`;
  if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}jt`;
  return `Rp${val.toLocaleString('id-ID')}`;
}

function buildTrendData(chart: TabunganChart): TrendPoint[] {
  const allVals = [
    ...chart.endingBalance,
    ...(chart.prevEndingBalance ?? []),
    ...chart.avgBalance,
    ...(chart.prevAvgBalance ?? []),
  ].filter((v): v is number => v != null && v > 0);
  if (allVals.length === 0) return [];
  const maxVal = Math.max(...allVals);
  const scale = (v: number | null | undefined): number | null =>
    v == null || maxVal === 0 ? null : Math.round(CHART_H - (v / maxVal) * CHART_H * 0.85);
  const fmt = (v: number | null | undefined): string | null =>
    v == null ? null : (v / 1e12).toFixed(2);

  return chart.labels.map((_, i) => ({
    eb26: scale(chart.endingBalance[i]),
    eb25: scale(chart.prevEndingBalance?.[i]) ?? CHART_H,
    ab26: scale(chart.avgBalance[i]),
    ab25: scale(chart.prevAvgBalance?.[i]) ?? CHART_H,
    eb26Val: fmt(chart.endingBalance[i]),
    eb25Val: fmt(chart.prevEndingBalance?.[i]) ?? '—',
    ab26Val: fmt(chart.avgBalance[i]),
    ab25Val: fmt(chart.prevAvgBalance?.[i]) ?? '—',
  }));
}

// ─── Mini line chart ──────────────────────────────────────────────────────────
const CHART_H = 110;
const TREND_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const TOOLTIP_W = 160;

interface TrendPoint {
  eb26: number | null; // y-pos (0=top). null = no data yet
  eb25: number;
  ab26: number | null;
  ab25: number;
  eb26Val: string | null;
  eb25Val: string;
  ab26Val: string | null;
  ab25Val: string;
}

function buildPoints(
  data: TrendPoint[],
  key: 'eb26' | 'eb25' | 'ab26' | 'ab25',
  step: number,
): string {
  return data
    .map((d, i) => {
      const y = d[key];
      return y !== null ? `${i * step},${y}` : null;
    })
    .filter((p): p is string => p !== null)
    .join(' ');
}

interface LegendItemProps {
  color: string;
  dashed: boolean;
  label: string;
}
const LegendItem: React.FC<LegendItemProps> = ({color, dashed, label}) => (
  <View style={tabStyles.legendItem}>
    <Svg width={24} height={10}>
      <Line
        x1={0}
        y1={5}
        x2={24}
        y2={5}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={dashed ? '4 2' : undefined}
      />
    </Svg>
    <Text style={tabStyles.legendText}>{label}</Text>
  </View>
);

const TrendChart: React.FC<{data: TrendPoint[]; labels: string[]}> = ({data, labels}) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const panRef = useRef({
    chartWidth: 0,
    activeIdx: null as number | null,
    setActiveIdx: null as ((v: number | null) => void) | null,
  });
  panRef.current.setActiveIdx = setActiveIdx;
  panRef.current.activeIdx = activeIdx;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const w = panRef.current.chartWidth;
        if (w <= 0) { return; }
        const s = w / (data.length - 1);
        const idx = Math.max(
          0,
          Math.min(Math.round(evt.nativeEvent.locationX / s), data.length - 1),
        );
        // Toggle: tap same spot to dismiss
        panRef.current.setActiveIdx?.(
          panRef.current.activeIdx === idx ? null : idx,
        );
      },
      onPanResponderMove: evt => {
        const w = panRef.current.chartWidth;
        if (w <= 0) { return; }
        const s = w / (data.length - 1);
        const idx = Math.max(
          0,
          Math.min(Math.round(evt.nativeEvent.locationX / s), data.length - 1),
        );
        panRef.current.setActiveIdx?.(idx);
      },
    }),
  ).current;

  const step = chartWidth > 0 ? chartWidth / (data.length - 1) : 0;
  const activeX = activeIdx !== null ? activeIdx * step : null;
  const activePt = activeIdx !== null ? data[activeIdx] : null;
  const tooltipLeft =
    activeX !== null
      ? Math.max(0, Math.min(activeX - TOOLTIP_W / 2, chartWidth - TOOLTIP_W))
      : 0;

  return (
    <View style={tabStyles.chartContainer}>
      <Text style={tabStyles.chartUnit}>Dalam (Rp T)</Text>
      <View style={tabStyles.chartArea}>
        {/* Y-axis labels */}
        <View style={tabStyles.yLabels}>
          {['—', '—', '—', '—', '—'].map((v, i) => (
            <Text key={i} style={tabStyles.yLabel}>
              {v}
            </Text>
          ))}
        </View>

        {/* Chart SVG + tooltip overlay */}
        <View
          style={tabStyles.chartSvgWrap}
          onLayout={e => {
            const w = e.nativeEvent.layout.width;
            setChartWidth(w);
            panRef.current.chartWidth = w;
          }}
          {...panResponder.panHandlers}>
          {chartWidth > 0 && (
            <Svg width={chartWidth} height={CHART_H}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <Line
                  key={i}
                  x1={0}
                  y1={(CHART_H / 4) * i}
                  x2={chartWidth}
                  y2={(CHART_H / 4) * i}
                  stroke="#EBECED"
                  strokeWidth={0.5}
                />
              ))}
              {/* Vertical crosshair */}
              {activeX !== null && (
                <Line
                  x1={activeX}
                  y1={0}
                  x2={activeX}
                  y2={CHART_H}
                  stroke="#B5BBC5"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
              )}
              {/* End Bal 2025 — solid light blue */}
              <Polyline
                points={buildPoints(data, 'eb25', step)}
                fill="none"
                stroke="#0081E9"
                strokeWidth={1.5}
              />
              {/* Avg Bal 2025 — dashed light blue */}
              <Polyline
                points={buildPoints(data, 'ab25', step)}
                fill="none"
                stroke="#0081E9"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              {/* End Bal 2026 — solid dark blue */}
              <Polyline
                points={buildPoints(data, 'eb26', step)}
                fill="none"
                stroke="#00467E"
                strokeWidth={2}
              />
              {/* Avg Bal 2026 — dashed dark blue */}
              <Polyline
                points={buildPoints(data, 'ab26', step)}
                fill="none"
                stroke="#00467E"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            </Svg>
          )}

          {/* Floating tooltip */}
          {activeIdx !== null && activePt !== null && (
            <View style={[tabStyles.trendTooltip, {left: tooltipLeft}]}>
              <Text style={tabStyles.trendTooltipMonth}>
                {labels[activeIdx] ?? TREND_MONTHS[activeIdx]}
              </Text>
              <View style={tabStyles.trendTooltipRow}>
                <Text style={tabStyles.trendTooltipVal}>
                  {'Avg Bal: '}
                  <Text style={tabStyles.trendTooltipNum}>
                    {(activePt.ab26Val !== null ? activePt.ab26Val : activePt.ab25Val) + ' T'}
                  </Text>
                </Text>
                <Text style={tabStyles.trendTooltipVal}>
                  {'End Bal: '}
                  <Text style={tabStyles.trendTooltipNum}>
                    {(activePt.eb26Val !== null ? activePt.eb26Val : activePt.eb25Val) + ' T'}
                  </Text>
                </Text>
              </View>
            </View>
          )}

          {/* X-axis labels */}
          <View style={tabStyles.xLabels}>
            {(labels.length > 0 ? labels : ['—', '—', '—', '—', '—']).map((v, i) => (
              <Text key={i} style={tabStyles.xLabel}>{v}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={tabStyles.legendRow}>
        <LegendItem color="#00467E" dashed={false} label="End Bal 2026" />
        <LegendItem color="#0081E9" dashed={false} label="End Bal 2025" />
        <LegendItem color="#00467E" dashed={true}  label="Avg Bal 2026" />
        <LegendItem color="#0081E9" dashed={true}  label="Avg Bal 2025" />
      </View>
    </View>
  );
};

// ─── Metrics Table ────────────────────────────────────────────────────────────
const MetricsTable: React.FC<{metrics?: TabunganMetrics | null}> = ({metrics}) => (
  <View style={tabStyles.table}>
    <View style={[tabStyles.tableRow, tabStyles.tableHeader]}>
      <Text style={[tabStyles.tableCell, tabStyles.tableCellFlex, tabStyles.tableHeaderText]}>Metrik</Text>
      <Text style={[tabStyles.tableCell, tabStyles.tableCellFixed, tabStyles.tableHeaderText, tabStyles.textRight]}>Nilai</Text>
    </View>
    <View style={tabStyles.tableRow}>
      <Text style={[tabStyles.tableCell, tabStyles.tableCellFlex, tabStyles.tableLabelBold]}>Kenaikan 5 Hari Terakhir</Text>
      <Text style={[tabStyles.tableCell, tabStyles.tableCellFixed, tabStyles.textRight, tabStyles.tableBold]}>
        {metrics ? fmtRp(metrics.delta5Days) : '—'}
      </Text>
    </View>
    <View style={tabStyles.tableRow}>
      <Text style={[tabStyles.tableCell, tabStyles.tableCellFlex, tabStyles.tableLabelBold]}>% Tab Retail</Text>
      <Text style={[tabStyles.tableCell, tabStyles.tableCellFixed, tabStyles.textRight, tabStyles.tableRegular]}>
        {metrics ? `${metrics.retailProportion.toFixed(1)}%` : '—'}
      </Text>
    </View>
  </View>
);

// ─── Segment Cards (2×2 grid) ─────────────────────────────────────────────────
interface SegmentCardProps {
  name: string;
  share: string;
  value: string;
  target: string;
  targetOk: boolean;
  growth: string;
  growthPositive: boolean;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  name,
  share,
  value,
  target,
  targetOk,
  growth,
  growthPositive,
}) => (
  <View style={tabStyles.segCard}>
    <View style={tabStyles.segCardHeader}>
      <Text style={tabStyles.segCardName}>{name}</Text>
      <Text style={tabStyles.segCardDot}>•</Text>
      <Text style={tabStyles.segCardShare}>{share}</Text>
    </View>
    <Text style={tabStyles.segCardValue}>{value}</Text>
    <View style={tabStyles.segCardFooter}>
      <Text style={[tabStyles.segCardTarget, targetOk ? tabStyles.textAmber : tabStyles.textRed]}>
        {target}
      </Text>
      <Text style={tabStyles.segCardDot}>•</Text>
      <Text style={[tabStyles.segCardGrowth, growthPositive ? tabStyles.textGreen : tabStyles.textRed]}>
        {growth}
      </Text>
    </View>
  </View>
);

// ─── NTB Table ────────────────────────────────────────────────────────────────
const NtbTable: React.FC<{
  ntb?: NtbSummary | null;
  period: 'MtD' | 'YtD';
  onPeriodChange: (p: 'MtD' | 'YtD') => void;
}> = ({ntb, period, onPeriodChange}) => {
  const [filter] = useState('Bulanan');

  return (
    <View style={tabStyles.ntbSection}>
      <View style={tabStyles.ntbTitleRow}>
        <Text style={tabStyles.sectionTitle}>Akuisisi New to Bank (NTB) Tabungan</Text>
        <View style={tabStyles.infoBadge}>
          <InfoIcon color="#0081E9" />
        </View>
      </View>

      <View style={tabStyles.ntbFilterRow}>
        <View style={tabStyles.pillGroup}>
          {(['MtD', 'YtD'] as const).map(p => (
            <Pill key={p} label={p} active={period === p} onPress={() => onPeriodChange(p)} />
          ))}
        </View>
        <View style={tabStyles.filterBtn}>
          <Text style={tabStyles.filterBtnText}>{filter}</Text>
          <Text style={tabStyles.filterChevron}>›</Text>
        </View>
      </View>

      {/* NTB Table */}
      <View style={tabStyles.table}>
        {/* Header */}
        <View style={[tabStyles.tableRow, tabStyles.tableHeader]}>
          <Text style={[tabStyles.tableCell, {width: 64}, tabStyles.tableHeaderText]}>Total</Text>
          {['New', 'Target', 'Livin', 'Churn', 'Net'].map(h => (
            <Text key={h} style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.tableHeaderText]}>
              {h}
            </Text>
          ))}
        </View>
        {/* Rows */}
        {(ntb?.segments ?? []).map((row, i) => (
          <View key={i} style={[tabStyles.tableRow, tabStyles.ntbRow]}>
            <View style={{width: 64}}>
              <Text style={tabStyles.ntbSegment}>{row.segmentName}</Text>
              <Text style={[tabStyles.ntbTarget, (row.achievementPct ?? 0) >= 80 ? tabStyles.textAmber : tabStyles.textRed]}>
                {`${(row.achievementPct ?? 0).toFixed(0)}%`}
              </Text>
            </View>
            <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbDataText]}>{row.newAccount}</Text>
            <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbDataText]}>{row.target}</Text>
            <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbDataText]}>{row.live}</Text>
            <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbDataChurn]}>{row.churn}</Text>
            <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbDataNet]}>{row.net >= 0 ? `+${row.net}` : `${row.net}`}</Text>
          </View>
        ))}
        {/* Total Row */}
        <View style={[tabStyles.tableRow, tabStyles.ntbRow]}>
          <Text style={[{width: 64}, tabStyles.ntbSegment, {color: '#0F2D5A'}]}>Total</Text>
          <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbTotalText]}>
            {ntb?.total.newAccount ?? '—'}
          </Text>
          <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbTotalText]}>
            {ntb?.total.target ?? '—'}
          </Text>
          <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbTotalText]}>
            {ntb?.total.live ?? '—'}
          </Text>
          <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbTotalChurn]}>
            {ntb?.total.churn ?? '—'}
          </Text>
          <Text style={[tabStyles.tableCell, tabStyles.ntbColText, tabStyles.ntbTotalNet]}>
            {ntb?.total.net != null ? (ntb.total.net >= 0 ? `+${ntb.total.net}` : `${ntb.total.net}`) : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main TabunganCard ────────────────────────────────────────────────────────
const TabunganCard: React.FC = () => {
  const [segPeriod, setSegPeriod] = useState<'MtD' | 'MoM' | 'YtD' | 'YoY'>('MtD');
  const [ntbPeriod, setNtbPeriod] = useState<'MtD' | 'YtD'>('MtD');

  const {data: summary} = useTabunganSummary();
  const {data: growth} = useTabunganGrowth();
  const {data: chart} = useTabunganChart();
  const {data: composition} = useTabunganComposition(segPeriod);
  const {data: metrics} = useTabunganMetrics();
  const {data: ntb} = useNtbSummary(ntbPeriod === 'MtD' ? 'MTD' : 'YTD');

  const trendData = chart ? buildTrendData(chart) : [];
  const trendLabels = chart?.labels ?? [];

  const segmentCards: SegmentCardProps[] = (composition?.segments ?? []).map(seg => ({
    name: seg.segmentName,
    share: `${seg.proportion?.toFixed(1) ?? '0'}%`,
    value: fmtRp(seg.endingBalance),
    target: `${(0).toFixed(1)}% target`,
    targetOk: false,
    growth: `0% ${segPeriod}`,
    growthPositive: true,
  }));

  return (
    <View style={tabStyles.card}>
      {/* Card Header */}
      <View style={tabStyles.cardHeader}>
        <Text style={tabStyles.cardTitle}>Tabungan</Text>
        <Text style={tabStyles.cardLastUpdate}>Last Update: {summary?.snapshotDate ?? '—'}</Text>
      </View>

      <View style={tabStyles.cardBody}>
        {/* ── Inner Hero Card ── */}
        <View style={tabStyles.heroCard}>
          <View style={tabStyles.heroBalanceRow}>
            <View style={tabStyles.heroCol}>
              <Text style={tabStyles.heroLabel}>Average Balance</Text>
              <Text style={tabStyles.heroValue}>{fmtRp(summary?.avgBalance)}</Text>
              <View style={tabStyles.targetBadge}>
                <Text style={tabStyles.targetBadgeText}>{summary?.avgBalanceAchievementPct?.toFixed(1) ?? '—'}% target</Text>
              </View>
              <Text style={tabStyles.heroSub}>CoF {summary?.cof?.toFixed(2) ?? '—'}%</Text>
            </View>
            <View style={tabStyles.heroDivider} />
            <View style={tabStyles.heroCol}>
              <Text style={tabStyles.heroLabel}>Ending Balance</Text>
              <Text style={tabStyles.heroValue}>{fmtRp(summary?.endingBalance)}</Text>
              <View style={tabStyles.targetBadge}>
                <Text style={tabStyles.targetBadgeText}>{summary?.endingBalanceAchievementPct?.toFixed(1) ?? '—'}% target</Text>
              </View>
            </View>
          </View>

          <View style={tabStyles.heroBorderH} />

          <View style={tabStyles.heroGrowthRow}>
            <Text style={tabStyles.heroGrowthTitle}>Pertumbuhan Ending Balance</Text>
            <View style={tabStyles.infoBadge}>
              <InfoIcon color="#0081E9" />
            </View>
          </View>

          <View style={tabStyles.growthBadgesRow}>
            {[
              {label: `${growth?.growthMtd?.toFixed(1) ?? '—'}% MtD`, pos: (growth?.growthMtd ?? 0) >= 0},
              {label: `${growth?.growthMom?.toFixed(1) ?? '—'}% MoM`, pos: (growth?.growthMom ?? 0) >= 0},
              {label: `${growth?.growthYtd?.toFixed(1) ?? '—'}% YtD`, pos: (growth?.growthYtd ?? 0) >= 0},
              {label: `${growth?.growthYoy?.toFixed(1) ?? '—'}% YoY`, pos: (growth?.growthYoy ?? 0) >= 0},
            ].map((b, i) => (
              <View key={i} style={[tabStyles.growthBadge, b.pos ? tabStyles.growthBadgeGreen : tabStyles.growthBadgeRed]}>
                <Text style={[tabStyles.growthBadgeText, b.pos ? tabStyles.textGreen : tabStyles.textRed]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Trend Chart Section ── */}
        <View style={tabStyles.section}>
          <Text style={tabStyles.sectionTitle}>
            Tren Ending Balance & Average Balance Tabungan Harian
          </Text>
          <TrendChart data={trendData} labels={trendLabels} />
          <MetricsTable metrics={metrics} />
        </View>

        {/* ── Komposisi Endbal per Segmen ── */}
        <View style={tabStyles.section}>
          <Text style={tabStyles.sectionTitle}>
            Komposisi Endbal Tabungan per Segmen
          </Text>
          <View style={tabStyles.pillGroup}>
            {(['MtD', 'MoM', 'YtD', 'YoY'] as const).map(p => (
              <Pill
                key={p}
                label={p}
                active={segPeriod === p}
                onPress={() => setSegPeriod(p)}
              />
            ))}
          </View>
          <View style={tabStyles.segGrid}>
            {segmentCards.map((card, i) => (
              <SegmentCard key={i} {...card} />
            ))}
          </View>
        </View>

        {/* ── NTB Table ── */}
        <NtbTable ntb={ntb} period={ntbPeriod} onPeriodChange={setNtbPeriod} />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  // ── Card shell ──
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0F2D5A',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 4,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 24,
  },
  cardLastUpdate: {
    fontSize: 10,
    color: '#B5BBC5',
    fontStyle: 'italic',
    lineHeight: 15,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 24,
  },

  // ── Inner Hero ──
  heroCard: {
    borderWidth: 1,
    borderColor: '#EBECED',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  heroBalanceRow: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 8,
  },
  heroCol: {
    flex: 1,
    gap: 8,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#00223D',
    lineHeight: 21,
  },
  heroValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00467E',
    lineHeight: 28,
  },
  targetBadge: {
    backgroundColor: '#FFF9EB',
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BC8602',
    lineHeight: 18,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#00467E',
    lineHeight: 18,
  },
  heroDivider: {
    width: 1,
    backgroundColor: '#EBECED',
    borderRadius: 16,
    alignSelf: 'stretch',
  },
  heroBorderH: {
    height: 1,
    backgroundColor: '#EBECED',
    borderRadius: 16,
  },
  heroGrowthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroGrowthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 21,
  },
  infoBadge: {
    backgroundColor: '#EBF6FF',
    padding: 4,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthBadgesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  growthBadge: {
    flex: 1,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 1111,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  growthBadgeRed: {backgroundColor: '#FFEBEC'},
  growthBadgeGreen: {backgroundColor: '#F0FAF1'},
  growthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  // ── Colors ──
  textGreen: {color: '#2E7D32'},
  textRed: {color: '#D3000E'},
  textAmber: {color: '#BC8602'},
  textRight: {textAlign: 'right'},

  // ── Sections ──
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 21,
  },

  // ── Trend Chart ──
  chartContainer: {
    gap: 12,
  },
  chartUnit: {
    fontSize: 12,
    color: '#7B8798',
    lineHeight: 18,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  yLabels: {
    justifyContent: 'space-between',
    height: CHART_H,
    paddingBottom: 0,
  },
  yLabel: {
    fontSize: 10,
    color: '#7B8798',
    lineHeight: 15,
    textAlign: 'right',
    width: 30,
  },
  chartSvgWrap: {
    flex: 1,
    gap: 4,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  xLabel: {
    fontSize: 10,
    color: '#7B8798',
    lineHeight: 15,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    rowGap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#7B8798',
    lineHeight: 18,
  },
  trendTooltip: {
    position: 'absolute',
    top: 0,
    width: TOOLTIP_W,
    backgroundColor: '#F4F5F6',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 2,
  },
  trendTooltipMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 16,
  },
  trendTooltipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trendTooltipVal: {
    flex: 1,
    fontSize: 10,
    color: '#404852',
    lineHeight: 15,
  },
  trendTooltipNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00467E',
  },

  // ── Metrics Table ──
  table: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EBECED',
    overflow: 'hidden',
    gap: 1,
    backgroundColor: '#EBECED',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  tableHeader: {
    paddingVertical: 14,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#404852',
    lineHeight: 18,
  },
  tableCell: {
    fontSize: 12,
    lineHeight: 18,
  },
  tableCellFlex: {
    flex: 1,
  },
  tableCellFixed: {
    width: 48,
  },
  tableLabelBold: {
    fontWeight: '700',
    color: '#0F2D5A',
    flex: 1,
  },
  tableBold: {
    fontWeight: '700',
  },
  tableRegular: {
    fontWeight: '400',
    color: '#404852',
  },

  // ── Segment Grid ──
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F6',
    borderRadius: 17,
    height: 32,
    alignSelf: 'flex-start',
    padding: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#0F2D5A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0F2D5A',
    lineHeight: 18,
  },
  pillTextActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  segGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  segCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5FAFF',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  segCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  segCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00467E',
    lineHeight: 18,
  },
  segCardDot: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7B8798',
    marginHorizontal: 2,
    lineHeight: 18,
  },
  segCardShare: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B8798',
    lineHeight: 18,
  },
  segCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00467E',
    lineHeight: 22,
  },
  segCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segCardTarget: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  segCardGrowth: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  // ── NTB Table ──
  ntbSection: {
    gap: 12,
  },
  ntbTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  ntbFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 1222,
    borderWidth: 1,
    borderColor: '#DCE0E4',
    backgroundColor: '#FFFFFF',
    width: 100,
    gap: 4,
  },
  filterBtnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#404852',
    lineHeight: 18,
  },
  filterChevron: {
    fontSize: 16,
    color: '#404852',
    transform: [{rotate: '90deg'}],
  },
  ntbRow: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 24,
  },
  ntbColText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  ntbSegment: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 18,
  },
  ntbTarget: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  ntbDataText: {
    fontWeight: '700',
    color: '#404852',
  },
  ntbDataChurn: {
    fontWeight: '600',
    fontSize: 14,
    color: '#D3000E',
  },
  ntbDataNet: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2E7D32',
  },
  ntbTotalText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F2D5A',
  },
  ntbTotalChurn: {
    fontWeight: '700',
    fontSize: 14,
    color: '#D3000E',
  },
  ntbTotalNet: {
    fontWeight: '700',
    fontSize: 14,
    color: '#2E7D32',
  },
});

export default TabunganCard;
