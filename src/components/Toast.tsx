import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { radius, space, theme, type } from '../theme/tokens';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

export default function Toast({ visible, message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, duration, onHide]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.statusSuccessBg,
          textColor: theme.statusSuccessStrong,
          iconColor: theme.statusSuccess,
        };
      case 'error':
        return {
          backgroundColor: theme.statusDangerBg,
          textColor: theme.statusDangerStrong,
          iconColor: theme.statusDanger,
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.statusInfoBg,
          textColor: theme.statusInfoStrong,
          iconColor: theme.statusInfo,
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={getToastStyle().iconColor} />;
      case 'error':
        return <AlertCircle size={20} color={getToastStyle().iconColor} />;
      case 'info':
      default:
        return <Info size={20} color={getToastStyle().iconColor} />;
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: toastStyle.backgroundColor,
          },
        ]}
      >
        {getIcon()}
        <Text
          style={[
            styles.message,
            {
              color: toastStyle.textColor,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: space[4],
    left: space[4],
    right: space[4],
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
  },
  message: {
    ...type.small,
    flex: 1,
  },
});
