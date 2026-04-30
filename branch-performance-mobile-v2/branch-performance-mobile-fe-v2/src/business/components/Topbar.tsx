import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const TABS = ['Dana', 'Kredit', 'Livin', 'Kopra', 'Merchant', 'GMM', 'Teritori'];

interface TopbarProps {
  title: string;
  onTabChange?: (tab: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({title, onTabChange}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top + 8}]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Horizontal scrollable subtab pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navContent}
        style={styles.nav}>
        {TABS.map(tab => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTab(tab)}
              activeOpacity={0.75}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}>
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : styles.pillTextInactive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#00467E',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 11,
    elevation: 5,
    // ensure shadow renders above scroll content
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2D5A',
    lineHeight: 22,
  },
  nav: {
    flexGrow: 0,
  },
  navContent: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pill: {
    height: 40,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#EBF6FF',
    borderColor: '#0F2D5A',
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE0E4',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  pillTextActive: {
    color: '#0F2D5A',
  },
  pillTextInactive: {
    color: '#7B8798',
  },
});

export default Topbar;
