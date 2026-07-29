import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import AdminMetricCard from '../../components/home/AdminMetricCard';
import AdminPageTitle from '../../components/home/AdminPageTitle';
import HomeSectionHeader from '../../components/home/HomeSectionHeader';
import { colors } from '../../constants/theme';

const bars = [
  { label: 'VGP', value: 6 },
  { label: 'SGD', value: 5 },
  { label: 'HNC', value: 8 },
  { label: 'SPC', value: 4 },
];

const horses = [
  { rank: 1, name: 'Thunder Bolt', wins: 12, prize: '850.000.000 \u0111' },
  { rank: 2, name: 'Black Pearl', wins: 9, prize: '620.000.000 \u0111' },
  { rank: 3, name: 'Wind Runner', wins: 7, prize: '480.000.000 \u0111' },
];

export default function StatisticsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="Analytics" />
      <AdminPageTitle
        highlight={'To\u00e0n h\u1ec7 th\u1ed1ng'}
        subtitle={'B\u00e1o c\u00e1o t\u1ed5ng h\u1ee3p gi\u1ea3i \u0111\u1ea5u, cu\u1ed9c \u0111ua, doanh thu v\u00e0 x\u1ebfp h\u1ea1ng'}
        title={'Th\u1ed1ng k\u00ea'}
      />

      <View style={styles.metricGrid}>
        <AdminMetricCard icon="trophy-outline" label={'Gi\u1ea3i \u0111\u1ea5u'} tone="gold" trend="+12%" value="4" />
        <AdminMetricCard icon="flag-outline" label={'Cu\u1ed9c \u0111ua'} tone="blue" trend="+8%" value="23" />
      </View>
      <View style={styles.metricGrid}>
        <AdminMetricCard icon="people-outline" label={'\u0110\u0103ng k\u00fd'} tone="green" trend="+24%" value="160" />
        <AdminMetricCard icon="cash-outline" label={'Doanh thu'} tone="gold" trend="+18%" value="200.000.000" />
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>{'Doanh thu 6 th\u00e1ng'}</Text>
            <Text style={styles.chartSubtitle}>{'\u0110\u01a1n v\u1ecb: tri\u1ec7u VN\u0110'}</Text>
          </View>
          <View style={styles.growthPill}>
            <Text style={styles.growthText}>+18% YoY</Text>
          </View>
        </View>
        <View style={styles.lineChart}>
          <View style={[styles.linePoint, { left: '4%', bottom: 46 }]} />
          <View style={[styles.linePoint, { left: '24%', bottom: 74 }]} />
          <View style={[styles.linePoint, { left: '44%', bottom: 104 }]} />
          <View style={[styles.linePoint, { left: '64%', bottom: 88 }]} />
          <View style={[styles.linePoint, { left: '84%', bottom: 136 }]} />
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{'S\u1ed1 cu\u1ed9c \u0111ua / Gi\u1ea3i'}</Text>
        <View style={styles.barRow}>
          {bars.map((item) => (
            <View key={item.label} style={styles.barItem}>
              <View style={[styles.bar, { height: item.value * 20 }]} />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <HomeSectionHeader title={'Top ng\u1ef1a th\u1eafng gi\u1ea3i'} />
      <View style={styles.table}>
        {horses.map((item) => (
          <View key={item.name} style={styles.tableRow}>
            <View style={styles.rank}>
              <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            <View style={styles.tableName}>
              <Text style={styles.horseName}>{item.name}</Text>
              <Text style={styles.tableMeta}>{item.wins} {'tr\u1eadn th\u1eafng'}</Text>
            </View>
            <Text style={styles.prize}>{item.prize}</Text>
          </View>
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
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chartCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    color: colors.darkText,
    fontSize: 18,
    fontWeight: '900',
  },
  chartSubtitle: {
    marginTop: 5,
    color: colors.darkTextMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  growthPill: {
    borderRadius: 16,
    backgroundColor: '#073F38',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  growthText: {
    color: '#55F0BE',
    fontSize: 11,
    fontWeight: '900',
  },
  lineChart: {
    height: 180,
    marginTop: 18,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#6B7280',
    backgroundColor: '#101B2A',
  },
  linePoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  barRow: {
    height: 185,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 18,
  },
  barItem: {
    alignItems: 'center',
  },
  bar: {
    width: 32,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: colors.primary,
  },
  barLabel: {
    marginTop: 8,
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  table: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  rank: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  rankText: {
    color: '#1D1705',
    fontSize: 13,
    fontWeight: '900',
  },
  tableName: {
    flex: 1,
  },
  horseName: {
    color: colors.darkText,
    fontSize: 13,
    fontWeight: '900',
  },
  tableMeta: {
    marginTop: 4,
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  prize: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
