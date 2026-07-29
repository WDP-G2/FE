import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function RememberForgotRow() {
  return (
    <View style={styles.rowBetween}>
      <Pressable style={styles.rememberRow}>
        <View style={styles.checkbox} />
        <Text style={styles.rememberText}>{'Ghi nh\u1edb \u0110\u0103ng nh\u1eadp'}</Text>
      </Pressable>
      <Pressable>
        <Text style={styles.forgotText}>{'Qu\u00ean m\u1eadt kh\u1ea9u?'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderColor: colors.checkboxBorder,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  rememberText: {
    marginLeft: 8,
    color: '#53627A',
    fontSize: 12,
    fontWeight: '600',
  },
  forgotText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
});
