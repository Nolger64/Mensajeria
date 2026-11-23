import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, type ViewProps } from 'react-native';
import { useAuraTheme } from '../theme/AuraThemeProvider';

export function Appear({ children, style, ...props }: ViewProps) {
  const { reduceMotion } = useAuraTheme();
  const [progress] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const entrance = Animated.timing(progress, {
      toValue: 1,
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    entrance.start();
    return () => entrance.stop();
  }, [progress, reduceMotion]);

  return (
    <Animated.View
      {...props}
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
