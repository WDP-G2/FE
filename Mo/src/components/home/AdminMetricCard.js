import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function AdminMetricCard({ icon, value, label, trend, tone = 'gold' }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, tone === 'green' && styles.greenBox, tone === 'blue' && styles.blueBox]}>
          <Ionicons name={icon} size={22} color={tone === 'gold' ? colors.primary : '#6EE7B7'} />
        </View>
        {trend ? (
          <View style={styles.trendPill}>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 128,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#3A3522',
  },
  greenBox: {
    backgroundColor: '#123C34',
  },
  blueBox: {
    backgroundColor: '#12364C',
  },
  trendPill: {
    borderRadius: 14,
    backgroundColor: '#073F38',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  trendText: {
    color: '#55F0BE',
    fontSize: 11,
    fontWeight: '900',
  },
  value: {
    marginTop: 22,
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
  },
  label: {
    marginTop: 7,
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
