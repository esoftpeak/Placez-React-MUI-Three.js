import { useEffect, useRef } from 'react';

const usePreviousState = (value) => {
  const currentRef = useRef(value);
  const previousRef = useRef();

  useEffect(() => {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }, [value]);

  return previousRef.current;
};

export default usePreviousState;
