import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function StatCard({ icon, value, label }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurface,
  },
  value: {
    marginTop: 6,
    color: colors.darkText,
    fontSize: 23,
    fontWeight: '900',
  },
  label: {
    marginTop: 2,
    color: colors.darkTextMuted,
    fontSize: 9,
    fontWeight: '900',
  },
});
