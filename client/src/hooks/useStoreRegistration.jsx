import create from "zustand";

// Manages states that involves the currently
// selected event
export const useStoreRegistration = create((set) => ({
  id: null,
  setEvent: (event) =>
    set({
      id: event.id || null,
    }),
}));

export default useStoreRegistration;
