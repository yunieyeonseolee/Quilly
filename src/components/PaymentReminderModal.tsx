import React from 'react';
import { Modal } from 'react-native';
import { PaymentReminderPage } from './PaymentReminderPage';

type PaymentReminderModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export const PaymentReminderModal = ({ isVisible, onClose }: PaymentReminderModalProps) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <PaymentReminderPage onClose={onClose} />
    </Modal>
  );
};