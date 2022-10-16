import create from "zustand";
import { persist } from "zustand/middleware";

export const useStoreToken = create(
  persist(
    (set) => ({
      token: "",
      updateToken: (value) => {
        set({ token: value });
      },
    }),
    {
      name: "auth",
      getStorage: () => localStorage,
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);

export default useStoreToken;
