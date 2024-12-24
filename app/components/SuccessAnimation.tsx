import React, { useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { useColorScheme } from 'react-native';

interface SuccessAnimationProps {
  visible: boolean;
  onComplete: () => void;
}

export default function SuccessAnimation({ visible, onComplete }: SuccessAnimationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }
      ]}>
        <LottieView
          source={require('../assets/success.json')}
          autoPlay
          loop={false}
          style={styles.animation}
          onAnimationFinish={onComplete}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
});
