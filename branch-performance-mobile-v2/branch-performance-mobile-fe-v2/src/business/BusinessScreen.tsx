import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LevelProvider} from '../context/LevelContext';
import Topbar from './components/Topbar';
import HeroSection from './components/HeroSection';
import GrowthDPK from './components/GrowthDPK';
import KomposisiDPK from './components/KomposisiDPK';
import TabunganCard from './components/TabunganCard';
import GiroCard from './components/GiroCard';
import DepositoCard from './components/DepositoCard';

interface BusinessScreenProps {
  nip: string;
}

const BusinessScreen: React.FC<BusinessScreenProps> = () => {
  const insets = useSafeAreaInsets();

  return (
    <LevelProvider>
      <View style={styles.container}>
        <Topbar title="Business" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + 24},
          ]}
          showsVerticalScrollIndicator={false}>
          <HeroSection />
          <GrowthDPK />
          <KomposisiDPK />
          <TabunganCard />
          <GiroCard />
          <DepositoCard />
        </ScrollView>
      </View>
    </LevelProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default BusinessScreen;
