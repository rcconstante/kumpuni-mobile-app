import { Text } from 'react-native';

type MarkdownTextProps = {
  text: string;
};

export function MarkdownText({ text }: MarkdownTextProps) {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: '700', color: '#1F2937' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}
