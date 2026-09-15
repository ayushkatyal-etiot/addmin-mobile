import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme, space, radius } from '../theme/tokens';

export default function TextField({
  label, required, value, onChangeText, onBlur, placeholder, error, keyboardType, autoCapitalize,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  keyboardType?: 'decimal-pad' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'characters';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, error && styles.labelError]}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: space[1] },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelError: { color: theme.statusDanger },
  required: { color: theme.statusDanger },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger },
  input: {
    minHeight: 44, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md,
  },
  inputError: { borderColor: theme.statusDanger },
});
