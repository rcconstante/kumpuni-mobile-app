import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { ASSET_ICONS, EMOJI_LIST, LUCIDE_ICONS } from '@/components/iconCatalog';
import type { IconKind } from '@/db/types';

type IconTabType = 'assets' | 'emoji' | 'lucide';

export interface SelectedIcon {
  kind: IconKind;
  value: string;
  color: string;
}

interface IconPickerModalProps {
  visible: boolean;
  initialIcon: SelectedIcon;
  onClose: () => void;
  onSave: (icon: SelectedIcon) => void;
  title?: string;
}

export function IconPickerModal({
  visible,
  initialIcon,
  onClose,
  onSave,
  title = 'Choose Icon',
}: IconPickerModalProps) {
  const { isDark, colors } = useTheme();
  const ms = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [iconTab, setIconTab] = useState<IconTabType>('assets');
  const [selected, setSelected] = useState<SelectedIcon>(initialIcon);
  const [photoUri, setPhotoUri] = useState<string | null>(
    initialIcon.kind === 'photo' ? initialIcon.value : null
  );

  const isSelected = (kind: IconKind, value: string) =>
    selected.kind === kind && selected.value === value;

  useEffect(() => {
    if (!visible) return;
    setSelected(initialIcon);
    setPhotoUri(initialIcon.kind === 'photo' ? initialIcon.value : null);
    setIconTab('assets');
  }, [initialIcon, visible]);

  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        setSelected({ kind: 'photo', value: uri, color: '#F3F4F6' });
      }
    } catch {
      // silent fail
    }
  };

  const handleSave = () => {
    onSave(selected);
    // reset state for next open
    setIconTab('assets');
    setPhotoUri(null);
  };

  const handleClose = () => {
    onClose();
    // reset to initial for next open
    setSelected(initialIcon);
    setPhotoUri(initialIcon.kind === 'photo' ? initialIcon.value : null);
    setIconTab('assets');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={ms.overlay}>
        <TouchableOpacity style={ms.backdrop} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={ms.kv}
        >
          <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
            <View style={[ms.handle, { backgroundColor: colors.border }]} />

            <View style={ms.sheetHeader}>
              <Text style={[ms.sheetTitle, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity onPress={handleClose} style={ms.closeBtn}>
                <X size={20} color={colors.textFaint} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={ms.scrollArea}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={ms.formContent}
            >
              <View style={ms.iconTabRow}>
                {(['assets', 'emoji', 'lucide'] as IconTabType[]).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[ms.iconTabBtn, iconTab === tab && ms.iconTabBtnActive]}
                    onPress={() => setIconTab(tab)}
                  >
                    <Text style={[ms.iconTabText, iconTab === tab && ms.iconTabTextActive]}>
                      {tab === 'assets' ? 'Images' : tab === 'emoji' ? 'Emoji' : 'Icons'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {iconTab === 'assets' && (
                <View style={ms.iconGrid}>
                  {ASSET_ICONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        ms.iconOpt,
                        { backgroundColor: opt.color },
                        isSelected('asset', opt.id) && ms.iconOptSelected,
                      ]}
                      onPress={() => setSelected({ kind: 'asset', value: opt.id, color: opt.color })}
                    >
                      <Image source={opt.image} style={ms.iconOptImg} resizeMode="contain" />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[
                      ms.iconOpt,
                      ms.uploadOpt,
                      selected.kind === 'photo' && ms.iconOptSelected,
                    ]}
                    onPress={pickPhoto}
                  >
                    {photoUri ? (
                      <Image
                        source={{ uri: photoUri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <>
                        <Camera size={24} color="#9CA3AF" />
                        <Text style={ms.uploadText}>Upload</Text>
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
                      style={[ms.emojiOpt, isSelected('emoji', em) && ms.emojiOptSelected]}
                      onPress={() => setSelected({ kind: 'emoji', value: em, color: '#F0FDFA' })}
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
                      style={[ms.lucideOpt, isSelected('lucide', id) && ms.lucideOptSelected]}
                      onPress={() => setSelected({ kind: 'lucide', value: id, color: '#F0FDFA' })}
                    >
                      <Icon
                        size={22}
                        color={isSelected('lucide', id) ? colors.accent : colors.textMuted}
                      />
                      <Text
                        style={[
                          ms.lucideLabel,
                          isSelected('lucide', id) && ms.lucideLabelActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ height: 16 }} />
            </ScrollView>

            <TouchableOpacity style={ms.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={ms.saveBtnText}>Save Icon</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    overlay:     { flex: 1, justifyContent: 'flex-end' },
    backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)' },
    kv:          { flex: 1, justifyContent: 'flex-end' },
    sheet:       { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Platform.OS === 'ios' ? 36 : 20, maxHeight: '85%' },
    scrollArea:  { flexGrow: 0 },
    handle:      { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
    sheetTitle:  { fontSize: 18, fontWeight: '700', color: colors.text },
    closeBtn:    { padding: 6 },
    formContent: { paddingHorizontal: 20, paddingBottom: 8 },
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
    saveBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  });
}
