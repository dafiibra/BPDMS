import React from 'react';
import {ActivityIndicator, View, Text, StyleSheet} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useDanaSummary, useDanaGrowth} from '../../hooks/useDana';
import {
  formatRupiah,
  formatPct,
  formatGrowth,
  formatDate,
  isPositive,
} from '../../utils/format';

const MoneysIcon: React.FC = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="#FFFFFF" opacity={0.2} />
    <Path
      d="M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#FFFFFF" strokeWidth={2} />
    <Path
      d="M12 8v1M12 11v5"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const HeroSection: React.FC = () => {
  const {data: summary, loading: loadingSummary} = useDanaSummary();
  const {data: growth, loading: loadingGrowth} = useDanaGrowth();

  const loading = loadingSummary || loadingGrowth;

  const avgAchPct = summary?.avgBalanceAchievementPct ?? 0;
  const endAchPct = summary?.endingBalanceAchievementPct ?? 0;
  const hasTarget = summary != null && (summary.avgBalanceTarget > 0 || summary.endingBalanceTarget > 0);

  const growthBadges = [
    {label: formatGrowth(growth?.growthMtd, 'MtD'), isNegative: !isPositive(growth?.growthMtd)},
    {label: formatGrowth(growth?.growthMom, 'MoM'), isNegative: !isPositive(growth?.growthMom)},
    {label: formatGrowth(growth?.growthYtd, 'YtD'), isNegative: !isPositive(growth?.growthYtd)},
    {label: formatGrowth(growth?.growthYoy, 'YoY'), isNegative: !isPositive(growth?.growthYoy)},
  ];

  const avgBadgeStyle = !hasTarget ? styles.targetBadgeNeutral
    : avgAchPct >= 100 ? styles.targetBadgeGreen
    : avgAchPct >= 90 ? styles.targetBadgeYellow
    : styles.targetBadgeRed;
  const avgTextStyle = !hasTarget ? styles.targetTextNeutral
    : avgAchPct >= 100 ? styles.targetTextGreen
    : avgAchPct >= 90 ? styles.targetTextYellow
    : styles.targetTextRed;
  const endBadgeStyle = !hasTarget ? styles.targetBadgeNeutral
    : endAchPct >= 100 ? styles.targetBadgeGreen
    : endAchPct >= 90 ? styles.targetBadgeYellow
    : styles.targetBadgeRed;
  const endTextStyle = !hasTarget ? styles.targetTextNeutral
    : endAchPct >= 100 ? styles.targetTextGreen
    : endAchPct >= 90 ? styles.targetTextYellow
    : styles.targetTextRed;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MoneysIcon />
        <Text style={styles.title}>Dana</Text>
        {loading && <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />}
      </View>
      <Text style={styles.lastUpdate}>
        Last Update: {summary?.snapshotDate ? formatDate(summary.snapshotDate) : '—'}
      </Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceCol}>
          <Text style={styles.balanceLabel}>Average Balance</Text>
          <Text style={styles.balanceValue}>
            {summary ? formatRupiah(summary.avgBalance) : 'Rp—'}
          </Text>
          <View style={[styles.targetBadge, avgBadgeStyle]}>
            <Text style={[styles.targetBadgeText, avgTextStyle]}>
              {hasTarget ? formatPct(avgAchPct, 0) + ' Target' : '— Target'}
            </Text>
          </View>
          <Text style={styles.cofText}>
            CoF {summary ? formatPct(summary.cof) : '—'}
          </Text>
        </View>

        <View style={styles.columnDivider} />

        <View style={styles.balanceCol}>
          <Text style={styles.balanceLabel}>Ending Balance</Text>
          <Text style={styles.balanceValue}>
            {summary ? formatRupiah(summary.endingBalance) : 'Rp—'}
          </Text>
          <View style={[styles.targetBadge, endBadgeStyle]}>
            <Text style={[styles.targetBadgeText, endTextStyle]}>
              {hasTarget ? formatPct(endAchPct, 0) + ' Target' : '— Target'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rowDivider} />

      <View style={styles.growthHeader}>
        <Text style={styles.growthTitle}>Pertumbuhan Ending Balance</Text>
        <View style={styles.infoIconWrap}>
          <InfoIcon />
        </View>
      </View>

      <View style={styles.badgesRow}>
        {growthBadges.map((badge, i) => (
          <View
            key={i}
            style={[
              styles.growthBadge,
              badge.isNegative ? styles.growthBadgeRed : styles.growthBadgeGreen,
            ]}>
            <Text
              style={[
                styles.growthBadgeText,
                badge.isNegative ? styles.growthTextRed : styles.growthTextGreen,
              ]}>
              {badge.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F2D5A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#00467E',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F5F6',
    lineHeight: 24,
  },
  spinner: {
    marginLeft: 4,
  },
  lastUpdate: {
    fontSize: 10,
    color: '#7B8798',
    fontStyle: 'italic',
    lineHeight: 15,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  balanceCol: {
    flex: 1,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  targetBadge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 1000,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBadgeNeutral: {backgroundColor: 'rgba(123,135,152,0.2)'},
  targetBadgeGreen: {backgroundColor: 'rgba(46,125,50,0.2)'},
  targetBadgeYellow: {backgroundColor: 'rgba(253,185,19,0.2)'},
  targetBadgeRed: {backgroundColor: 'rgba(147,0,10,0.2)'},
  targetBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  targetTextNeutral: {color: '#7B8798'},
  targetTextGreen: {color: '#73CB77'},
  targetTextYellow: {color: '#FDC741'},
  targetTextRed: {color: '#FF4B58'},
  cofText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  columnDivider: {
    width: 1,
    backgroundColor: '#00467E',
    borderRadius: 16,
    alignSelf: 'stretch',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#00467E',
    borderRadius: 16,
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  growthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F5F6',
    lineHeight: 21,
  },
  infoIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  growthBadge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthBadgeRed: {backgroundColor: 'rgba(147,0,10,0.2)'},
  growthBadgeGreen: {backgroundColor: 'rgba(46,125,50,0.2)'},
  growthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  growthTextRed: {color: '#FF4B58'},
  growthTextGreen: {color: '#73CB77'},
});

export default HeroSection;
