import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  ChevronLeft, ChevronRight, Palette, Globe, Tag, FolderOpen,
  CloudUpload, Download, Upload, Trash2, FileText, Shield,
  MessageSquare, Info, Check, Lock, LayoutGrid,
} from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/components/Toast';
import { useDialogs } from '@/components/Dialogs';
import { useTheme } from '@/context/ThemeContext';
import { useLock, Keypad } from '@/context/LockContext';
import { useI18n, LANG_NAMES } from '@/context/I18nContext';
import { resetDatabase } from '@/db';
import { setPin, verifyPin, clearPin } from '@/services/lock';
import { importFromFileUri } from '@/services/importExport';
import { saveAutoBackup, getLastBackupTime, formatBackupTime } from '@/services/backup';
import type { Appearance, ViewMode, CollectionsLayout, LangCode } from '@/services/settings';

type Colors = ReturnType<typeof useTheme>['colors'];

type RowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  sub?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  disabled?: boolean;
  colors: Colors;
};

function SettingRow({
  icon, label, value, onPress, danger, sub, toggle, toggleValue, onToggle, disabled, colors,
}: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={toggle || disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.dangerSoft : colors.accentSoft }]}>{icon}</View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: danger ? colors.danger : colors.textFaint }]}>{sub}</Text> : null}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      ) : value ? (
        <View style={styles.rowRight}>
          <Text style={[styles.rowValue, { color: colors.textFaint }]}>{value}</Text>
          {!disabled && <ChevronRight size={16} color={colors.textFaint} />}
        </View>
      ) : !disabled ? (
        <ChevronRight size={16} color={colors.textFaint} />
      ) : null}
    </TouchableOpacity>
  );
}

