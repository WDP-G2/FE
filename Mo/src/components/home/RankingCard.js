import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function RankingCard({ rank, name, subtitle, rate }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rank, rank === 1 && styles.rankFirst]}>
        <Text style={[styles.rankText, rank === 1 && styles.rankTextFirst]}>{rank}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.ratePill}>
        <Text style={styles.rateText}>{rate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  rank: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.darkSurfaceSoft,
  },
  rankFirst: {
    backgroundColor: colors.primary,
  },
  rankText: {
    color: colors.darkTextMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  rankTextFirst: {
    color: '#1E1704',
  },
  info: {
    flex: 1,
    marginLeft: 11,
  },
  name: {
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  ratePill: {
    borderRadius: 20,
    backgroundColor: '#153D31',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  rateText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '900',
  },
});
