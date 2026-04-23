let idSeq = 0;

export function uid(prefix = ''): string {
  return `${prefix}${Date.now()}-${++idSeq}-${Math.random().toString(36).slice(2, 5)}`;
}
