import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Circle, Line, Path} from 'react-native-svg';
import {useDanaDetail} from '../../hooks/useDana';
import {formatPct, formatRupiah} from '../../utils/format';
import type {DanaDetailItem} from '../../api/danaApi';

// ─── Types ────────────────────────────────────────────────────────────────────
type DetailLevel = 'AREA' | 'BRANCH';
type Metric = 'AVG_BAL' | 'END_BAL';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Achievement color thresholds ─────────────────────────────────────────────
function achColor(pct: number): string {
  if (pct >= 100) return '#2E7D32';
  if (pct >= 95) return '#BC8602';
  return '#D3000E';
}

function achBg(pct: number): string {
  if (pct >= 100) return '#F0FAF1';
  if (pct >= 95) return '#FFF9EB';
  return '#FFEBEC';
}

// ─── Small icons ─────────────────────────────────────────────────────────────
const CloseIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Line x1={18} y1={6} x2={6} y2={18} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    <Line x1={6} y1={6} x2={18} y2={18} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const SearchIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke="#7B8798" strokeWidth={2} />
    <Path d="M21 21l-4.35-4.35" stroke="#7B8798" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const SortAscIcon: React.FC = () => (
  <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
    <Path d="M5 2L8 6H2L5 2Z" fill="#0F2D5A" />
  </Svg>
);

// ─── Toggle button ────────────────────────────────────────────────────────────
interface ToggleBtnProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const ToggleBtn: React.FC<ToggleBtnProps> = ({label, active, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.toggleBtn, active && styles.toggleBtnActive]}
    activeOpacity={0.7}>
    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Table row ────────────────────────────────────────────────────────────────
interface RowProps {
  item: DanaDetailItem;
  metric: Metric;
  isLast: boolean;
}
const TableRow: React.FC<RowProps> = React.memo(({item, metric, isLast}) => {
  const achPct = item.achievementPct;
  const balValue = metric === 'AVG_BAL' ? item.avgBalance : item.endingBalance;
  return (
    <View style={[styles.tableRow, !isLast && styles.tableRowBorder]}>
      <Text style={[styles.cellName]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.cellNum}>
        {formatRupiah(balValue).replace('Rp', '')}
      </Text>
      <Text style={styles.cellNum}>
        {formatRupiah(item.target).replace('Rp', '')}
      </Text>
      <View style={styles.cellAchWrap}>
        <View style={[styles.achBadge, {backgroundColor: achBg(achPct)}]}>
          <Text style={[styles.achText, {color: achColor(achPct)}]}>
            {formatPct(achPct, 0)}
          </Text>
        </View>
      </View>
      {metric === 'AVG_BAL' && (
        <Text style={styles.cellCof}>{formatPct(item.cof)}</Text>
      )}
    </View>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────
const DanaDetailModal: React.FC<Props> = ({visible, onClose}) => {
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('AREA');
  const [metric, setMetric] = useState<Metric>('AVG_BAL');
  const [search, setSearch] = useState('');

  const {data, loading} = useDanaDetail(detailLevel, metric);

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    const base = q ? items.filter(it => it.name.toLowerCase().includes(q)) : items;
    return [...base].sort((a, b) => a.achievementPct - b.achievementPct);
  }, [data, search]);

  const handleLevelChange = useCallback((level: DetailLevel) => {
    setDetailLevel(level);
    setSearch('');
  }, []);

  const renderItem = useCallback(
    ({item, index}: {item: DanaDetailItem; index: number}) => (
      <TableRow
        item={item}
        metric={metric}
        isLast={index === filtered.length - 1}
      />
    ),
    [metric, filtered.length],
  );

  const keyExtractor = useCallback((item: DanaDetailItem) => item.code, []);

  const balLabel = metric === 'AVG_BAL' ? 'Avg Bal\n(Rp)' : 'End Bal\n(Rp)';
  const nameLabel = detailLevel === 'AREA' ? 'Area' : 'Cabang';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Detail Pertumbuhan Dana</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} activeOpacity={0.7}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        {/* ── Toggles ── */}
        <View style={styles.controls}>
          <View style={styles.toggleGroup}>
            <ToggleBtn
              label="Area"
              active={detailLevel === 'AREA'}
              onPress={() => handleLevelChange('AREA')}
            />
            <ToggleBtn
              label="Cabang"
              active={detailLevel === 'BRANCH'}
              onPress={() => handleLevelChange('BRANCH')}
            />
          </View>
          <View style={styles.toggleGroup}>
            <ToggleBtn
              label="Avg Bal"
              active={metric === 'AVG_BAL'}
              onPress={() => setMetric('AVG_BAL')}
            />
            <ToggleBtn
              label="End Bal"
              active={metric === 'END_BAL'}
              onPress={() => setMetric('END_BAL')}
            />
          </View>
        </View>

        {/* ── Search (Cabang only) ── */}
        {detailLevel === 'BRANCH' && (
          <View style={styles.searchRow}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari Cabang"
              placeholderTextColor="#BFC2C8"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        )}

        {/* ── Table header ── */}
        <View style={styles.tableHead}>
          <Text style={[styles.headCell, styles.headName]}>{nameLabel}</Text>
          <Text style={[styles.headCell, styles.headNum]}>{balLabel}</Text>
          <Text style={[styles.headCell, styles.headNum]}>{'Target\n(Rp)'}</Text>
          <View style={[styles.headCellWrap, styles.headAch]}>
            <Text style={styles.headCell}>% Ach</Text>
            <SortAscIcon />
          </View>
          {metric === 'AVG_BAL' && (
            <Text style={[styles.headCell, styles.headCof]}>CoF</Text>
          )}
        </View>

        {/* ── Table body ── */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#0F2D5A" />
            <Text style={styles.loadingText}>Memuat data...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.emptyText}>
              {search ? 'Cabang tidak ditemukan' : 'Data tidak tersedia'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    // On iOS, avoid keyboard
    ...Platform.select({ios: {paddingBottom: 34}, android: {paddingBottom: 16}}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F2D5A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F6',
    borderRadius: 99,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  toggleBtnActive: {
    backgroundColor: '#0F2D5A',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F2D5A',
    lineHeight: 20,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#121518',
    padding: 0,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE0E4',
    backgroundColor: '#FAFAFA',
  },
  headCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#404852',
    lineHeight: 16,
  },
  headCellWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headName: {flex: 2.2},
  headNum: {flex: 1.4, textAlign: 'right'},
  headAch: {flex: 1.1, justifyContent: 'flex-end'},
  headCof: {flex: 1, textAlign: 'right'},
  listContent: {
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DCE0E4',
  },
  cellName: {
    flex: 2.2,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F2D5A',
    lineHeight: 19,
    paddingRight: 4,
  },
  cellNum: {
    flex: 1.4,
    fontSize: 12,
    color: '#404852',
    textAlign: 'right',
    lineHeight: 18,
  },
  cellAchWrap: {
    flex: 1.1,
    alignItems: 'flex-end',
  },
  achBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  achText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  cellCof: {
    flex: 1,
    fontSize: 12,
    color: '#404852',
    textAlign: 'right',
    lineHeight: 18,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {fontSize: 13, color: '#7B8798'},
  emptyText: {fontSize: 13, color: '#7B8798'},
});

export default DanaDetailModal;
