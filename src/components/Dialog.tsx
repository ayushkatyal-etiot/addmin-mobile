import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { radius, space, theme, type } from '../theme/tokens';

export type DialogButtonType = 'primary' | 'destructive' | 'cancel';

export interface DialogButton {
  label: string;
  onPress: () => void | Promise<void>;
  type?: DialogButtonType;
}

export interface DialogProps {
  visible: boolean;
  title: string;
  description?: string;
  buttons: DialogButton[];
  onDismiss?: () => void;
  disabled?: boolean;
}

export default function Dialog({
  visible,
  title,
  description,
  buttons,
  onDismiss,
  disabled = false,
}: DialogProps) {
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [opacityAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleButtonPress = async (button: DialogButton) => {
    await button.onPress();
  };

  const getButtonStyle = (type: DialogButtonType = 'primary') => {
    switch (type) {
      case 'destructive':
        return {
          backgroundColor: theme.statusDanger,
          textColor: theme.textOnBrand,
        };
      case 'cancel':
        return {
          backgroundColor: theme.bgSunken,
          textColor: theme.textPrimary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.brandDefault,
          textColor: theme.textOnBrand,
        };
    }
  };

  const visibleButtons = buttons.slice(0, 2);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Pressable style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>

            {description && (
              <Text style={styles.description}>{description}</Text>
            )}

            <View style={styles.buttonContainer}>
              {visibleButtons.map((button, index) => {
                const buttonStyle = getButtonStyle(button.type);
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.button,
                      {
                        backgroundColor: buttonStyle.backgroundColor,
                        opacity: disabled ? 0.6 : 1,
                      },
                    ]}
                    onPress={() => handleButtonPress(button)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: buttonStyle.textColor,
                        },
                      ]}
                    >
                      {button.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 11, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '85%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: theme.bgRaised,
    borderRadius: radius.lg,
    overflow: 'hidden',
    paddingHorizontal: space[6],
    paddingTop: space[6],
  },
  header: {
    marginBottom: space[2],
  },
  title: {
    ...type.h3,
    color: theme.textPrimary,
  },
  description: {
    ...type.body,
    color: theme.textSecondary,
    marginBottom: space[6],
    lineHeight: 22,
  },
  buttonContainer: {
    gap: space[3],
    paddingBottom: space[6],
  },
  button: {
    minHeight: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...type.label,
    letterSpacing: 0,
    fontSize: 14,
  },
});
