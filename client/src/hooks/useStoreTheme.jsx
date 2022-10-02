import create from "zustand";
import { persist } from "zustand/middleware";

// Manages states that involve theme control
export const useStoreTheme = create(
    persist(
      (set) => ({
        colorScheme: "light",
        toggleColorScheme: (value) =>
          set((state) => ({
            colorScheme:
              value || (state.colorScheme === "dark" ? "light" : "dark"),
          })),
      }),
      {
        name: "theme",
        getStorage: () => localStorage,
        partialize: (state) => ({ colorScheme: state.colorScheme }),
      }
    )
  );

export default useStoreTheme;