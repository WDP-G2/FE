import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii } from '../../constants/theme';

export default function AuthInput({
  label,
  icon,
  rightIcon,
  containerStyle,
  variant = 'light',
  ...inputProps
}) {
  const isDark = variant === 'dark';

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, isDark && styles.darkLabel]}>{label}</Text>
      <View style={[styles.inputShell, isDark && styles.darkInputShell]}>
        {icon}
        <TextInput
          placeholderTextColor={isDark ? '#6F7D91' : '#9DABC1'}
          style={[styles.input, isDark && styles.darkInput]}
          {...inputProps}
        />
        {rightIcon}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 8,
    marginLeft: 3,
  },
  darkLabel: {
    color: colors.logo,
  },
  inputShell: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.input,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 13,
  },
  darkInputShell: {
    borderColor: colors.darkBorder,
    backgroundColor: colors.darkSurface,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  darkInput: {
    color: colors.darkText,
  },
});
