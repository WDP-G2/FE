import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function LanguageSwitch() {
  return (
    <View style={styles.languageRow}>
      <Text style={styles.languageText}>{'TI\u1ebeNG VI\u1ec6T'}</Text>
      <Text style={styles.languageDot}>{'\u2022'}</Text>
      <Text style={styles.languageText}>ENGLISH</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    justifyContent: 'center',
  },
  languageText: {
    color: colors.language,
    fontSize: 10,
    fontWeight: '800',
  },
  languageDot: {
    marginHorizontal: 13,
    color: '#D6DEE9',
    fontSize: 10,
    fontWeight: '800',
  },
});
