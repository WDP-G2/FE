import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radii } from '../../constants/theme';

export default function LoginLogo() {
  return (
    <View style={styles.logo}>
      <FontAwesome name="star" size={20} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    width: 54,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.logo,
    backgroundColor: colors.logo,
    shadowColor: '#D89A05',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
});
