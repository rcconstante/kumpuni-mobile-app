// Lock screen + provider. Gates the UI when a 4-digit PIN is configured.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Delete, Lock } from 'lucide-react-native';
import { isLockEnabled, verifyPin } from '@/services/lock';

interface LockApi {
  isLocked: boolean;
  hasPin: boolean;
  refresh: () => Promise<void>;
  lockNow: () => void;
}

const Ctx = createContext<LockApi | null>(null);

export function LockProvider({ children }: { children: React.ReactNode }) {
  const [hasPin, setHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState('');
  const checkingRef = useRef(false);

  const refresh = useCallback(async () => {
    const enabled = await isLockEnabled();
    setHasPin(enabled);
    if (enabled) setIsLocked(true);
    else setIsLocked(false);
  }, []);

  const lockNow = useCallback(() => {
    if (hasPin) {
      setEntry('');
      setError(null);
      setIsLocked(true);
    }
  }, [hasPin]);

  // Initial load
  useEffect(() => { refresh(); }, [refresh]);

  // Re-lock when app returns from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') {
        // re-check in case PIN was added/removed in another lifecycle
        isLockEnabled().then((enabled) => {
          setHasPin(enabled);
          if (enabled) setIsLocked(true);
        });
      }
    });
    return () => sub.remove();
  }, []);

  const handleDigit = useCallback(async (d: string) => {
    if (checkingRef.current) return;
    setError(null);
    setEntry((cur) => {
      const next = (cur + d).slice(0, 4);
      if (next.length === 4) {
        checkingRef.current = true;
        verifyPin(next).then((ok) => {
          checkingRef.current = false;
          if (ok) {
            setIsLocked(false);
            setEntry('');
          } else {
            setError('Incorrect PIN');
            setEntry('');
          }
        });
      }
      return next;
    });
  }, []);

  const handleBack = useCallback(() => {
    setError(null);
    setEntry((cur) => cur.slice(0, -1));
  }, []);

  const api = useMemo<LockApi>(() => ({ isLocked, hasPin, refresh, lockNow }), [isLocked, hasPin, refresh, lockNow]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {isLocked ? (
        <View style={s.overlay}>
          <View style={s.iconCircle}>
            <Lock size={28} color="#0D9488" />
          </View>
          <Text style={s.title}>Enter PIN</Text>
          <Text style={s.sub}>{error ?? 'Unlock Savit to continue'}</Text>
          <View style={s.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[s.dot, i < entry.length && s.dotFilled]} />
            ))}
          </View>
          <Keypad onDigit={handleDigit} onBack={handleBack} />
        </View>
      ) : null}
    </Ctx.Provider>
  );
}

export function useLock(): LockApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLock must be used inside LockProvider');
  return ctx;
}

export function Keypad({ onDigit, onBack }: { onDigit: (d: string) => void; onBack: () => void }) {
  const rows: (string | null)[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [null, '0', 'back'],
  ];
  return (
    <View style={s.keypad}>
      {rows.map((row, ri) => (
        <View key={ri} style={s.keyRow}>
          {row.map((k, ki) => {
            if (k === null) return <View key={ki} style={s.keyEmpty} />;
            if (k === 'back') {
              return (
                <TouchableOpacity key={ki} style={s.key} onPress={onBack} activeOpacity={0.6}>
                  <Delete size={22} color="#1F2937" />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={ki} style={s.key} onPress={() => onDigit(k)} activeOpacity={0.6}>
                <Text style={s.keyText}>{k}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#FAFBFC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, zIndex: 9999 },
  iconCircle:{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:     { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  sub:       { fontSize: 13, color: '#6B7280', marginTop: 6, marginBottom: 24 },
  dots:      { flexDirection: 'row', gap: 14, marginBottom: 32 },
  dot:       { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#0D9488' },
  dotFilled: { backgroundColor: '#0D9488' },
  keypad:    { gap: 12 },
  keyRow:    { flexDirection: 'row', gap: 18 },
  key:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  keyEmpty:  { width: 72, height: 72 },
  keyText:   { fontSize: 26, fontWeight: '500', color: '#1F2937' },
});
