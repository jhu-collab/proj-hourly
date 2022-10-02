import create from "zustand";

// Manages states that involves the ConfirmPopup
// component
export const useStoreConfirmDialog = create((set) => ({
    message: "",
    onSubmit: undefined,
    close: () => set({ onSubmit: undefined }),
  }));

export default useStoreConfirmDialog;