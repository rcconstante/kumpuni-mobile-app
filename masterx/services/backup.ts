// Local auto-backup service.
// Writes a JSON snapshot to the app's Documents directory.
// On iOS, this folder is included in iCloud device backup when the user
// has iCloud Backup enabled in Settings. On Android, users can restore
// via the manual share-sheet export.
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKUP_FILENAME = 'savit-auto-backup.json';
const LAST_BACKUP_KEY = 'savit:backup:last-at';

export function getBackupPath(): string {
  return (FileSystem.documentDirectory ?? '') + BACKUP_FILENAME;
}

export async function saveAutoBackup(payload: object): Promise<void> {
  const json = JSON.stringify(payload, null, 2);
  await FileSystem.writeAsStringAsync(getBackupPath(), json);
  await AsyncStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
}

export async function getLastBackupTime(): Promise<Date | null> {
  try {
    const val = await AsyncStorage.getItem(LAST_BACKUP_KEY);
    if (!val) return null;
    return new Date(parseInt(val, 10));
  } catch {
    return null;
  }
}

export async function autoBackupExists(): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(getBackupPath());
    return info.exists;
  } catch {
    return false;
  }
}

export async function readAutoBackup(): Promise<string | null> {
  try {
    const exists = await autoBackupExists();
    if (!exists) return null;
    return await FileSystem.readAsStringAsync(getBackupPath());
  } catch {
    return null;
  }
}

export function formatBackupTime(date: Date | null): string {
  if (!date) return 'Never';
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString();
}
