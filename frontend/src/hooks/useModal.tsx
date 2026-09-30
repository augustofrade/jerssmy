import { useState } from "preact/hooks";
type UseModalProps = {
  onCancel?: () => void;
};

export function useModal(props: UseModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    props.onCancel?.();
    setIsOpen(false);
  }

  return {
    isOpen,
    openModal,
    closeModal
  };
}