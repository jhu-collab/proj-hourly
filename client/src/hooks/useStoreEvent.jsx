import create from "zustand";

// Manages states that involves the currently
// selected event
export const useStoreEvent = create((set) => ({
  title: "",
  start: null,
  end: null,
  location: "",
  id: null,
  recurring: false,
  setEvent: (event) =>
    set({
      title: event.title || "",
      start: event.start || null,
      end: event.end || null,
      location: event.location || "",
      id: event.id || null,
      recurring: event.recurring || false,
    }),

  days: "",
  setDays: (days) =>
    set(() => ({
      days: days || "",
    })),
}));

export default useStoreEvent;
