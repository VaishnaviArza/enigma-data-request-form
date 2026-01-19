import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { hideModal } from "../../redux/modalSlice";
import { RootState } from "../../redux/store";

export type ModalType = "error" | "success" | "loading" | null;

interface ModalComponentProps {
  show?: boolean;            // <-- NEW: local controlled mode
  onHide?: () => void;       // <-- NEW: local controlled mode
  title?: string;            // <-- NEW: local controlled mode
  children?: React.ReactNode;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  show,
  onHide,
  title,
  children,
}) => {
  // Redux modal state (for alerts)
  const reduxModal = useSelector((state: RootState) => state.modal);
  const dispatch = useDispatch();

  // Use Redux modal if "show" is not provided
  const visible = show !== undefined ? show : reduxModal.isVisible;
  const modalTitle = title || reduxModal.title;
  const modalType = reduxModal.modalType;
  const modalMessage = reduxModal.message;

  const handleClose =
    onHide ||
    (() => {
      dispatch(hideModal());
    });

  const getHeaderStyle = () => {
    switch (modalType) {
      case "error":
        return { backgroundColor: "red", color: "white" };
      case "success":
        return { backgroundColor: "green", color: "white" };
      case "loading":
        return { backgroundColor: "orange", color: "white" };
      default:
        return {};
    }
  };

  return (
    <Modal show={visible} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton style={getHeaderStyle()}>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children || modalMessage}</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComponent;
