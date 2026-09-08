import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { radius, space, theme, type } from '../theme/tokens';
import { budgetingIllustrationXml } from '../assets/illustrations/budgeting';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={space[6]}
      >
        <Image
          source={require('../../assets/images/addmin-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.illustration}>
          <SvgXml xml={budgetingIllustrationXml} width={280} height={128} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>Sign in to your workspace</Text>
          <Text style={styles.subtitle}>Use the email your admin invited you with</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Work email</Text>
            <View
              style={[
                styles.inputWrap,
                emailFocused && styles.inputWrapFocused,
              ]}
            >
              <View style={styles.inputIcon} pointerEvents="none">
                <Mail size={18} color={emailFocused ? theme.brandDefault : theme.textTertiary} />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="name@company.com"
                placeholderTextColor={theme.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrap,
                passwordFocused && styles.inputWrapFocused,
              ]}
            >
              <View style={styles.inputIcon} pointerEvents="none">
                <Lock size={18} color={theme.textTertiary} />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                style={[styles.input, styles.inputWithTrailingIcon]}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((v) => !v)}
                style={styles.trailingIconButton}
                hitSlop={8}
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.textTertiary} />
                ) : (
                  <Eye size={18} color={theme.textTertiary} />
                )}
              </Pressable>
            </View>
            <Pressable style={styles.forgotPassword} hitSlop={8}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.signInButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.signInButtonText}>Sign in</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable hitSlop={8}>
            <Text style={styles.footerLink}>Create workspace</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: space[6],
    paddingBottom: space[6],
  },
  logo: {
    width: 150,
    height: 84,
    alignSelf: 'center',
  },
  illustration: {
    marginTop: space[5],
    alignItems: 'center',
  },
  heading: {
    marginTop: space[6],
  },
  title: {
    ...type.h2,
    color: theme.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...type.small,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: space[1],
  },
  form: {
    marginTop: space[6],
    gap: space[4],
  },
  field: {
    gap: space[1],
  },
  label: {
    ...type.label,
    letterSpacing: 0,
    color: theme.textPrimary,
  },
  inputWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.md,
  },
  inputWrapFocused: {
    borderColor: theme.brandDefault,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 16,
    fontFamily: type.body.fontFamily,
    color: theme.textPrimary,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputWithTrailingIcon: {
    paddingRight: 44,
  },
  trailingIconButton: {
    position: 'absolute',
    right: 2,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    minHeight: 32,
    justifyContent: 'center',
  },
  forgotPasswordText: {
    ...type.label,
    letterSpacing: 0,
    color: theme.brandDefault,
  },
  signInButton: {
    marginTop: space[5],
    minHeight: 48,
    backgroundColor: theme.brandDefault,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    ...type.body,
    fontFamily: type.h3.fontFamily,
    fontSize: 15,
    color: theme.textOnBrand,
  },
  footer: {
    flex: 1,
    marginTop: space[6],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: space[1] + 2,
  },
  footerText: {
    ...type.small,
    color: theme.textSecondary,
  },
  footerLink: {
    ...type.label,
    letterSpacing: 0,
    color: theme.brandDefault,
  },
});
