import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useDepositoSummary, useDepositoGrowth, useDepositoComposition, useDepositoCurrency} from '../../hooks/useDeposito';

// ─── Info Icon ────────────────────────────────────────────────────────────────
const InfoIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      stroke="#0081E9"
      strokeWidth={1.5}
    />
    <Path
      d="M12 8v1M12 11v5"
      stroke="#0081E9"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Horizontal segmented bar helper ─────────────────────────────────────────
interface BarSegment {
  color: string;
  flex: number;
}

interface LegendChipData {
  color: string;
  label: string;
  pct: string;
  val: string;
}

const SegmentedBar: React.FC<{segments: BarSegment[]}> = ({segments}) => (
  <View style={styles.segBarRow}>
    {segments.map((seg, i) => (
      <View
        key={i}
        style={[
          styles.segBarItem,
          {flex: seg.flex, backgroundColor: seg.color},
          i === 0 && styles.segBarFirst,
          i === segments.length - 1 && styles.segBarLast,
        ]}
      />
    ))}
  </View>
);

const LegendChips: React.FC<{items: LegendChipData[]}> = ({items}) => (
  <View style={styles.legendWrap}>
    {items.map((item, i) => (
      <View key={i} style={styles.legendChip}>
        <View style={[styles.legendDot, {backgroundColor: item.color}]} />
        <Text style={styles.legendName}>{item.label}</Text>
        <Text style={styles.legendPct}>{item.pct}</Text>
        <Text style={styles.legendVal}>{item.val}</Text>
      </View>
    ))}
  </View>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SEGMENT_COLORS = ['#0052A3', '#0081E9', '#4DAEF5', '#80C8F8', '#B3DCFB', '#CCEAFD'];
const CURRENCY_COLORS: Record<string, string> = {IDR: '#0052A3', USD: '#4DAEF5'};

function fmtRp(val?: number | null): string {
  if (val == null) return 'Rp—';
  if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `Rp${(val / 1e9).toFixed(1)}M`;
  if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}jt`;
  return `Rp${val.toLocaleString('id-ID')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DepositoCard: React.FC = () => {
  const {data: summary} = useDepositoSummary();
  const {data: growth} = useDepositoGrowth();
  const {data: composition} = useDepositoComposition();
  const {data: currency} = useDepositoCurrency();

  const segmenBar: BarSegment[] = (composition?.segments ?? []).map((seg, i) => ({
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    flex: Math.max(1, Math.round(seg.proportion ?? 1)),
  }));
  const segmenLegend: LegendChipData[] = (composition?.segments ?? []).map((seg, i) => ({
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    label: seg.segmentName,
    pct: `${seg.proportion?.toFixed(1) ?? '0'}%`,
    val: fmtRp(seg.endingBalance),
  }));

  const valutaBar: BarSegment[] = (currency?.currencies ?? []).map(c => ({
    color: CURRENCY_COLORS[c.currencyCode] ?? '#B3DCFB',
    flex: Math.max(1, Math.round(c.proportion ?? 1)),
  }));
  const valutaLegend: LegendChipData[] = (currency?.currencies ?? []).map(c => ({
    color: CURRENCY_COLORS[c.currencyCode] ?? '#B3DCFB',
    label: c.label,
    pct: `${c.proportion?.toFixed(1) ?? '0'}%`,
    val: fmtRp(c.endingBalance),
  }));

  const growthBadges = [
    {label: `${growth?.growthMtd?.toFixed(1) ?? '—'}% MtD`, red: (growth?.growthMtd ?? 0) < 0},
    {label: `${growth?.growthMom?.toFixed(1) ?? '—'}% MoM`, red: (growth?.growthMom ?? 0) < 0},
    {label: `${growth?.growthYtd?.toFixed(1) ?? '—'}% YtD`, red: (growth?.growthYtd ?? 0) < 0},
    {label: `${growth?.growthYoy?.toFixed(1) ?? '—'}% YoY`, red: (growth?.growthYoy ?? 0) < 0},
  ];

  const achievementPct = summary?.avgBalanceAchievementPct ?? 0;
  const achievementOk = achievementPct >= 80;

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Deposito</Text>
        <Text style={styles.cardLastUpdate}>Last Update: {summary?.snapshotDate ?? '—'}</Text>
      </View>

      <View style={styles.cardBody}>
        {/* Inner Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCol}>
            <Text style={styles.heroLabel}>Average Balance</Text>
            <Text style={styles.heroValue}>{fmtRp(summary?.avgBalance)}</Text>
            <View style={[styles.targetBadge, achievementOk ? {backgroundColor: '#FFF9EB'} : styles.targetBadgeRed]}>
              <Text style={[styles.targetBadgeText, achievementOk ? {color: '#BC8602'} : styles.textRed]}>
                {achievementPct.toFixed(1)}% target
              </Text>
            </View>
            <Text style={styles.heroSub}>CoF {summary?.cof?.toFixed(2) ?? '—'}%</Text>
          </View>

          <View style={styles.heroBorderH} />

          <View style={styles.heroGrowthRow}>
            <Text style={styles.heroGrowthTitle}>Pertumbuhan Average Balance</Text>
            <View style={styles.infoBadge}>
              <InfoIcon />
            </View>
          </View>

          <View style={styles.growthBadgesRow}>
            {growthBadges.map((b, i) => (
              <View key={i} style={[styles.growthBadge, b.red ? styles.growthBadgeRed : styles.growthBadgeGreen]}>
                <Text style={[styles.growthBadgeText, b.red ? styles.textRed : styles.textGreen]}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Komposisi per Segmen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komposisi Deposito per Segmen</Text>
          <SegmentedBar segments={segmenBar} />
          <LegendChips items={segmenLegend} />
        </View>

        {/* Komposisi per Valuta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komposisi Deposito per Valuta</Text>
          <SegmentedBar segments={valutaBar} />
          <LegendChips items={valutaLegend} />
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 12.5,
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
  heroCol: {
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
    color: '#0F2D5A',
    lineHeight: 28,
  },
  targetBadge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBadgeRed: {
    backgroundColor: '#FFEBEC',
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0F2D5A',
    lineHeight: 18,
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
    borderRadius: 11111,
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

  // ── Segmented Bar ──
  segBarRow: {
    flexDirection: 'row',
    height: 22,
    borderRadius: 27,
    overflow: 'hidden',
    gap: 1,
  },
  segBarItem: {height: 22},
  segBarFirst: {
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
  },
  segBarLast: {
    borderTopRightRadius: 27,
    borderBottomRightRadius: 27,
  },

  // ── Legend Chips ──
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    borderRadius: 8,
    height: 24,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 3,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E333A',
  },
  legendPct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E333A',
  },
  legendVal: {
    fontSize: 10,
    fontWeight: '400',
    color: '#7B8798',
  },
});

export default DepositoCard;