interface PickerOption<T extends string> { value: T; label: string }
function PickerModal<T extends string>({
  visible, title, options, selected, onSelect, onClose, colors,
}: {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T | null;
  onSelect: (v: T) => void;
  onClose: () => void;
  colors: Colors;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          {options.map((opt) => (
            <TouchableOpacity key={opt.value} style={styles.modalRow} onPress={() => { onSelect(opt.value); onClose(); }}>
              <Text style={[styles.modalRowText, { color: colors.text }]}>{opt.label}</Text>
              {selected === opt.value && <Check size={18} color={colors.accent} />}
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const APPEARANCE_OPTS: PickerOption<Appearance>[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
const VIEW_MODE_OPTS: PickerOption<ViewMode>[] = [
  { value: 'preview', label: 'Link Preview (default)' },
  { value: 'grid', label: 'Visual Grid' },
  { value: 'glass', label: 'Vertical Glass' },
  { value: 'list', label: 'Compact List' },
];
const COLLECTIONS_LAYOUT_OPTS: PickerOption<CollectionsLayout>[] = [
  { value: 'preview', label: 'Link Preview (default)' },
  { value: 'grid', label: 'Visual Grid' },
  { value: 'glass', label: 'Vertical Glass' },
  { value: 'list', label: 'Compact List' },
];

const LANGUAGE_OPTS: PickerOption<LangCode>[] = (
  Object.entries(LANG_NAMES) as [LangCode, string][]
).map(([value, label]) => ({ value, label }));

// ----- 4-digit PIN setup modal -----
type PinMode = 'set-new' | 'confirm-new' | 'verify-current';
function PinSetupModal({
  visible, title, initialMode, onClose, onComplete, colors, isDark,
}: {
  visible: boolean;
  title: string;
  initialMode: PinMode;
  onClose: () => void;
  onComplete: (pin: string) => Promise<void>;
  colors: Colors;
  isDark: boolean;
}) {
  const [mode, setMode] = useState<PinMode>(initialMode);
  const [first, setFirst] = useState('');
  const [entry, setEntry] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setMode(initialMode); setFirst(''); setEntry(''); setError(null); };

  React.useEffect(() => {
    if (visible) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialMode]);

  const submit = async (pin: string) => {
    if (mode === 'verify-current') {
      const ok = await verifyPin(pin);
      if (!ok) { setError('Incorrect PIN'); setEntry(''); return; }
      await onComplete(pin); onClose();
    } else if (mode === 'set-new') {
      setFirst(pin); setEntry(''); setMode('confirm-new');
    } else {
      if (pin !== first) { setError('PINs do not match'); setEntry(''); return; }
      await onComplete(pin); onClose();
    }
  };

  const handleDigit = (d: string) => {
    setError(null);
    setEntry((cur) => {
      const next = (cur + d).slice(0, 4);
      if (next.length === 4) setTimeout(() => submit(next), 80);
      return next;
    });
  };
  const handleBack = () => { setError(null); setEntry((c) => c.slice(0, -1)); };

  const headline =
    mode === 'set-new' ? 'Choose a 4-digit PIN' :
    mode === 'confirm-new' ? 'Confirm your PIN' :
    'Enter current PIN';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.pinBackdrop, { backgroundColor: colors.scrim }]}>
        <View style={[styles.pinCard, { backgroundColor: colors.surface }]}>
          <View style={styles.pinHeader}>
            <Text style={[styles.pinTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={[styles.pinClose, { color: colors.accent }]}>Cancel</Text></TouchableOpacity>
          </View>
          <Text style={[styles.pinSub, { color: error ? colors.danger : colors.textMuted }]}>{error ?? headline}</Text>
          <View style={styles.pinDots}>
            {[0,1,2,3].map((i) => (
              <View key={i} style={[styles.pinDot, { borderColor: colors.accent }, i < entry.length && { backgroundColor: colors.accent }]} />
            ))}
          </View>
          <Keypad onDigit={handleDigit} onBack={handleBack} />
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, collections, updateSettings, reloadAll, links, tags, clipboardHistory } = useAppData();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();
  const lock = useLock();

  const [showAppearance, setShowAppearance] = useState(false);
  const [showViewMode, setShowViewMode] = useState(false);
  const [showCollectionsLayout, setShowCollectionsLayout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [pinModal, setPinModal] = useState<{ mode: PinMode; title: string; intent: 'enable' | 'disable' | 'change' } | null>(null);
  const [importing, setImporting] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const [backingUp, setBackingUp] = useState(false);

  React.useEffect(() => {
    getLastBackupTime().then(setLastBackupTime).catch(() => {});
  }, []);

  const appearanceLabel = APPEARANCE_OPTS.find((o) => o.value === settings.appearance)?.label ?? 'System';
  const viewModeLabel = VIEW_MODE_OPTS.find((o) => o.value === settings.viewMode)?.label ?? 'Link Preview';
  const collectionsLayoutLabel = COLLECTIONS_LAYOUT_OPTS.find((o) => o.value === settings.collectionsLayout)?.label ?? 'Visual Grid';
  const languageLabel = LANG_NAMES[settings.language] ?? LANG_NAMES.en;
  const defaultCollectionLabel =
    collections.find((c) => c.id === settings.defaultCollectionId)?.name ?? t.settingNone;

  const handleExport = async () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        settings,
        collections,
        tags,
        links,
        clipboardHistory,
      };
      const json = JSON.stringify(payload, null, 2);
      const fileUri = (FileSystem.documentDirectory ?? '') + `savit-export-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, json);
      const ok = await Sharing.isAvailableAsync();
      if (ok) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export Savit data' });
      } else {
        await dialogs.confirm({ title: 'Saved', message: `Export written to ${fileUri}`, confirmLabel: 'OK', cancelLabel: 'Close' });
      }
    } catch (e: any) {
      await dialogs.confirm({ title: 'Export failed', message: e?.message ?? 'Unknown error', confirmLabel: 'OK', cancelLabel: 'Close' });
    }
  };

  const handleImport = async () => {
    if (importing) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];

      const ok = await dialogs.confirm({
        title: 'Import data?',
        message: `Import "${file.name}"? Existing items with the same URL or name will be skipped.`,
        confirmLabel: 'Import',
      });
      if (!ok) return;

      setImporting(true);
      const summary = await importFromFileUri(file.uri);
      await reloadAll();
      toast.show(`Imported ${summary.links} links, ${summary.collections} collections`);
      await dialogs.confirm({
        title: 'Import complete',
        message: `Links: ${summary.links}\nCollections: ${summary.collections}\nTags: ${summary.tags}\nClipboard: ${summary.clipboard}\nSkipped: ${summary.skipped}`,
        confirmLabel: 'Done',
        cancelLabel: 'Close',
      });
    } catch (e: any) {
      await dialogs.confirm({ title: 'Import failed', message: e?.message ?? 'Unknown error', confirmLabel: 'OK', cancelLabel: 'Close' });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    const ok = await dialogs.confirm({
      title: 'Delete All Data',
      message: 'This action cannot be undone. All your saved links, collections, tags, and clipboard items will be permanently deleted.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await resetDatabase();
    await reloadAll();
    toast.show('All data deleted');
  };

  const handleFeedback = async () => {
    try {
      await Linking.openURL('mailto:hello@getsavit.app?subject=Savit%20Feedback');
    } catch {
      await dialogs.confirm({ title: 'Could not open mail app', confirmLabel: 'OK', cancelLabel: 'Close' });
    }
  };

  const handleLockToggle = async (next: boolean) => {
    if (next && !lock.hasPin) {
      setPinModal({ mode: 'set-new', title: 'Set App Lock PIN', intent: 'enable' });
    } else if (!next && lock.hasPin) {
      setPinModal({ mode: 'verify-current', title: 'Disable App Lock', intent: 'disable' });
    }
  };

  const handleChangePin = () => {
    if (!lock.hasPin) return;
    setPinModal({ mode: 'verify-current', title: 'Change PIN', intent: 'change' });
  };

  const onPinComplete = async (_pin: string) => {
    if (!pinModal) return;
    if (pinModal.intent === 'enable') {
      await setPin(_pin); await lock.refresh(); toast.show('App lock enabled');
    } else if (pinModal.intent === 'disable') {
      await clearPin(); await lock.refresh(); toast.show('App lock disabled');
    } else if (pinModal.intent === 'change') {
      setPinModal({ mode: 'set-new', title: 'Set new PIN', intent: 'enable' });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.settingsTitle}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeader, { color: colors.textFaint }]}>{t.sectionGeneral}</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow colors={colors} icon={<Palette size={18} color={colors.accent} />} label={t.settingAppearance} value={appearanceLabel} onPress={() => setShowAppearance(true)} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<LayoutGrid size={18} color={colors.accent} />} label={t.settingHomeLayout} value={viewModeLabel} onPress={() => setShowViewMode(true)} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<FolderOpen size={18} color={colors.accent} />} label={t.settingCollectionsLayout} value={collectionsLayoutLabel} onPress={() => setShowCollectionsLayout(true)} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<Globe size={18} color={colors.accent} />} label={t.settingLanguage} value={languageLabel} onPress={() => setShowLanguage(true)} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<Tag size={18} color={colors.accent} />} label={t.settingAutoImportTags} sub={t.settingAutoImportTagsSub}
            toggle toggleValue={settings.autoImportTags} onToggle={(v) => updateSettings({ autoImportTags: v })} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<FolderOpen size={18} color={colors.accent} />} label={t.settingDefaultCollection} value={defaultCollectionLabel} onPress={() => setShowCollection(true)} />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textFaint }]}>{t.sectionSecurity}</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow colors={colors} icon={<Lock size={18} color={colors.accent} />} label={t.settingAppLock}
            sub={lock.hasPin ? t.settingAppLockHasPin : t.settingAppLockNoPin}
            toggle toggleValue={lock.hasPin} onToggle={handleLockToggle} />
          {lock.hasPin && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <SettingRow colors={colors} icon={<Lock size={18} color={colors.accent} />} label={t.settingChangePIN} onPress={handleChangePin} />
            </>
          )}
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textFaint }]}>{t.sectionData}</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            colors={colors}
            icon={<CloudUpload size={18} color={colors.accent} />}
            label={t.settingBackupSync}
            sub={backingUp ? 'Backing up…' : `Auto-backup · Last: ${formatBackupTime(lastBackupTime)}`}
            onPress={async () => {
              if (backingUp) return;
              setBackingUp(true);
              try {
                await saveAutoBackup({ exportedAt: new Date().toISOString(), version: 1, links, collections, tags, clipboardHistory });
                const next = await getLastBackupTime();
                setLastBackupTime(next);
                toast.show('Backup saved to device');
              } catch {
                toast.show('Backup failed');
              } finally {
                setBackingUp(false);
              }
            }}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<Download size={18} color={colors.accent} />} label={t.settingExportData} onPress={handleExport} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<Upload size={18} color={colors.accent} />} label={t.settingImportData}
            sub={importing ? t.settingImporting : t.settingImportDataSub} onPress={handleImport} disabled={importing} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<Trash2 size={18} color={colors.danger} />} label={t.settingDeleteAllData} danger onPress={handleDeleteAllData} />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textFaint }]}>{t.sectionAbout}</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow colors={colors} icon={<Info size={18} color={colors.accent} />} label={t.settingAboutSavit} onPress={() => router.push('/about' as any)} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<FileText size={18} color={colors.accent} />} label={t.aboutTerms}
            onPress={() => router.push({ pathname: '/webview' as any, params: { url: 'https://getsavit.netlify.app/terms', title: t.aboutTerms } })} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<Shield size={18} color={colors.accent} />} label={t.aboutPrivacy}
            onPress={() => router.push({ pathname: '/webview' as any, params: { url: 'https://getsavit.netlify.app/privacy', title: t.aboutPrivacy } })} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<FileText size={18} color={colors.accent} />} label="Open Source Licenses"
            onPress={() => router.push({ pathname: '/webview' as any, params: { url: 'https://getsavit.netlify.app/license', title: 'Open Source Licenses' } })} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow colors={colors} icon={<MessageSquare size={18} color={colors.accent} />} label={t.settingSendFeedback} onPress={handleFeedback} />
        </View>

        <Text style={[styles.version, { color: colors.textFaint }]}>Savit v1.0.0</Text>
      </ScrollView>

      <PickerModal colors={colors} visible={showAppearance} title={t.settingAppearance} options={APPEARANCE_OPTS}
        selected={settings.appearance} onSelect={(v) => updateSettings({ appearance: v })} onClose={() => setShowAppearance(false)} />
      <PickerModal colors={colors} visible={showViewMode} title={t.settingHomeLayout} options={VIEW_MODE_OPTS}
        selected={settings.viewMode} onSelect={(v) => updateSettings({ viewMode: v })} onClose={() => setShowViewMode(false)} />
      <PickerModal colors={colors} visible={showCollectionsLayout} title={t.settingCollectionsLayout} options={COLLECTIONS_LAYOUT_OPTS}
        selected={settings.collectionsLayout} onSelect={(v) => updateSettings({ collectionsLayout: v })} onClose={() => setShowCollectionsLayout(false)} />
      <PickerModal colors={colors} visible={showLanguage} title={t.settingLanguage} options={LANGUAGE_OPTS}
        selected={settings.language} onSelect={(v) => updateSettings({ language: v })} onClose={() => setShowLanguage(false)} />
      <PickerModal colors={colors} visible={showCollection} title={t.settingDefaultCollection}
        options={[{ value: '', label: t.settingNone }, ...collections.map((c) => ({ value: c.id, label: c.name }))]}
        selected={settings.defaultCollectionId ?? ''}
        onSelect={(v) => updateSettings({ defaultCollectionId: v ? v : null })}
        onClose={() => setShowCollection(false)} />

      {pinModal && (
        <PinSetupModal
          colors={colors}
          isDark={isDark}
          visible={!!pinModal}
          title={pinModal.title}
          initialMode={pinModal.mode}
          onClose={() => setPinModal(null)}
          onComplete={onPinComplete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 4 },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontSize: 17, fontWeight: '600' },
  scrollContent:    { paddingBottom: 40 },
  sectionHeader:    { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, textTransform: 'uppercase' },
  section:          { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  row:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 54 },
  rowIcon:          { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowBody:          { flex: 1 },
  rowLabel:         { fontSize: 15, fontWeight: '500' },
  rowSub:           { fontSize: 12, marginTop: 2 },
  rowRight:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue:         { fontSize: 14 },
  divider:          { height: 1, marginLeft: 60 },
  version:          { textAlign: 'center', fontSize: 12, marginTop: 32 },
  modalBackdrop:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard:        { width: '100%', maxWidth: 360, borderRadius: 16, padding: 16 },
  modalTitle:       { fontSize: 16, fontWeight: '700', marginBottom: 8, paddingHorizontal: 8 },
  modalRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 8 },
  modalRowText:     { fontSize: 15 },

  pinBackdrop:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  pinCard:          { width: '100%', maxWidth: 380, borderRadius: 22, padding: 20, alignItems: 'center' },
  pinHeader:        { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  pinTitle:         { fontSize: 17, fontWeight: '700' },
  pinClose:         { fontSize: 14, fontWeight: '600' },
  pinSub:           { fontSize: 13, marginBottom: 18 },
  pinDots:          { flexDirection: 'row', gap: 14, marginBottom: 24 },
  pinDot:           { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
});
