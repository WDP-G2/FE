import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii } from '../../constants/theme';

export default function SocialButton({ provider, variant = 'light' }) {
  const isFacebook = provider === 'facebook';
  const isDark = variant === 'dark';
  const isFilled = isDark && isFacebook;

  return (
    <Pressable style={[styles.button, isDark && styles.darkButton, isFilled && styles.facebookButton]}>
      <FontAwesome
        name={isFacebook ? 'facebook-official' : 'google'}
        size={isFacebook ? 18 : 17}
        color={isFilled ? colors.white : isFacebook ? colors.facebook : colors.black}
        style={styles.icon}
      />
      <Text style={[styles.text, isDark && styles.darkText, isFilled && styles.facebookText]}>
        {isFacebook ? 'Facebook' : 'Google'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7F0',
    borderRadius: radii.social,
    backgroundColor: colors.white,
  },
  darkButton: {
    borderColor: colors.darkBorder,
    backgroundColor: colors.darkSurface,
  },
  facebookButton: {
    borderColor: colors.facebook,
    backgroundColor: colors.facebook,
  },
  icon: {
    marginRight: 9,
  },
  text: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  darkText: {
    color: colors.darkText,
  },
  facebookText: {
    color: colors.white,
  },
});
