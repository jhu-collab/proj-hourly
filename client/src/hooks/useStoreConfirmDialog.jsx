// import create from "zustand";
// import {useState} from "react";
// // Manages states that involves the ConfirmPopup
// // component
// export function useStoreConfirmDialog () {
//   const [state, setState] = useState({message: "", onSubmit: undefined});
//   // message: "",
//   // onSubmit: undefined,
//   // close: () => set({ onSubmit: undefined }),
//   const open = (message, onSubmit) => {
//     setState({message, onSubmit});
//   };

//   const close = () => {
//     setState({message: "", onSubmit: undefined});
//   }
//   return {message: state.message, onSubmit: state.onSubmit, open, close};
// };

// export default useStoreConfirmDialog;
import create from "zustand";

// Manages states that involves the ConfirmPopup
// component
export const useStoreConfirmDialog = create((set) => ({
  message: "",
  onSubmit: undefined,
  close: () => set({ onSubmit: undefined }),
}));

export default useStoreConfirmDialog;
