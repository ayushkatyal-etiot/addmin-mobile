import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';

import { radius, space, theme, type } from '../theme/tokens';

const illustrationXml = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="128" viewBox="0 0 960 438.656"><g transform="translate(-375.426 -236.395)"><path d="M518.443,608.668s-43.742,18.854-54.3,13.575-42.233-18.854-52.037,9.05c-7.906,22.5,38.249,23.916,56.412,23.62a15.177,15.177,0,0,0,11.462-5.52h0L542.953,627.9S529,604.143,518.443,608.668Z" transform="translate(285.722 -42.659)" fill="#ed9da0"/><path d="M.738,105.582c4.246-1.7,10.886-16.554,15.876-29.207A49.02,49.02,0,1,1,70.971,96.107a41.433,41.433,0,0,0-.1,10.985l15.083.753-1.506,36.2L45.985,162.9S-6.806,108.6.738,105.582Z" transform="translate(882.614 297.476)" fill="#ed9da0"/><path d="M99.548,221.726s-2.485-34.791-7.05-53.938c-1.938,3.514-3.1,6.39-2.375,8.309a11.472,11.472,0,0,1-.108,6.082,30.553,30.553,0,0,1-18.347,21.467c-17.51,7.221-48.105,19.1-43.765,12.047C33.935,205.888,0,191.558,0,184.017S53.544,171.2,49.021,163.655s4.524-22.624,3.015-36.953,12.445-65.991,11.69-85.6c-.417-10.849,7.249-17.081,14.181-20.483,4.153-2.862,20.372-6.19,26.922-5.533C112.369,15.838,136.5,0,136.5,0c1.506,18.1,33.936,39.971,33.936,39.971l31.578-26.325s13.673-3.087,19.705-2.332,15.838,6.785,24.136,5.277,16.59,4.526,16.59,4.526,0,.106-.012.314c3.465-.809,12.068-1.579,16.226,9.114,5.279,13.574,9.727,27.249,12.271,68.447s-3.6,94.074-2.09,96.336-2.262,16.594-5.28,16.594H251.88s3.794-16.405-7.794-25.655c2.857,18.881,12.329,35.458,12.329,35.458Z" transform="translate(752.882 390.443)" fill="#1A8956"/><path d="M864.449,662.364v33.184a22.2,22.2,0,0,1-21.923,22.2l-698.22,8.62A12.749,12.749,0,0,1,131.4,713.616V676.934A12.637,12.637,0,0,1,143.646,664.3l700.5-21.62a19.691,19.691,0,0,1,20.3,19.682Z" transform="translate(354.507 -51.313)" fill="#e6e6e6"/><path d="M864.449,700.855v9a22.2,22.2,0,0,1-21.923,22.2l-698.22,8.62A12.749,12.749,0,0,1,131.4,727.919v-1.181Z" transform="translate(354.507 -65.616)" fill="#d6d6e3"/><path d="M744.8,520.264,656.453,508.8l-157.09,5.731,56.892,17.8Z" transform="translate(336.902 91.596)" fill="#fff"/><path d="M462.42,514.788v9.05l-85.975,19.608-8.4-1.938-1.4-.324L304.8,508Z" transform="translate(384.733 91.793)" fill="#090814"/><path d="M103.915,503.016,302.822,504.9a7.233,7.233,0,0,1,6.511,4.229l53.605,117.45a7.232,7.232,0,0,1-6.83,10.231L156.5,629.9a7.233,7.233,0,0,1-6.294-4.149L97.3,513.327a7.232,7.232,0,0,1,6.613-10.312Z" transform="translate(392.914 -2.018)" fill="#090814"/><path d="M764.443,608.726S720.7,627.58,710.143,622.3s-42.233-18.854-52.037,9.05c-7.906,22.5,38.249,23.916,56.412,23.62a15.177,15.177,0,0,0,11.462-5.52h0l57.574-9.471S775,604.2,764.443,608.726Z" transform="translate(225.246 -42.717)" fill="#ed9da0"/><path d="M846.1,496.039l72.957,29.182,45.6-8.208-3.977-32.639-.584-4.751-76.6-23.711-5.472,5.471Z" transform="translate(251.662 104.598)" fill="#1A8956"/><g transform="translate(1077.755 424.636)"><rect width="257.67" height="64.174" rx="16" fill="#090814"/><rect width="251.836" height="58.34" rx="15" transform="translate(2.917 2.917)" fill="#fff"/><path d="M300.634,369.083a2.072,2.072,0,0,1-1.658-.834l-5.084-6.775a2.072,2.072,0,1,1,3.315-2.487l3.328,4.433,8.539-12.809a2.072,2.072,0,1,1,3.449,2.3l-10.164,15.25a2.074,2.074,0,0,1-1.664.926Z" transform="translate(-70.873 -327.456)" fill="#1A8956"/><g transform="translate(203.217 12.542)"><path d="M7.756,0H31.024A7.756,7.756,0,0,1,38.78,7.756V31.024a7.756,7.756,0,0,1-7.756,7.756H7.756A7.756,7.756,0,0,1,0,31.024V7.756A7.756,7.756,0,0,1,7.756,0Z" fill="#1A8956"/></g><path d="M5.184,0H98.512c2.864,0,5.184,2.894,5.184,6.463s-2.322,6.463-5.184,6.463H5.184C2.322,12.927,0,10.033,0,6.463S2.322,0,5.184,0Z" transform="translate(81.97 15.772)" fill="#e6e6e6"/><path d="M5.137,0h51.37c2.837,0,5.139,2.894,5.139,6.463s-2.3,6.463-5.137,6.463H5.137C2.3,12.927,0,10.033,0,6.463S2.3,0,5.137,0Z" transform="translate(81.97 35.164)" fill="#e6e6e6"/><path d="M245.031,621.374a16.158,16.158,0,1,1-4.733-11.5A16.159,16.159,0,0,1,245.031,621.374Z" transform="translate(-187.562 -589.371)" fill="#1A8956"/></g><g transform="translate(375.426 333.901)"><path d="M418.335,456.6h-104.5a9.257,9.257,0,0,0-9.257,9.257v50.916a9.257,9.257,0,0,0,9.257,9.257h104.5a9.257,9.257,0,0,0,9.257-9.257V465.858a9.257,9.257,0,0,0-9.258-9.258Zm-107.089,6.315a12.775,12.775,0,0,1,14.824,8.919l.164.509-.526.094a13.965,13.965,0,0,1-2.268.166,13.5,13.5,0,0,1-6.884-1.735,14.619,14.619,0,0,1-5.673-7.351l-.164-.508Zm22.685,47.272h-18.64a5.126,5.126,0,0,1,0-10.252h18.639a5.126,5.126,0,1,1,0,10.252Zm84.807-.932a5.608,5.608,0,0,1-5.592,5.592H399.168a5.608,5.608,0,0,1-5.592-5.592v-8.387a5.608,5.608,0,0,1,5.592-5.592h13.98a5.608,5.608,0,0,1,5.592,5.592Z" transform="translate(-304.575 -456.6)" fill="#1A8956"/></g><rect width="10.628" height="39.041" rx="5.314" transform="translate(606.631 339.884)" fill="#1A8956"/><rect width="10.628" height="66.586" rx="5.314" transform="translate(631.791 312.339)" fill="#1A8956"/><rect width="10.628" height="94.132" rx="5.314" transform="translate(656.951 284.793)" fill="#1A8956"/><ellipse cx="2.603" cy="2.603" rx="2.603" ry="2.603" transform="translate(581.375 282.408)" fill="#1A8956"/><ellipse cx="2.603" cy="2.603" rx="2.603" ry="2.603" transform="translate(581.375 309.953)" fill="#1A8956"/><ellipse cx="2.603" cy="2.603" rx="2.603" ry="2.603" transform="translate(581.375 337.499)" fill="#1A8956"/><rect width="105.1" height="2.139" transform="translate(581.375 378.925)" fill="#e6e6e6"/></g></svg>`;

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/images/addmin-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.illustration}>
          <SvgXml xml={illustrationXml} width={280} height={128} />
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
              <Mail size={18} color={emailFocused ? theme.brandDefault : theme.textTertiary} style={styles.inputIcon} />
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
              <Lock size={18} color={theme.textTertiary} style={styles.inputIcon} />
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

        <Pressable style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign in</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable hitSlop={8}>
            <Text style={styles.footerLink}>Create workspace</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: space[16],
    paddingBottom: space[6],
  },
  logo: {
    width: 150,
    height: 60,
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
    shadowColor: theme.brandDefault,
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
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
