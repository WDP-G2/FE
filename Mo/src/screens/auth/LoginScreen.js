import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthDivider from '../../components/auth/AuthDivider';
import AuthInput from '../../components/auth/AuthInput';
import LanguageSwitch from '../../components/auth/LanguageSwitch';
import LoginLogo from '../../components/auth/LoginLogo';
import PrimaryButton from '../../components/auth/PrimaryButton';
import RememberForgotRow from '../../components/auth/RememberForgotRow';
import SocialButton from '../../components/auth/SocialButton';
import { colors, spacing } from '../../constants/theme';

export default function LoginScreen({ onLogin, onNavigateRegister }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <LoginLogo />

            <Text style={styles.title}>{'\u0110\u0103ng nh\u1eadp'}</Text>
            <Text style={styles.subtitle}>
              {'Ch\u00e0o m\u1eebng tr\u1edf l\u1ea1i h\u1ec7 th\u1ed1ng qu\u1ea3n l\u00fd'}{'\n'}
              {'gi\u1ea3i \u0111ua ng\u1ef1a'}
            </Text>

            <View style={styles.form}>
              <AuthInput
                autoCapitalize="none"
                icon={<Ionicons name="mail-outline" size={20} color={colors.inputIcon} />}
                keyboardType="email-address"
                label="EMAIL"
                placeholder="example@racing.com"
              />

              <AuthInput
                containerStyle={styles.passwordInput}
                icon={<Ionicons name="lock-closed-outline" size={20} color={colors.inputIcon} />}
                label="MẬT KHẨU"
                placeholder={'Nh\u1eadp m\u1eadt kh\u1ea9u'}
                rightIcon={
                  <Pressable hitSlop={10}>
                    <Ionicons name="eye-outline" size={20} color={colors.inputIcon} />
                  </Pressable>
                }
                secureTextEntry
              />

              <RememberForgotRow />
              <PrimaryButton onPress={onLogin} title={'\u0110\u0103ng nh\u1eadp'} />
            </View>

            <AuthDivider />

            <View style={styles.socialRow}>
              <SocialButton provider="google" />
              <SocialButton provider="facebook" />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.signupText}>{'Ch\u01b0a c\u00f3 t\u00e0i kho\u1ea3n? '}</Text>
            <Pressable hitSlop={10} onPress={onNavigateRegister}>
              <Text style={styles.signupLink}>{'\u0110\u0103ng k\u00fd ngay'}</Text>
            </Pressable>
            <LanguageSwitch />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.screenX,
    paddingTop: 24,
    paddingBottom: 20,
  },
  card: {
    alignItems: 'stretch',
  },
  title: {
    marginTop: 10,
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 31,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
  form: {
    marginTop: 16,
  },
  passwordInput: {
    marginTop: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 13,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  signupText: {
    color: '#7A89A3',
    fontSize: 13,
    fontWeight: '500',
  },
  signupLink: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
