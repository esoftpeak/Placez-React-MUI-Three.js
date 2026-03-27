import React from 'react';
import { ModalConsumer } from './ModalContext';

const ModalInjector = () => (
  <ModalConsumer>
    {({ component: Component, props, hideModal }) =>
      Component ? <Component {...props} onRequestClose={hideModal} /> : null
    }
  </ModalConsumer>
);

export default ModalInjector;
