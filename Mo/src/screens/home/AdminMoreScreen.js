import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import AdminPageTitle from '../../components/home/AdminPageTitle';
import { colors } from '../../constants/theme';

const modules = [
  { key: 'statistics', icon: 'bar-chart-outline', title: 'Th\u1ed1ng k\u00ea', desc: 'Doanh thu, x\u1ebfp h\u1ea1ng, m\u1eb7t s\u00e2n' },
  { key: 'notifications', icon: 'notifications-outline', title: 'Th\u00f4ng b\u00e1o', desc: 'So\u1ea1n v\u00e0 xem l\u1ecbch s\u1eed g\u1eedi' },
  { key: 'settings', icon: 'settings-outline', title: 'C\u00e0i \u0111\u1eb7t', desc: 'L\u1ec7 ph\u00ed, lu\u1eadt, email, b\u1ea3o m\u1eadt' },
  { key: 'account', icon: 'person-circle-outline', title: 'T\u00e0i kho\u1ea3n', desc: 'H\u1ed3 s\u01a1 admin v\u00e0 quy\u1ec1n truy c\u1eadp' },
];

export default function AdminMoreScreen({ onOpenModule }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="Admin Modules" />
      <AdminPageTitle
        highlight={'Module'}
        subtitle={'Truy c\u1eadp nhanh c\u00e1c trang qu\u1ea3n tr\u1ecb ph\u1ee5'}
        title={'Th\u00eam'}
      />
      <View style={styles.grid}>
        {modules.map((module) => (
          <Pressable key={module.key} style={styles.card} onPress={() => onOpenModule(module.key)}>
            <View style={styles.iconBox}>
              <Ionicons name={module.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.title}>{module.title}</Text>
            <Text style={styles.desc}>{module.desc}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 22,
  },
  grid: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    padding: 16,
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.darkSurfaceSoft,
  },
  title: {
    marginTop: 14,
    color: colors.darkText,
    fontSize: 16,
    fontWeight: '900',
  },
  desc: {
    marginTop: 5,
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
});
