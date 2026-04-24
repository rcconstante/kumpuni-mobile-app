// App lock service — 4-digit PIN stored as SHA-256 hash in AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'savit:lock:v1';

interface LockData {
  hash: string;
  enabledAt: number;
}

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `savit:${pin}`);
}

export async function isLockEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY);
  return !!raw;
}

export async function setPin(pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits');
  const hash = await hashPin(pin);
  const data: LockData = { hash, enabledAt: Date.now() };
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as LockData;
    const hash = await hashPin(pin);
    return hash === data.hash;
  } catch {
    return false;
  }
}

export async function clearPin(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
