import React, {useState} from 'react';
import {SafeAreaView, View, StyleSheet} from 'react-native';
import BottomNav from './components/BottomNav';
import BusinessScreen from '../business/BusinessScreen';

const SCREENS: Record<string, React.FC<{nip: string}>> = {
  'Business': BusinessScreen,
};

export function DpkScreen({nip: _nip}: {nip: string}) {
  const [activeTab, setActiveTab] = useState('Business');
  const ActiveScreen = SCREENS[activeTab] || BusinessScreen;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <ActiveScreen nip={_nip} />
      </View>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
});
