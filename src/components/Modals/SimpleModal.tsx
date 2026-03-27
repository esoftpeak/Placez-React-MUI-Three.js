import React, { PropsWithChildren, useState } from 'react';

interface Props {
  disabled?: boolean;
}

export interface SimpleModalProps {
  open?: boolean;
  setOpen?: (value: boolean) => void;
}

export const SimpleModal = (props: PropsWithChildren<Props>) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={(e) => {
          if (props?.disabled) return;
          setOpen(true);
        }}
      >
        {props.children[0]}
      </div>
      {React.cloneElement(props.children[1], { open: open, setOpen: setOpen })}
    </>
  );
};
