import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { LinearGradient } from 'react-native-linear-gradient';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressCircle = ({ 
  progress = 0, 
  size = 150, 
  strokeWidth = 12, 
  circleColor = ['#a29bfe', '#6c5ce7'], 
  bgColor = '#e0e0e0',
  current = 0,
  total = 30,
  animationDuration = 1500
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const halfSize = size / 2;
  
  const progressAnimation = useRef(null);
  const bounceAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset animation when progress changes
    animatedValue.setValue(0);
    
    // Animate progress
    progressAnimation.current = Animated.timing(animatedValue, {
      toValue: progress,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    
    // Start animation
    progressAnimation.current.start();
    
    // Add bounce effect when progress completes
    if (progress >= 0.99) {
      Animated.sequence([
        Animated.timing(bounceAnimation, {
          toValue: 1.1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        })
      ]).start();
    }
    
    return () => {
      if (progressAnimation.current) {
        progressAnimation.current.stop();
      }
    };
  }, [progress, animatedValue, bounceAnimation, animationDuration]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: bounceAnimation }] }]}>
      <View style={styles.gradientContainer}>
        <LinearGradient
          colors={circleColor}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2 }]}
        />
      </View>
      
      <Svg width={size} height={size} style={styles.progressCircle}>
        {/* Background Circle */}
        <Circle
          cx={halfSize}
          cy={halfSize}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <G rotation="-90" origin={`${halfSize}, ${halfSize}`}>
          <AnimatedCircle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>

      <View style={styles.textContainer}>
        <Animated.Text style={styles.progressText}>
          {current}
        </Animated.Text>
        <Text style={styles.progressLabel}>DAYS</Text>
        <Text style={styles.totalText}>of {total}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  gradientContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.15,
  },
  progressCircle: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6c5ce7',
    textShadowColor: 'rgba(108, 92, 231, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6c5ce7',
    letterSpacing: 2,
    marginTop: -5,
  },
  totalText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});

export default ProgressCircle;