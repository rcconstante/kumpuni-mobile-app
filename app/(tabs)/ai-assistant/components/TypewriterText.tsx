import { useEffect, useState } from 'react';

import { MarkdownText } from './MarkdownText';

type TypewriterTextProps = {
  text: string;
  onDone?: () => void;
  onProgress?: () => void;
};

export function TypewriterText({ text, onDone, onProgress }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i % 5 === 0) onProgress?.();
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [text, onDone, onProgress]);

  return <MarkdownText text={displayed} />;
}
