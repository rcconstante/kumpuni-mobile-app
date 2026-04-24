// Tiny UI controller so any screen can open the AddModal with a preset URL/tab.
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface AddModalIntent {
  tab?: 'link' | 'collection';
  presetUrl?: string;
  presetCollectionId?: string | null;
  // Optional: clipboard entry id to mark saved on success.
  clipboardEntryId?: string;
}

interface UiContextValue {
  addModalVisible: boolean;
  addModalIntent: AddModalIntent | null;
  openAddModal: (intent?: AddModalIntent) => void;
  closeAddModal: () => void;
}

const Ctx = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [intent, setIntent] = useState<AddModalIntent | null>(null);
  const [visible, setVisible] = useState(false);

  const openAddModal = useCallback((next?: AddModalIntent) => {
    setIntent(next ?? null);
    setVisible(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setVisible(false);
    setIntent(null);
  }, []);

  return (
    <Ctx.Provider value={{ addModalVisible: visible, addModalIntent: intent, openAddModal, closeAddModal }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUi(): UiContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUi must be used inside UiProvider');
  return ctx;
}
