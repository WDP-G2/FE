import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

const tabs = [
  { key: 'dashboard', icon: 'grid-outline', activeIcon: 'grid', label: 'T\u1ed5ng quan' },
  { key: 'tournaments', icon: 'trophy-outline', activeIcon: 'trophy', label: 'Gi\u1ea3i \u0111\u1ea5u' },
  { key: 'news', icon: 'newspaper-outline', activeIcon: 'newspaper', label: 'Tin t\u1ee9c' },
  { key: 'users', icon: 'people-outline', activeIcon: 'people', label: 'Ng\u01b0\u1eddi d\u00f9ng' },
  { key: 'more', icon: 'ellipsis-horizontal-circle-outline', activeIcon: 'ellipsis-horizontal-circle', label: 'Th\u00eam' },
];

export default function HomeBottomTabs({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={18}
              color={isActive ? colors.primary : colors.darkTextMuted}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.darkBorder,
    backgroundColor: colors.darkSurface,
    paddingTop: 9,
    paddingBottom: 12,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
  },
  label: {
    marginTop: 4,
    color: colors.darkTextMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  activeLabel: {
    color: colors.primary,
  },
});
