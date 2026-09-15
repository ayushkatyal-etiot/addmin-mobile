import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { budgetingIllustrationXml } from '../assets/illustrations/budgeting';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useLogin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { useGetUserInfo } from '../api/user';
import { useUser } from '../contexts/UserContext';
import { styles } from './SignInScreen.styles';
import { theme, space } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const form = useLoginForm();
  const { mutate: login, isPending } = useLogin();
  const { login: saveToken } = useAuth();
  const { mutateAsync: getUserInfoAsync } = useGetUserInfo();
  const { setUser, clearUser } = useUser();

  const handleSignIn = async () => {
    form.setEmailTouched(true);
    form.setPasswordTouched(true);

    if (!form.canSubmit()) {
      return;
    }

    login(
      { email: form.email, password: form.password },
      {
        onSuccess: async (response) => {
          try {
            console.log('[SignIn] Login successful, saving tokens...');
            await saveToken(response.access_token, response.refresh_token);
            console.log('[SignIn] Tokens saved, fetching user info...');
            // Fetch user info - use mutateAsync to handle promise-based flow
            try {
              console.log('[SignIn] Calling getUserInfo mutation...');
              const user = await getUserInfoAsync();
              console.log('[SignIn] User info fetched:', user);
              await setUser(user);
              console.log('[SignIn] User data saved successfully');
              // Auth state change and user data saved - Dashboard will auto-show
            } catch (error: any) {
              console.error('[SignIn] Failed to fetch user info:', error);
              // Clear token and user on fetch failure
              await clearUser();
              const message = error?.data?.message || error?.message || 'Failed to load user information';
              form.setFormError(message);
            }
          } catch (error) {
            console.error('[SignIn] Token save error:', error);
            form.setFormError('Failed to save authentication token');
          }
        },
        onError: (error: any) => {
          console.error('[SignIn] Login failed:', error);
          const message = error?.data?.message || error?.message || 'Incorrect email or password';
          form.setFormError(message);
        },
      }
    );
  };

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

        {form.formError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{form.formError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Work email</Text>
            <View
              style={[
                styles.inputWrap,
                form.emailError && styles.inputWrapError,
                !form.emailError && emailFocused && styles.inputWrapFocused,
              ]}
            >
              <View style={styles.inputIcon} pointerEvents="none">
                <Mail
                  size={18}
                  color={
                    form.emailError
                      ? theme.statusDanger
                      : emailFocused
                        ? theme.brandDefault
                        : theme.textTertiary
                  }
                />
              </View>
              <TextInput
                value={form.email}
                onChangeText={form.setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  setEmailFocused(false);
                  form.setEmailTouched(true);
                }}
                placeholder="name@company.com"
                placeholderTextColor={theme.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isPending}
                style={styles.input}
              />
            </View>
            {form.emailTouched && form.emailError && (
              <Text style={styles.errorText}>{form.emailError}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrap,
                form.passwordError && styles.inputWrapError,
                !form.passwordError && passwordFocused && styles.inputWrapFocused,
              ]}
            >
              <View style={styles.inputIcon} pointerEvents="none">
                <Lock
                  size={18}
                  color={
                    form.passwordError
                      ? theme.statusDanger
                      : passwordFocused
                        ? theme.brandDefault
                        : theme.textTertiary
                  }
                />
              </View>
              <TextInput
                value={form.password}
                onChangeText={form.setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => {
                  setPasswordFocused(false);
                  form.setPasswordTouched(true);
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                editable={!isPending}
                style={[styles.input, styles.inputWithTrailingIcon]}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((v: boolean) => !v)}
                style={styles.trailingIconButton}
                hitSlop={8}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.textTertiary} />
                ) : (
                  <Eye size={18} color={theme.textTertiary} />
                )}
              </Pressable>
            </View>
            {form.passwordTouched && form.passwordError && (
              <Text style={styles.errorText}>{form.passwordError}</Text>
            )}
            <Pressable style={styles.forgotPassword} hitSlop={8} disabled={isPending}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.signInButton, isPending && styles.signInButtonDisabled]}
          onPress={handleSignIn}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator color={theme.textDisabled} size="small" />
              <Text style={styles.loadingText}>Signing in…</Text>
            </View>
          ) : (
            <Text style={styles.signInButtonText}>Sign in</Text>
          )}
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
