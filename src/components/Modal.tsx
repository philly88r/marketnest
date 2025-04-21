import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);

  label {
    color: #1a237e;
    font-weight: 600;
    margin-bottom: 6px;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
  }
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        {children}
      </ModalBox>
    </Overlay>
  );
};

export default Modal;
