import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../../constants/theme';

export default function RegisterBrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <FontAwesome5 name="trophy" size={24} color={colors.white} />
      </View>
      <Text style={styles.brand}>Horse Racing</Text>
      <Text style={styles.subtitle}>TOURNAMENT MANAGEMENT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 47,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.logo,
    backgroundColor: colors.primary,
    shadowColor: '#F5B717',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.27,
    shadowRadius: 14,
    elevation: 6,
  },
  brand: {
    marginTop: 14,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  subtitle: {
    color: colors.darkText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
