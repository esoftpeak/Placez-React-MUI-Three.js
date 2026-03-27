import React, {
  ComponentType,
  createContext,
  useState,
  useCallback,
  ReactNode
} from 'react';

export default interface ModalContext {
  component: ComponentType<any> | null;
  props: any | {};
  showModal: (component: (props: any) => JSX.Element, props: any) => void;
  hideModal: () => void;
}

const defaultValue: ModalContext = {
  component: null,
  props: {},
  showModal: () => {},
  hideModal: () => {},
};

const ModalContext = createContext<ModalContext>(defaultValue);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    component: ComponentType<any> | null;
    props: any | {};
  }>({
    component: null,
    props: {},
  });

  const showModal = useCallback((component: ComponentType<any>, props: any = {}) => {
    setModalState({
      component,
      props,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState({
      component: null,
      props: {},
    });
  }, []);

  const value = {
    component: modalState.component,
    props: modalState.props,
    showModal,
    hideModal,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const ModalConsumer = ModalContext.Consumer;
export const useModal = () => React.useContext(ModalContext);
