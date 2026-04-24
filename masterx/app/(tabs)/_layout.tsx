import React, { useEffect, useMemo, useState } from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  Home,
  FolderOpen,
  Tag,
  ClipboardList,
  Plus,
  X,
  Link2,
  LayoutGrid,
  ChevronDown,
  Camera,
} from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useUi } from '@/context/UiContext';
import { useTheme } from '@/context/ThemeContext';
import type { ThemePalette } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useToast } from '@/components/Toast';
import { ASSET_ICONS, EMOJI_LIST, LUCIDE_ICONS } from '@/components/iconCatalog';
import { createLink } from '@/services/links';
import { createCollection } from '@/services/collections';
import { fetchLinkMetadata, isProbablyUrl } from '@/services/metadata';
import { markClipboardSaved } from '@/services/clipboard';
import type { IconKind } from '@/db/types';

type IconTabType = 'assets' | 'emoji' | 'lucide';

interface SelectedIcon {
  kind: IconKind;
  value: string;
  color: string;
}

function AddModal() {
  const { addModalVisible, addModalIntent, closeAddModal } = useUi();
  const { collections, reloadAll } = useAppData();
  const toast = useToast();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const ms = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [activeTab, setActiveTab] = useState<'link' | 'collection'>('link');
  const [linkUrl, setLinkUrl] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCollectionId, setParentCollectionId] = useState<string | null>(null);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [iconTab, setIconTab] = useState<IconTabType>('assets');
  const [selectedIcon, setSelectedIcon] = useState<SelectedIcon>({ kind: 'asset', value: 'green', color: '#C8F6E8' });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parentCollectionName = useMemo(
    () => collections.find((c) => c.id === parentCollectionId)?.name ?? '',
    [collections, parentCollectionId]
  );

  const reset = () => {
    setLinkUrl('');
    setCollectionName('');
    setDescription('');
    setParentCollectionId(null);
    setShowParentPicker(false);
    setIconTab('assets');
    setSelectedIcon({ kind: 'asset', value: 'green', color: '#C8F6E8' });
    setPhotoUri(null);
    setActiveTab('link');
    setSaving(false);
  };

  // Apply intent on open.
  useEffect(() => {
    if (!addModalVisible) return;
    if (addModalIntent?.tab) setActiveTab(addModalIntent.tab);
    if (addModalIntent?.presetUrl) setLinkUrl(addModalIntent.presetUrl);
    if (addModalIntent?.presetCollectionId !== undefined) {
      setParentCollectionId(addModalIntent.presetCollectionId);
    }
  }, [addModalVisible, addModalIntent]);

  const handleClose = () => {
    reset();
    closeAddModal();
  };

  const isIconSelected = (kind: IconKind, value: string) =>
    selectedIcon.kind === kind && selectedIcon.value === value;

  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to upload an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        setSelectedIcon({ kind: 'photo', value: uri, color: '#F3F4F6' });
      }
    } catch {
      Alert.alert('Image picker error', 'Could not open photo library.');
    }
  };

  const handleSaveLink = async () => {
    const url = linkUrl.trim();
    if (!isProbablyUrl(url)) {
      Alert.alert(t.dialogInvalidUrl, t.dialogInvalidUrlMsg);
      return;
    }
    setSaving(true);
    try {
      const meta = await fetchLinkMetadata(url);
      await createLink({
        url: meta.url,
        title: meta.title,
        description: meta.description,
        image: meta.image,
        domain: meta.domain,
        collectionId: parentCollectionId,
      });
      if (addModalIntent?.clipboardEntryId) {
        await markClipboardSaved(addModalIntent.clipboardEntryId);
      }
      await reloadAll();
      toast.show(t.toastLinkSaved);
      handleClose();
    } catch (e: any) {
      Alert.alert(t.dialogCouldNotSave, e?.message ?? 'Unknown error');
      setSaving(false);
    }
  };

  const handleSaveCollection = async () => {
    const name = collectionName.trim();
    if (!name) {
      Alert.alert(t.dialogNameRequired, 'Please enter a collection name.');
      return;
    }
    setSaving(true);
    try {
      await createCollection({
        name,
        description,
        parentId: parentCollectionId,
        iconKind: selectedIcon.kind,
        iconValue: selectedIcon.value,
        color: selectedIcon.color,
      });
      await reloadAll();
      toast.show(t.toastCollectionCreated);
      handleClose();
    } catch (e: any) {
      Alert.alert(t.dialogCouldNotSave, e?.message ?? 'Unknown error');
      setSaving(false);
    }
  };

  return (
    <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={ms.overlay}>
        <TouchableOpacity style={ms.backdrop} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={ms.kv}
        >
          <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
            <View style={[ms.handle, { backgroundColor: colors.border }]} />

            <View style={ms.sheetHeader}>
              <View style={[ms.sheetIconBox, { backgroundColor: colors.accentSoft }]}>
                {activeTab === 'link' ? <Link2 size={20} color={colors.accent} /> : <LayoutGrid size={20} color={colors.accent} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ms.sheetTitle, { color: colors.text }]}>{activeTab === 'link' ? t.modalAddLink : t.modalCreateCollection}</Text>
                <Text style={[ms.sheetSub, { color: colors.textFaint }]}>{activeTab === 'link' ? t.modalAddLinkSub : t.modalCreateCollectionSub}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={ms.closeBtn}>
                <X size={20} color={colors.textFaint} />
              </TouchableOpacity>
            </View>

            <View style={ms.segmentWrap}>
              <View style={ms.segment}>
                <TouchableOpacity style={[ms.segBtn, activeTab === 'link' && ms.segBtnActive]} onPress={() => setActiveTab('link')}>
                  <Text style={[ms.segText, activeTab === 'link' && ms.segTextActive]}>{t.modalAddLink}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[ms.segBtn, activeTab === 'collection' && ms.segBtnActive]} onPress={() => setActiveTab('collection')}>
                  <Text style={[ms.segText, activeTab === 'collection' && ms.segTextActive]}>{t.modalCreateCollection}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={ms.scrollArea}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={ms.formContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {activeTab === 'link' ? (
                <>
                  <Text style={ms.label}>{t.modalUrl}</Text>
                  <TextInput
                    style={ms.input}
                    placeholder={t.modalUrlPlaceholder}
                    placeholderTextColor={colors.textFaint}
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="done"
                    autoFocus
                  />
                  <Text style={ms.helperText}>{t.modalHelperUrl}</Text>

                  <Text style={ms.label}>{t.modalCollection}</Text>
                  <TouchableOpacity style={ms.pickerBtn} onPress={() => setShowParentPicker(!showParentPicker)}>
                    <Text style={[ms.pickerText, !parentCollectionName && ms.pickerPlaceholder]}>
                      {parentCollectionName || t.modalNoCollection}
                    </Text>
                    <ChevronDown size={16} color={colors.textFaint} />
                  </TouchableOpacity>
                  {showParentPicker && (
                    <View style={ms.dropdown}>
                      <TouchableOpacity style={ms.dropItem} onPress={() => { setParentCollectionId(null); setShowParentPicker(false); }}>
                        <Text style={ms.dropText}>{t.settingNone}</Text>
                      </TouchableOpacity>
                      {collections.map((c) => (
                        <TouchableOpacity key={c.id} style={ms.dropItem} onPress={() => { setParentCollectionId(c.id); setShowParentPicker(false); }}>
                          <Text style={ms.dropText}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={{ height: 16 }} />
                </>
              ) : (
                <>
                  <Text style={ms.label}>{t.modalCreateCollection}</Text>
                  <TextInput
                    style={ms.input}
                    placeholder={t.modalTitlePlaceholder}
                    placeholderTextColor={colors.textFaint}
                    value={collectionName}
                    onChangeText={setCollectionName}
                    returnKeyType="next"
                    autoFocus
                  />

                  <Text style={ms.label}>{t.modalDescription} (Optional)</Text>
                  <TextInput
                    style={[ms.input, ms.inputMulti]}
                    placeholder={t.modalDescriptionPlaceholder}
                    placeholderTextColor={colors.textFaint}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <Text style={ms.label}>{t.modalParentCollection}</Text>
                  <TouchableOpacity style={ms.pickerBtn} onPress={() => setShowParentPicker(!showParentPicker)}>
                    <Text style={[ms.pickerText, !parentCollectionName && ms.pickerPlaceholder]}>
                      {parentCollectionName || t.modalNoCollection}
                    </Text>
                    <ChevronDown size={16} color={colors.textFaint} />
                  </TouchableOpacity>
                  {showParentPicker && (
                    <View style={ms.dropdown}>
                      <TouchableOpacity style={ms.dropItem} onPress={() => { setParentCollectionId(null); setShowParentPicker(false); }}>
                        <Text style={ms.dropText}>None</Text>
                      </TouchableOpacity>
                      {collections.map((c) => (
                        <TouchableOpacity key={c.id} style={ms.dropItem} onPress={() => { setParentCollectionId(c.id); setShowParentPicker(false); }}>
                          <Text style={ms.dropText}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={ms.label}>{t.modalChooseIcon}</Text>

                  <View style={ms.iconTabRow}>
                    {(['assets', 'emoji', 'lucide'] as IconTabType[]).map((tab) => (
                      <TouchableOpacity
                        key={tab}
                        style={[ms.iconTabBtn, iconTab === tab && ms.iconTabBtnActive]}
                        onPress={() => setIconTab(tab)}
                      >
                        <Text style={[ms.iconTabText, iconTab === tab && ms.iconTabTextActive]}>
                          {tab === 'assets' ? t.modalAssets : tab === 'emoji' ? t.modalEmoji : t.modalIcons}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {iconTab === 'assets' && (
                    <View style={ms.iconGrid}>
                      {ASSET_ICONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          style={[ms.iconOpt, { backgroundColor: opt.color }, isIconSelected('asset', opt.id) && ms.iconOptSelected]}
                          onPress={() => setSelectedIcon({ kind: 'asset', value: opt.id, color: opt.color })}
                        >
                          <Image source={opt.image} style={ms.iconOptImg} resizeMode="contain" />
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[ms.iconOpt, ms.uploadOpt, selectedIcon.kind === 'photo' && ms.iconOptSelected]}
                        onPress={pickPhoto}
                      >
                        {photoUri ? (
                          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <>
                            <Camera size={24} color="#9CA3AF" />
                            <Text style={ms.uploadText}>{t.modalUpload}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {iconTab === 'emoji' && (
                    <View style={ms.emojiGrid}>
                      {EMOJI_LIST.map((em) => (
                        <TouchableOpacity
                          key={em}
                          style={[ms.emojiOpt, isIconSelected('emoji', em) && ms.emojiOptSelected]}
                          onPress={() => setSelectedIcon({ kind: 'emoji', value: em, color: '#F0FDFA' })}
                        >
                          <Text style={ms.emojiText}>{em}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {iconTab === 'lucide' && (
                    <View style={ms.lucideGrid}>
                      {LUCIDE_ICONS.map(({ id, Icon, label }) => (
                        <TouchableOpacity
                          key={id}
                          style={[ms.lucideOpt, isIconSelected('lucide', id) && ms.lucideOptSelected]}
                          onPress={() => setSelectedIcon({ kind: 'lucide', value: id, color: '#F0FDFA' })}
                        >
                          <Icon size={22} color={isIconSelected('lucide', id) ? colors.accent : colors.textMuted} />
                          <Text style={[ms.lucideLabel, isIconSelected('lucide', id) && ms.lucideLabelActive]}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <View style={{ height: 16 }} />
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[ms.saveBtn, saving && ms.saveBtnDisabled]}
              onPress={activeTab === 'link' ? handleSaveLink : handleSaveCollection}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={ms.saveBtnText}>{activeTab === 'link' ? t.modalSaveLink : t.modalCreateCollection}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ThemePalette, isDark: boolean) {
  return StyleSheet.create({
    overlay:     { flex: 1, justifyContent: 'flex-end' },
    backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)' },
    kv:          { flex: 1, justifyContent: 'flex-end' },
    sheet:       { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Platform.OS === 'ios' ? 36 : 20, maxHeight: '92%' },
    scrollArea:  { flexGrow: 0 },
    handle:      { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
    sheetIconBox:{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
    sheetTitle:  { fontSize: 18, fontWeight: '700', color: colors.text },
    sheetSub:    { fontSize: 13, color: colors.textFaint, marginTop: 2 },
    closeBtn:    { padding: 6 },
    segmentWrap: { paddingHorizontal: 20, paddingBottom: 8 },
    segment:     { flexDirection: 'row', backgroundColor: colors.bgElev, borderRadius: 10, padding: 3 },
    segBtn:      { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
    segBtnActive:{ backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.25 : 0.08, shadowRadius: 3, elevation: 2 },
    segText:     { fontSize: 14, fontWeight: '500', color: colors.textFaint },
    segTextActive:{ color: colors.text, fontWeight: '600' },
    formContent: { paddingHorizontal: 20, paddingBottom: 8 },
    helperText:  { fontSize: 13, color: colors.textFaint, marginTop: 8 },
    label:       { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 20, marginBottom: 8 },
    input:       { backgroundColor: colors.bgElev, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, color: colors.text, minHeight: 54, borderWidth: 1, borderColor: colors.border },
    inputMulti:  { height: 90, paddingTop: 14 },
    pickerBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgElev, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, borderColor: colors.border },
    pickerText:  { fontSize: 15, color: colors.text },
    pickerPlaceholder: { color: colors.textFaint },
    dropdown:    { backgroundColor: colors.surface, borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
    dropItem:    { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.divider },
    dropText:    { fontSize: 15, color: colors.text },
    iconTabRow:  { flexDirection: 'row', backgroundColor: colors.bgElev, borderRadius: 10, padding: 3, marginBottom: 14 },
    iconTabBtn:  { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    iconTabBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.25 : 0.08, shadowRadius: 3, elevation: 2 },
    iconTabText: { fontSize: 13, fontWeight: '500', color: colors.textFaint },
    iconTabTextActive: { color: colors.text, fontWeight: '600' },
    iconGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    iconOpt:     { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'transparent', overflow: 'hidden' },
    iconOptSelected: { borderColor: colors.accent },
    iconOptImg:  { width: 48, height: 48 },
    uploadOpt:   { backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', gap: 4 },
    uploadText:  { fontSize: 10, color: colors.textFaint, fontWeight: '500' },
    emojiGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    emojiOpt:    { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: 'transparent' },
    emojiOptSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    emojiText:   { fontSize: 22 },
    lucideGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    lucideOpt:   { width: 72, height: 72, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: 'transparent', gap: 5 },
    lucideOptSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    lucideLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
    lucideLabelActive: { color: colors.accent },
    saveBtn:     { backgroundColor: colors.accent, marginHorizontal: 20, marginTop: 12, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  });
}

function TabItem({
  focused,
  icon: Icon,
  activeBg,
  inactive,
}: {
  focused: boolean;
  icon: typeof Home;
  activeBg: string;
  inactive: string;
}) {
  return (
    <View style={[styles.tabPill, focused && { backgroundColor: activeBg }]}>
      <Icon size={20} color={focused ? '#FFFFFF' : inactive} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { openAddModal } = useUi();
  const { isDark, colors } = useTheme();

  const tabBottom =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 12)
      : Math.max(insets.bottom, 8);

  const tabBg = isDark ? 'rgba(21,27,35,0.95)' : 'rgba(255,255,255,0.92)';

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: tabBottom + 8,
            left: 0,
            right: 0,
            marginHorizontal: 24,
            backgroundColor: tabBg,
            borderRadius: 32,
            height: 64,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 12,
            paddingBottom: 0,
            paddingTop: 0,
            paddingHorizontal: 8,
          },
          tabBarItemStyle: { height: 64, paddingTop: 0, paddingBottom: 0 },
          tabBarIconStyle: { width: '100%', height: 64, flex: 1, marginBottom: 0 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: ({ focused }) => <TabItem focused={focused} icon={Home} activeBg={colors.accent} inactive={colors.textFaint} /> }}
        />
        <Tabs.Screen
          name="collections"
          options={{ tabBarIcon: ({ focused }) => <TabItem focused={focused} icon={FolderOpen} activeBg={colors.accent} inactive={colors.textFaint} /> }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarIcon: () => (
              <View style={[styles.addButton, { backgroundColor: colors.accent }]}>
                <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            ),
          }}
          listeners={() => ({
            tabPress: (e: any) => {
              e.preventDefault();
              openAddModal();
            },
          })}
        />
        <Tabs.Screen
          name="tags"
          options={{ tabBarIcon: ({ focused }) => <TabItem focused={focused} icon={Tag} activeBg={colors.accent} inactive={colors.textFaint} /> }}
        />
        <Tabs.Screen
          name="clipboard"
          options={{ tabBarIcon: ({ focused }) => <TabItem focused={focused} icon={ClipboardList} activeBg={colors.accent} inactive={colors.textFaint} /> }}
        />
      </Tabs>

      <AddModal />
    </>
  );
}

const styles = StyleSheet.create({
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 62,
  },
  tabPillActive: { backgroundColor: '#0D9488' },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginTop: -16,
  },
});
