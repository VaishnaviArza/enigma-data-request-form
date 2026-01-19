import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalType } from "../components/Modal/Modal";

interface ModalState {
  isVisible: boolean;
  title: string;
  message?: string;
  modalType: ModalType;
}

const initialState: ModalState = {
  isVisible: false,
  title: "",
  message: "",
  modalType: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal(
      state,
      action: PayloadAction<{
        title: string;
        message?: string;
        modalType: ModalType;
      }>
    ) {
      state.isVisible = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.modalType = action.payload.modalType;
    },
    hideModal(state) {
      state.isVisible = false;
      state.title = "";
      state.message = "";
      state.modalType = null;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export default modalSlice.reducer;
