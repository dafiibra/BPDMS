import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Rect, Line, Polygon, Path} from 'react-native-svg';
import {colors, fonts, shadows} from '../theme';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SVG_SIZE = 20;
const SVG_VIEWBOX = '0 0 24 24';
const STROKE_WIDTH = 2;
const STROKE_LINECAP = 'round' as const;
const STROKE_LINEJOIN = 'round' as const;

interface IconProps {
  stroke: string;
}

const ExecutiveSummaryIcon: React.FC<IconProps> = ({stroke}) => (
  <Svg
    width={SVG_SIZE}
    height={SVG_SIZE}
    viewBox={SVG_VIEWBOX}
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap={STROKE_LINECAP}
    strokeLinejoin={STROKE_LINEJOIN}>
    <Rect x={3} y={3} width={7} height={7} rx={1} stroke={stroke} />
    <Rect x={14} y={3} width={7} height={7} rx={1} stroke={stroke} />
    <Rect x={3} y={14} width={7} height={7} rx={1} stroke={stroke} />
    <Rect x={14} y={14} width={7} height={7} rx={1} stroke={stroke} />
  </Svg>
);

const BusinessIcon: React.FC<IconProps> = ({stroke}) => (
  <Svg
    width={SVG_SIZE}
    height={SVG_SIZE}
    viewBox={SVG_VIEWBOX}
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap={STROKE_LINECAP}
    strokeLinejoin={STROKE_LINEJOIN}>
    <Line x1={6} y1={20} x2={6} y2={14} stroke={stroke} />
    <Line x1={12} y1={20} x2={12} y2={4} stroke={stroke} />
    <Line x1={18} y1={20} x2={18} y2={10} stroke={stroke} />
  </Svg>
);

const ServiceIcon: React.FC<IconProps> = ({stroke}) => (
  <Svg
    width={SVG_SIZE}
    height={SVG_SIZE}
    viewBox={SVG_VIEWBOX}
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap={STROKE_LINECAP}
    strokeLinejoin={STROKE_LINEJOIN}>
    <Polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      stroke={stroke}
    />
  </Svg>
);

const ComplianceIcon: React.FC<IconProps> = ({stroke}) => (
  <Svg
    width={SVG_SIZE}
    height={SVG_SIZE}
    viewBox={SVG_VIEWBOX}
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap={STROKE_LINECAP}
    strokeLinejoin={STROKE_LINEJOIN}>
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={stroke}
    />
  </Svg>
);

const VipIcon: React.FC<IconProps> = ({stroke}) => (
  <Svg
    width={SVG_SIZE}
    height={SVG_SIZE}
    viewBox={SVG_VIEWBOX}
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap={STROKE_LINECAP}
    strokeLinejoin={STROKE_LINEJOIN}>
    <Path d="M6 3h12l-2 9h-8z" stroke={stroke} />
    <Path d="M12 12v6" stroke={stroke} />
    <Path d="M8 21h8" stroke={stroke} />
  </Svg>
);

interface NavItem {
  key: string;
  label: string;
  icon: React.FC<IconProps>;
}

const NAV_ITEMS: NavItem[] = [
  {key: 'Executive Summary', label: 'Executive Summary', icon: ExecutiveSummaryIcon},
  {key: 'Business', label: 'Business', icon: BusinessIcon},
  {key: 'Service', label: 'Service', icon: ServiceIcon},
  {key: 'Compliance', label: 'Compliance', icon: ComplianceIcon},
  {key: 'VIP', label: 'VIP', icon: VipIcon},
];

const BottomNav: React.FC<BottomNavProps> = ({activeTab, onTabChange}) => {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map(item => {
        const isActive = item.key === activeTab;
        const strokeColor = isActive
          ? colors.primary
          : colors.onSurfaceVariant;
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.button}
            onPress={() => onTabChange(item.key)}
            activeOpacity={0.7}>
            <View
              style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <IconComponent stroke={strokeColor} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    flexDirection: 'row',
    ...shadows.bottomNav,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 4,
    gap: 4,
    minHeight: 64,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.manrope,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default BottomNav;
