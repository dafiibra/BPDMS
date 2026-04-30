import React, {ReactNode, useEffect, useRef} from 'react';
import {Animated, Dimensions, StyleSheet, Text, View} from 'react-native';

const {height} = Dimensions.get('window');

type Props = {
  icon: ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
};

export const SecurityBottomSheet = ({icon, iconColor, title, subtitle}: Props) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.6)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start();

    const createPulse = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {toValue: 1.8, duration: 1000, useNativeDriver: true}),
            Animated.timing(opacity, {toValue: 0, duration: 1000, useNativeDriver: true}),
          ]),
          Animated.parallel([
            Animated.timing(scale, {toValue: 1, duration: 0, useNativeDriver: true}),
            Animated.timing(opacity, {toValue: 0.5, duration: 0, useNativeDriver: true}),
          ]),
        ]),
      );

    createPulse(pulse1, pulse1Opacity, 0).start();
    createPulse(pulse2, pulse2Opacity, 400).start();
  }, []);

  const ringColor = `${iconColor}59`;

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>
        <View style={styles.handle} />

        <View style={styles.iconWrapper}>
          <Animated.View
            style={[styles.pulseRing, {backgroundColor: ringColor, transform: [{scale: pulse1}], opacity: pulse1Opacity}]}
          />
          <Animated.View
            style={[styles.pulseRing, {backgroundColor: ringColor, transform: [{scale: pulse2}], opacity: pulse2Opacity}]}
          />
          <View style={[styles.iconCircle, {backgroundColor: iconColor, shadowColor: iconColor}]}>
            {icon}
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.divider} />
        <Text style={styles.hint}>Branch Performance</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 9998,
  },
  sheet: {
    height: height * 0.52,
    backgroundColor: '#0D1E2D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 28,
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
