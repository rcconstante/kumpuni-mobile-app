import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export function TypingDots() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={{ fontSize: 13, color: '#9CA3AF', letterSpacing: 2 }}>
      {'•'.repeat(dots).padEnd(3, ' ')}
    </Text>
  );
}
