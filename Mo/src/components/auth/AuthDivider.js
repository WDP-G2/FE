import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function AuthDivider({
  label = 'HO\u1eb6C \u0110\u0102NG NH\u1eacP V\u1edaI',
  variant = 'light',
}) {
  const isDark = variant === 'dark';

  return (
    <View style={styles.dividerRow}>
      <View style={[styles.divider, isDark && styles.darkDivider]} />
      <Text style={[styles.dividerText, isDark && styles.darkDividerText]}>{label}</Text>
      <View style={[styles.divider, isDark && styles.darkDivider]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 42,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  darkDivider: {
    backgroundColor: '#1E2A40',
  },
  dividerText: {
    paddingHorizontal: 14,
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '800',
  },
  darkDividerText: {
    color: colors.darkTextMuted,
  },
});
