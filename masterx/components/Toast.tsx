// Lightweight global toast. Wrap app with <ToastProvider/>; call useToast().show('msg').
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ToastContextValue {
  show: (message: string) => void;
}

const Ctx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setMessage(msg);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    hideTimer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMessage(null);
      });
    }, 1800);
  }, [opacity]);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {message && (
        <Animated.View pointerEvents="none" style={[s.wrap, { opacity }]}>
          <View style={s.toast}>
            <Text style={s.text}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(Ctx) ?? { show: () => {} };
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center', zIndex: 9999 },
  toast: { backgroundColor: 'rgba(31,41,55,0.95)', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, maxWidth: '80%' },
  text: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', textAlign: 'center' },
});
