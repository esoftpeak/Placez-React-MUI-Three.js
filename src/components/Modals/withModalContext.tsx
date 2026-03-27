import React from 'react';
import ModalContext, { ModalConsumer } from './ModalContext';

export default function withModalContext(Component: any) {
  return (props: any) => (
    <ModalConsumer>
      {(modalContext: any) => (
        <Component {...props} modalContext={modalContext} />
      )}
    </ModalConsumer>
  );
}

export interface WithModalContext {
  modalContext: ModalContext;
}
