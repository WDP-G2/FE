import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../../constants/theme';

export default function AuthNotice({ children }) {
  return (
    <View style={styles.notice}>
      <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radii.input,
    backgroundColor: colors.warningSurface,
    paddingHorizontal: 12,
  },
  text: {
    flex: 1,
    marginLeft: 9,
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
});
