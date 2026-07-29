import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import AdminPageTitle from '../../components/home/AdminPageTitle';
import { colors } from '../../constants/theme';

const tabs = ['L\u1ec7 ph\u00ed m\u1eb7c \u0111\u1ecbnh', 'Lu\u1eadt m\u1eb7c \u0111\u1ecbnh', 'M\u1eabu email', 'B\u1ea3o m\u1eadt'];
const fields = [
  { label: 'L\u1ec6 PH\u00cd \u0110\u0102NG K\u00dd M\u1eb6C \u0110\u1ecaNH (VN\u0110)', value: '5000000' },
  { label: 'TI\u1ec0N C\u1eccC M\u1eb6C \u0110\u1ecaNH (VN\u0110)', value: '10000000' },
  { label: 'PH\u00cd TR\u1ec4 H\u1ea0N (VN\u0110)', value: '500000' },
  { label: 'HO\u00c0N C\u1eccC SAU', value: '3 ng\u00e0y' },
];

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="System Settings" />
      <AdminPageTitle
        highlight={'H\u1ec7 th\u1ed1ng'}
        subtitle={'C\u1ea5u h\u00ecnh m\u1eb7c \u0111\u1ecbnh to\u00e0n h\u1ec7 th\u1ed1ng'}
        title={'C\u00e0i \u0111\u1eb7t'}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabRow}>
          {tabs.map((tab, index) => (
            <View key={tab} style={[styles.tab, index === 0 && styles.activeTab]}>
              <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>{tab}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="settings-outline" size={23} color={colors.primary} />
          <Text style={styles.cardTitle}>{'L\u1ec7 ph\u00ed m\u1eb7c \u0111\u1ecbnh'}</Text>
        </View>
        <View style={styles.fieldGrid}>
          {fields.map((field) => (
            <View key={field.label} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.input}>
                <Text style={styles.inputText}>{field.value}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.actionRow}>
          <View style={styles.cancelButton}>
            <Text style={styles.cancelText}>{'H\u1ee7y'}</Text>
          </View>
          <View style={styles.saveButton}>
            <Ionicons name="checkmark-circle-outline" size={17} color="#1D1705" />
            <Text style={styles.saveText}>{'L\u01b0u c\u00e0i \u0111\u1eb7t'}</Text>
          </View>
        </View>
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
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 15,
    marginBottom: 16,
  },
  tab: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  activeTab: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  activeTabText: {
    color: '#1D1705',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
    padding: 18,
  },
  cardTitle: {
    color: colors.darkText,
    fontSize: 20,
    fontWeight: '900',
  },
  fieldGrid: {
    padding: 16,
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.darkTextMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  input: {
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurfaceSoft,
    paddingHorizontal: 13,
  },
  inputText: {
    color: colors.darkText,
    fontSize: 13,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cancelText: {
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '900',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 13,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  saveText: {
    color: '#1D1705',
    fontSize: 12,
    fontWeight: '900',
  },
});
