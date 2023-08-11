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
  hosts: [],
  allDay: false,
  resources: "",
  isCancelled: false,
  setEvent: (event) =>
    set({
      title: event.title || "",
      start: event.start || null,
      end: event.end || null,
      location: event.location || "",
      id: event.id || null,
      recurring: event.recurring || false,
      hosts: event.hosts || [],
      allDay: event.allDay || false,
      resources: event.resources || "",
      isCancelled: event.isCancelled || false,
    }),

  days: "",
  setDays: (days) =>
    set(() => ({
      days: days || "",
    })),
}));

export default useStoreEvent;
