import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import HomeSectionHeader from '../../components/home/HomeSectionHeader';
import { colors } from '../../constants/theme';

const permissions = [
  'Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n ng\u01b0\u1eddi d\u00f9ng',
  'Ph\u00e2n quy\u1ec1n role',
  'Duy\u1ec7t \u0111\u0103ng k\u00fd tham gia',
  'C\u00f4ng b\u1ed1 k\u1ebft qu\u1ea3 thi \u0111\u1ea5u',
];

export default function AdminAccountScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="Admin Profile" />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AD</Text>
        </View>
        <Text style={styles.name}>Admin Championship</Text>
        <Text style={styles.email}>admin@racing.com</Text>
        <View style={styles.rolePill}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#1D1705" />
          <Text style={styles.roleText}>System Admin</Text>
        </View>
      </View>

      <HomeSectionHeader title={'Quy\u1ec1n truy c\u1eadp'} />
      <View style={styles.permissionList}>
        {permissions.map((item) => (
          <View key={item} style={styles.permissionRow}>
            <Ionicons name="checkmark-circle" size={19} color="#6EE7B7" />
            <Text style={styles.permissionText}>{item}</Text>
          </View>
        ))}
      </View>

      <HomeSectionHeader title={'C\u00e0i \u0111\u1eb7t nhanh'} />
      <View style={styles.settingList}>
        <SettingItem icon="notifications-outline" title={'Th\u00f4ng b\u00e1o h\u1ec7 th\u1ed1ng'} value="B\u1eadt" />
        <SettingItem icon="lock-closed-outline" title={'B\u1ea3o m\u1eadt t\u00e0i kho\u1ea3n'} value="2FA" />
        <SettingItem icon="language-outline" title={'Ng\u00f4n ng\u1eef'} value="Ti\u1ebfng Vi\u1ec7t" />
      </View>
    </ScrollView>
  );
}

function SettingItem({ icon, title, value }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 22,
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 18,
    backgroundColor: colors.darkSurface,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 37,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: '#1D1705',
    fontSize: 20,
    fontWeight: '900',
  },
  name: {
    marginTop: 14,
    color: colors.darkText,
    fontSize: 18,
    fontWeight: '900',
  },
  email: {
    marginTop: 5,
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  roleText: {
    color: '#1D1705',
    fontSize: 11,
    fontWeight: '900',
  },
  permissionList: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    backgroundColor: colors.darkSurface,
    paddingHorizontal: 13,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  permissionText: {
    marginLeft: 10,
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '800',
  },
  settingList: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    backgroundColor: colors.darkSurface,
    padding: 13,
  },
  settingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.darkSurfaceSoft,
  },
  settingTitle: {
    flex: 1,
    marginLeft: 11,
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '900',
  },
  settingValue: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
