import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function AdminPageTitle({ eyebrow, title, highlight, subtitle }) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>
        {title} <Text style={styles.dot}>·</Text> <Text style={styles.highlight}>{highlight}</Text>
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    color: colors.white,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 37,
  },
  dot: {
    color: '#526071',
  },
  highlight: {
    color: colors.primary,
  },
  subtitle: {
    marginTop: 6,
    color: colors.darkTextMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
