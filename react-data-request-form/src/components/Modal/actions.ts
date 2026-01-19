export const SHOW_MODAL = "SHOW_MODAL";
export const HIDE_MODAL = "HIDE_MODAL";

export const showModal = (
  title: string,
  message: string,
  modalType: "error" | "success" | "warning"
) => ({
  type: SHOW_MODAL,
  payload: { title, message, modalType },
});

export const hideModal = () => ({
  type: HIDE_MODAL,
});
