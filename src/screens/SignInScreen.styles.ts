import { StyleSheet, Platform } from 'react-native';
import { theme, space, radius, type } from '../theme/tokens';

export const styles = StyleSheet.create({
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
  errorBanner: {
    marginTop: space[4],
    padding: space[3],
    backgroundColor: theme.statusDangerBg,
    borderRadius: radius.md,
  },
  errorBannerText: {
    ...type.small,
    fontFamily: type.label.fontFamily,
    color: theme.statusDangerStrong,
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
  inputWrapError: {
    borderColor: theme.statusDanger,
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
  errorText: {
    ...type.caption,
    color: theme.statusDanger,
  },
  signInButton: {
    marginTop: space[5],
    minHeight: 48,
    backgroundColor: theme.brandDefault,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonDisabled: {
    backgroundColor: theme.bgSunken,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
  },
  signInButtonText: {
    ...type.body,
    fontFamily: type.h3.fontFamily,
    fontSize: 15,
    color: theme.textOnBrand,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  loadingText: {
    ...type.body,
    fontFamily: type.h3.fontFamily,
    fontSize: 15,
    color: theme.textDisabled,
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
