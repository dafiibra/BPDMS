import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import {useDanaComposition} from '../../hooks/useDana';
import {formatRupiah} from '../../utils/format';
import {DanaCompositionSegment} from '../../api/danaApi';

const BAR_H = 22;
const ARROW_H = 6;
const ARROW_W = 12;
const ARROW_GAP = 5;

const SEGMENT_COLORS: Record<string, string> = {
  WEALTH: '#081E3B',
  SME: '#C3C9D0',
  RETAIL: '#0081E9',
  CB: '#7B8798',
  CMB: '#95D0FF',
  FI: '#00467E',
  PAYROLL: '#3FAAFF',
  PEKERMA: '#2365D2',
  PRIORITAS: '#4A90D9',
  INDIVIDUAL: '#7EC8E3',
};

const SEGMENT_LABEL_BORDER = new Set(['SME', 'CMB', 'PAYROLL', 'PEKERMA', 'PRIORITAS', 'INDIVIDUAL']);

function segColor(code: string): string {
  return SEGMENT_COLORS[code.toUpperCase()] ?? '#B5BBC5';
}

const KomposisiDPK: React.FC = () => {
  const {data: composition, loading} = useDanaComposition();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const segLayouts = useRef<{x: number; width: number}[]>([]);
  const [barWrapBottomY, setBarWrapBottomY] = useState(0);
  const [barRowWidth, setBarRowWidth] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [tooltipKey, setTooltipKey] = useState(0);

  const segments: DanaCompositionSegment[] = composition?.segments ?? [];

  const handleSegmentLayout = (e: LayoutChangeEvent, i: number) => {
    const {x, width} = e.nativeEvent.layout;
    segLayouts.current[i] = {x, width};
  };

  const handleBarWrapLayout = (e: LayoutChangeEvent) => {
    const {y, height, width} = e.nativeEvent.layout;
    setBarWrapBottomY(y + height);
    setBarRowWidth(width);
  };

  const handlePress = (i: number) => {
    if (activeIdx === i) {
      setActiveIdx(null);
    } else {
      setTooltipWidth(0);
      setTooltipKey(k => k + 1);
      setActiveIdx(i);
    }
  };

  const seg = activeIdx !== null ? segments[activeIdx] : null;

  const arrowLeft =
    activeIdx !== null && segLayouts.current[activeIdx]
      ? segLayouts.current[activeIdx].x +
        segLayouts.current[activeIdx].width / 2 -
        ARROW_W / 2
      : 0;

  const tooltipLeft =
    activeIdx !== null && tooltipWidth > 0 && segLayouts.current[activeIdx]
      ? Math.max(
          0,
          Math.min(
            segLayouts.current[activeIdx].x +
              segLayouts.current[activeIdx].width / 2 -
              tooltipWidth / 2,
            barRowWidth - tooltipWidth,
          ),
        )
      : 0;

  return (
    <TouchableWithoutFeedback onPress={() => setActiveIdx(null)}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Komposisi Dana per Segmen (Rp T)</Text>
            {loading && <ActivityIndicator size="small" color="#0F2D5A" />}
          </View>
          <Text style={styles.lastUpdate}>Data dari API Backend</Text>
        </View>

        {segments.length === 0 ? (
          <View style={styles.emptyBar}>
            <Text style={styles.emptyText}>
              {loading ? 'Memuat data...' : 'Data segmen tidak tersedia'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.barWrap} onLayout={handleBarWrapLayout}>
              <View style={styles.barRow}>
                {segments.map((s, i) => (
                  <TouchableOpacity
                    key={s.segmentCode}
                    activeOpacity={0.8}
                    onPress={() => handlePress(i)}
                    onLayout={e => handleSegmentLayout(e, i)}
                    style={[
                      styles.barSegment,
                      {
                        flex: Math.round(s.proportion),
                        backgroundColor: segColor(s.segmentCode),
                        opacity: activeIdx === null || activeIdx === i ? 1 : 0.3,
                      },
                      i === 0 && styles.barFirst,
                      i === segments.length - 1 && styles.barLast,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.legendWrap}>
              {segments.map((s, i) => (
                <TouchableOpacity
                  key={s.segmentCode}
                  onPress={() => handlePress(i)}
                  style={[styles.legendItem, activeIdx === i && styles.legendItemActive]}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: segColor(s.segmentCode)},
                      SEGMENT_LABEL_BORDER.has(s.segmentCode.toUpperCase()) &&
                        styles.legendDotBorder,
                    ]}
                  />
                  <Text
                    style={[
                      styles.legendLabel,
                      activeIdx === i && styles.legendLabelActive,
                    ]}>
                    {s.segmentName ?? s.segmentCode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.hint}>
              {activeIdx !== null
                ? 'Tap segmen lagi atau area lain untuk menutup'
                : 'Tap pada bar untuk melihat detail'}
            </Text>

            {seg !== null && (
              <>
                <View
                  style={[
                    styles.arrow,
                    {top: barWrapBottomY + ARROW_GAP, left: arrowLeft, borderBottomColor: segColor(seg.segmentCode)},
                  ]}
                />
                <View
                  key={`tt-${tooltipKey}`}
                  style={[
                    styles.tooltip,
                    {
                      top: barWrapBottomY + ARROW_GAP + ARROW_H,
                      left: tooltipLeft,
                      borderColor: segColor(seg.segmentCode),
                      opacity: tooltipWidth > 0 ? 1 : 0,
                    },
                  ]}
                  onLayout={e => setTooltipWidth(e.nativeEvent.layout.width)}>
                  <View style={[styles.tooltipDot, {backgroundColor: segColor(seg.segmentCode)}]} />
                  <Text style={styles.tooltipLabel}>{seg.segmentName ?? seg.segmentCode}</Text>
                  <Text style={styles.tooltipSep}>{'•'}</Text>
                  <Text style={styles.tooltipPct}>{seg.proportion.toFixed(1).replace('.', ',')}%</Text>
                  <Text style={styles.tooltipSep}>{'•'}</Text>
                  <Text style={styles.tooltipVal}>{formatRupiah(seg.endingBalance)}</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

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
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {fontSize: 16, fontWeight: '700', color: '#0F2D5A', lineHeight: 24, flex: 1},
  lastUpdate: {fontSize: 10, color: '#7B8798', fontStyle: 'italic', lineHeight: 15},
  emptyBar: {
    height: BAR_H + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {fontSize: 12, color: '#7B8798'},
  barWrap: {},
  barRow: {
    flexDirection: 'row',
    height: BAR_H,
    borderRadius: 27,
    overflow: 'hidden',
    gap: 1,
  },
  barSegment: {height: BAR_H},
  barFirst: {borderTopLeftRadius: 27, borderBottomLeftRadius: 27},
  barLast: {borderTopRightRadius: 27, borderBottomRightRadius: 27},
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_W / 2,
    borderRightWidth: ARROW_W / 2,
    borderBottomWidth: ARROW_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#00467E',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  tooltipDot: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  tooltipLabel: {fontSize: 12, fontWeight: '700', color: '#0F2D5A', lineHeight: 18},
  tooltipSep: {fontSize: 10, color: '#B5BBC5', lineHeight: 18},
  tooltipPct: {fontSize: 12, fontWeight: '800', color: '#0F2D5A', lineHeight: 18},
  tooltipVal: {fontSize: 11, color: '#7B8798', lineHeight: 18},
  legendWrap: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14},
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  legendItemActive: {backgroundColor: '#EBF6FF'},
  legendDot: {width: 8, height: 8, borderRadius: 2},
  legendDotBorder: {borderWidth: 1, borderColor: '#B5BBC5'},
  legendLabel: {fontSize: 12, fontWeight: '700', color: '#0F2D5A', lineHeight: 18},
  legendLabelActive: {color: '#0081E9'},
  hint: {fontSize: 12, color: '#7B8798', lineHeight: 18},
});

export default KomposisiDPK;
