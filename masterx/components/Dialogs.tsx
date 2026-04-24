// In-app modal dialogs replacing native Alert.alert / Alert.prompt.
// Provides imperative API via useDialogs(): confirm(), prompt(), actionSheet().
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------- Public types ----------

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface PromptOptions {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'url';
  secureTextEntry?: boolean;
  validate?: (value: string) => string | null;
}

export interface ActionSheetItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  items: ActionSheetItem[];
}

export interface DialogsApi {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  prompt: (opts: PromptOptions) => Promise<string | null>;
  actionSheet: (opts: ActionSheetOptions) => Promise<string | null>;
}

const Ctx = createContext<DialogsApi | null>(null);

// ---------- Provider ----------

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
  resolve: (v: boolean) => void;
}
interface PromptState extends PromptOptions {
  visible: boolean;
  resolve: (v: string | null) => void;
}
interface SheetState extends ActionSheetOptions {
  visible: boolean;
  resolve: (v: string | null) => void;
}

export function DialogsProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [promptState, setPromptState] = useState<PromptState | null>(null);
  const [sheetState, setSheetState] = useState<SheetState | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [promptError, setPromptError] = useState<string | null>(null);
  const lastResolveRef = useRef<((v: any) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ ...opts, visible: true, resolve });
    });
  }, []);

  const prompt = useCallback((opts: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptValue(opts.defaultValue ?? '');
      setPromptError(null);
      setPromptState({ ...opts, visible: true, resolve });
    });
  }, []);

  const actionSheet = useCallback((opts: ActionSheetOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setSheetState({ ...opts, visible: true, resolve });
    });
  }, []);

  const closeConfirm = (result: boolean) => {
    if (!confirmState) return;
    confirmState.resolve(result);
    setConfirmState(null);
  };
  const closePrompt = (result: string | null) => {
    if (!promptState) return;
    if (result !== null && promptState.validate) {
      const err = promptState.validate(result);
      if (err) {
        setPromptError(err);
        return;
      }
    }
    promptState.resolve(result);
    setPromptState(null);
  };
  const closeSheet = (result: string | null) => {
    if (!sheetState) return;
    sheetState.resolve(result);
    setSheetState(null);
  };

  // Suppress unused warning
  void lastResolveRef;

  const api = useMemo<DialogsApi>(() => ({ confirm, prompt, actionSheet }), [confirm, prompt, actionSheet]);

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* Confirm modal */}
      <Modal
        visible={!!confirmState?.visible}
        transparent
        animationType="fade"
        onRequestClose={() => closeConfirm(false)}
      >
        <View style={s.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => closeConfirm(false)} />
          <View style={s.dialog}>
            <Text style={s.title}>{confirmState?.title}</Text>
            {confirmState?.message ? <Text style={s.message}>{confirmState.message}</Text> : null}
            <View style={s.btnRow}>
              <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={() => closeConfirm(false)}>
                <Text style={s.btnGhostText}>{confirmState?.cancelLabel ?? 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, confirmState?.destructive ? s.btnDanger : s.btnPrimary]}
                onPress={() => closeConfirm(true)}
              >
                <Text style={s.btnPrimaryText}>{confirmState?.confirmLabel ?? 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prompt modal */}
      <Modal
        visible={!!promptState?.visible}
        transparent
        animationType="fade"
        onRequestClose={() => closePrompt(null)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => closePrompt(null)} />
          <View style={s.dialog}>
            <Text style={s.title}>{promptState?.title}</Text>
            {promptState?.message ? <Text style={s.message}>{promptState.message}</Text> : null}
            <TextInput
              style={[s.input, promptState?.multiline && s.inputMulti]}
              value={promptValue}
              onChangeText={(t) => { setPromptValue(t); if (promptError) setPromptError(null); }}
              placeholder={promptState?.placeholder}
              placeholderTextColor="#9CA3AF"
              autoFocus
              multiline={promptState?.multiline}
              keyboardType={promptState?.keyboardType ?? 'default'}
              secureTextEntry={promptState?.secureTextEntry}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {promptError ? <Text style={s.errorText}>{promptError}</Text> : null}
            <View style={s.btnRow}>
              <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={() => closePrompt(null)}>
                <Text style={s.btnGhostText}>{promptState?.cancelLabel ?? 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={() => closePrompt(promptValue)}>
                <Text style={s.btnPrimaryText}>{promptState?.confirmLabel ?? 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action sheet */}
      <Modal
        visible={!!sheetState?.visible}
        transparent
        animationType="fade"
        onRequestClose={() => closeSheet(null)}
      >
        <View style={s.sheetBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => closeSheet(null)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            {sheetState?.title ? <Text style={s.sheetTitle}>{sheetState.title}</Text> : null}
            {sheetState?.message ? <Text style={s.sheetMessage}>{sheetState.message}</Text> : null}
            <View style={{ marginTop: 4 }}>
              {sheetState?.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    s.sheetItem,
                    idx > 0 && s.sheetItemBorder,
                    item.disabled && { opacity: 0.4 },
                  ]}
                  onPress={() => !item.disabled && closeSheet(item.id)}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                >
                  {item.icon ? <View style={s.sheetIcon}>{item.icon}</View> : null}
                  <Text style={[s.sheetLabel, item.destructive && s.sheetLabelDanger]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.sheetCancel} onPress={() => closeSheet(null)} activeOpacity={0.7}>
              <Text style={s.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Ctx.Provider>
  );
}

export function useDialogs(): DialogsApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDialogs must be used inside DialogsProvider');
  return ctx;
}

const s = StyleSheet.create({
  backdrop:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog:          { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20 },
  title:           { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  message:         { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 4 },
  input:           { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1F2937', marginTop: 14 },
  inputMulti:      { minHeight: 90, textAlignVertical: 'top' },
  errorText:       { fontSize: 12, color: '#EF4444', marginTop: 6 },
  btnRow:          { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btn:             { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, minWidth: 80, alignItems: 'center' },
  btnGhost:        { backgroundColor: '#F3F4F6' },
  btnGhostText:    { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  btnPrimary:      { backgroundColor: '#0D9488' },
  btnDanger:       { backgroundColor: '#EF4444' },
  btnPrimaryText:  { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  sheetBackdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 20, paddingTop: 8 },
  sheetHandle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 8 },
  sheetTitle:      { fontSize: 16, fontWeight: '700', color: '#1F2937', paddingHorizontal: 8, paddingTop: 8 },
  sheetMessage:    { fontSize: 13, color: '#6B7280', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 4 },
  sheetItem:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, gap: 12 },
  sheetItemBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  sheetIcon:       { width: 24, alignItems: 'center', justifyContent: 'center' },
  sheetLabel:      { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  sheetLabelDanger:{ color: '#EF4444' },
  sheetCancel:     { marginTop: 8, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12 },
  sheetCancelText: { fontSize: 15, color: '#1F2937', fontWeight: '600' },
});
