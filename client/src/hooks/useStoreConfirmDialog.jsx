import create from "zustand";

export const useStoreConfirmDialog = create((set) => ({
  message: "",
  onSubmit: undefined,
  close: () => set({ onSubmit: undefined }),
}));

export default useStoreConfirmDialog;
