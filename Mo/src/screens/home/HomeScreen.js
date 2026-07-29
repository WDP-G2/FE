import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeBottomTabs from '../../components/home/HomeBottomTabs';
import { colors } from '../../constants/theme';
import AdminAccountScreen from './AdminAccountScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import AdminMoreScreen from './AdminMoreScreen';
import NewsScreen from './NewsScreen';
import NotificationsScreen from './NotificationsScreen';
import SettingsScreen from './SettingsScreen';
import StatisticsScreen from './StatisticsScreen';
import TournamentAdminScreen from './TournamentAdminScreen';
import UserManagementScreen from './UserManagementScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <View style={styles.scene}>{renderScene(activeTab, setActiveTab)}</View>
        <HomeBottomTabs activeTab={getBottomTab(activeTab)} onTabPress={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function getBottomTab(activeTab) {
  if (['statistics', 'notifications', 'settings', 'account'].includes(activeTab)) {
    return 'more';
  }

  return activeTab;
}

function renderScene(activeTab, setActiveTab) {
  if (activeTab === 'tournaments') {
    return <TournamentAdminScreen />;
  }

  if (activeTab === 'news') {
    return <NewsScreen />;
  }

  if (activeTab === 'users') {
    return <UserManagementScreen />;
  }

  if (activeTab === 'statistics') {
    return <StatisticsScreen />;
  }

  if (activeTab === 'notifications') {
    return <NotificationsScreen />;
  }

  if (activeTab === 'settings') {
    return <SettingsScreen />;
  }

  if (activeTab === 'account') {
    return <AdminAccountScreen />;
  }

  if (activeTab === 'more') {
    return <AdminMoreScreen onOpenModule={setActiveTab} />;
  }

  return <AdminDashboardScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  app: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  scene: {
    flex: 1,
  },
});
