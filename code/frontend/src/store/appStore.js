import create from 'zustand';

export const useStore = create((set) => ({
    createPopup: false,
    createPopupOpen: () => set({ createPopup: true }),
    createPopupClose: () => set({createPopup: false }),
  }));

