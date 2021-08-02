import { useCallback, useState } from "react";

const useModal = (
  open = false
): [{ open: boolean; onClose: any }, { closeModal: any; openModal: any }] => {
  const [isOpen, setIsOpen] = useState(open);

  const closeModal = useCallback(() => setIsOpen(false), []);

  const openModal = useCallback(() => setIsOpen(true), []);

  return [
    {
      open: isOpen,
      onClose: closeModal,
    },
    { closeModal, openModal },
  ];
};

export default useModal;
