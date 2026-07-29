import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function HomeSectionHeader({ title, action }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  title: {
    color: colors.darkText,
    fontSize: 16,
    fontWeight: '900',
  },
  action: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});
