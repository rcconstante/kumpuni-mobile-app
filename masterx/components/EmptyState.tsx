import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon }: Props) {
  return (
    <View style={s.wrap}>
      {icon ? (
        <View style={s.icon}>{icon}</View>
      ) : (
        <Image source={require('../assets/images/sad.png')} style={s.sad} resizeMode="contain" />
      )}
      <Text style={s.title}>{title}</Text>
      {!!subtitle && <Text style={s.sub}>{subtitle}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 60 },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sad:  { width: 180, height: 180, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
});
