import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useGiroSummary, useGiroGrowth, useGiroComposition, useGiroAcquisition} from '../../hooks/useGiro';

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const Pill: React.FC<PillProps> = ({label, active, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pill, active && styles.pillActive]}>
    <Text style={[styles.pillText, active && styles.pillTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SEGMENT_COLORS = ['#0052A3', '#0081E9', '#4DAEF5', '#80C8F8', '#B3DCFB', '#CCEAFD', '#E6F4FD'];

function fmtRp(val?: number | null): string {
  if (val == null) return 'Rp—';
  if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `Rp${(val / 1e9).toFixed(1)}M`;
  if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}jt`;
  return `Rp${val.toLocaleString('id-ID')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GiroCard: React.FC = () => {
  const [period, setPeriod] = useState<'MtD' | 'YtD'>('YtD');

  const {data: summary} = useGiroSummary();
  const {data: growth} = useGiroGrowth();
  const {data: composition} = useGiroComposition();
  const {data: acquisition} = useGiroAcquisition(period === 'MtD' ? 'MTD' : 'YTD');

  const segments = (composition?.segments ?? []).map((seg, i) => ({
    label: seg.segmentName,
    pct: `${seg.proportion?.toFixed(1) ?? '0'}%`,
    val: fmtRp(seg.endingBalance),
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    flex: Math.max(1, Math.round(seg.proportion ?? 1)),
  }));

  const growthBadges = [
    {label: `${growth?.growthMtd?.toFixed(1) ?? '—'}% MtD`, red: (growth?.growthMtd ?? 0) < 0},
    {label: `${growth?.growthMom?.toFixed(1) ?? '—'}% MoM`, red: (growth?.growthMom ?? 0) < 0},
    {label: `${growth?.growthYtd?.toFixed(1) ?? '—'}% YtD`, red: (growth?.growthYtd ?? 0) < 0},
    {label: `${growth?.growthYoy?.toFixed(1) ?? '—'}% YoY`, red: (growth?.growthYoy ?? 0) < 0},
  ];

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Giro</Text>
        <Text style={styles.cardLastUpdate}>Last Update: {summary?.snapshotDate ?? '—'}</Text>
      </View>

      <View style={styles.cardBody}>
        {/* ── Inner Hero Card ── */}
        <View style={styles.heroCard}>
          {/* Two-column balances */}
          <View style={styles.heroBalanceRow}>
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>Average Balance</Text>
              <Text style={styles.heroValue}>{fmtRp(summary?.avgBalance)}</Text>
              <View style={styles.targetBadge}>
                <Text style={styles.targetBadgeText}>{summary?.avgBalanceAchievementPct?.toFixed(1) ?? '—'}% target</Text>
              </View>
              <Text style={styles.heroSub}>CoF {summary?.cof?.toFixed(2) ?? '—'}%</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>Ending Balance</Text>
              <Text style={styles.heroValue}>{fmtRp(summary?.endingBalance)}</Text>
              <View style={styles.targetBadge}>
                <Text style={styles.targetBadgeText}>{summary?.endingBalanceAchievementPct?.toFixed(1) ?? '—'}% target</Text>
              </View>
            </View>
          </View>

          {/* Row divider */}
          <View style={styles.heroBorderH} />

          {/* Growth Header */}
          <View style={styles.heroGrowthRow}>
            <Text style={styles.heroGrowthTitle}>Pertumbuhan Ending Balance</Text>
            <View style={styles.infoBadge}>
              <InfoIcon />
            </View>
          </View>

          {/* Growth Badges */}
          <View style={styles.growthBadgesRow}>
            {growthBadges.map((b, i) => (
              <View
                key={i}
                style={[
                  styles.growthBadge,
                  b.red ? styles.growthBadgeRed : styles.growthBadgeGreen,
                ]}>
                <Text
                  style={[
                    styles.growthBadgeText,
                    b.red ? styles.textRed : styles.textGreen,
                  ]}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Komposisi Giro per Segmen ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komposisi Giro per Segmen</Text>

          {/* Horizontal segmented bar */}
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

          {/* Legend chips */}
          <View style={styles.legendWrap}>
            {segments.map((seg, i) => (
              <View key={i} style={styles.legendChip}>
                <View style={[styles.legendDot, {backgroundColor: seg.color}]} />
                <Text style={styles.legendName}>{seg.label}</Text>
                <Text style={styles.legendPct}>{seg.pct}</Text>
                <Text style={styles.legendVal}>{seg.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Akuisisi Giro Retail ── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, {flex: 1}]}>Akuisisi Giro Retail</Text>
            <View style={styles.infoBadge}>
              <InfoIcon />
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterRow}>
            <View style={styles.pillGroup}>
              {(['MtD', 'YtD'] as const).map(p => (
                <Pill key={p} label={p} active={period === p} onPress={() => setPeriod(p)} />
              ))}
            </View>
            <View style={styles.filterBtn}>
              <Text style={styles.filterBtnText}>Bulanan</Text>
              <Text style={styles.filterChevron}>›</Text>
            </View>
          </View>

          <View style={styles.newCifCard}>
            <Text style={styles.newCifLabel}>New CIF</Text>
            <View style={styles.newCifValueRow}>
              <Text style={styles.newCifValue}>{acquisition?.newCif ?? '—'}</Text>
              <View style={styles.newCifMeta}>
                <Text style={[styles.newCifPct, (acquisition?.newCifAchievementPct ?? 0) < 100 ? styles.textRed : styles.textGreen]}>
                  {acquisition?.newCifAchievementPct?.toFixed(1) ?? '—'}%
                </Text>
                <Text style={styles.newCifSub}>dari target {acquisition?.newCifTarget ?? '—'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Churn</Text>
              <Text style={[styles.statValue, styles.textRed]}>{acquisition?.churn ?? '—'}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Net CIF</Text>
              <Text style={[styles.statValue, (acquisition?.netCif ?? 0) >= 0 ? styles.textGreen : styles.textRed]}>
                {acquisition?.netCif != null ? (acquisition.netCif >= 0 ? `+${acquisition.netCif}` : `${acquisition.netCif}`) : '—'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>End Bal</Text>
              <Text style={styles.statValueDark}>{fmtRp(acquisition?.endingBalance)}</Text>
            </View>
          </View>
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
    color: '#0F2D5A',
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
    color: '#0F2D5A',
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

  // ── Segment Bar ──
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 21,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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

  // ── Akuisisi Filters ──
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F6',
    borderRadius: 17,
    height: 32,
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
  pillActive: {backgroundColor: '#0F2D5A'},
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

  // ── New CIF Card ──
  newCifCard: {
    backgroundColor: '#F5FAFF',
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  newCifLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 18,
  },
  newCifValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  newCifValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 28,
  },
  newCifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    paddingBottom: 4,
  },
  newCifPct: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: 2,
  },
  newCifSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7B8798',
    lineHeight: 18,
  },

  // ── Stat Row ──
  statRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5FAFF',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 18,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  statValueDark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 18,
  },
});

export default GiroCard;
