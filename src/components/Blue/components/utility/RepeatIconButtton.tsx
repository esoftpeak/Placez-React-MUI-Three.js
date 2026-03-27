import { useEffect, useRef, ReactNode } from 'react';
import { IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';

interface RepeatIconButtonProps {
  onRepeat: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}

const useStyles = makeStyles({
  iconButton: {
    // add your styles here
  },
});

const RepeatIconButton: React.FC<RepeatIconButtonProps> = ({
  onRepeat,
  label,
  children,
  className,
}) => {
  const classes = useStyles();
  const intervalRef = useRef<number | null>(null);

  const handleMouseDown = () => {
    intervalRef.current = window.setInterval(() => onRepeat(), 100); // Adjust interval to your needs
  };

  const handleMouseUp = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <IconButton
      className={className || classes.iconButton}
      aria-label={label}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp}
      onClick={onRepeat}
    >
      {children}
    </IconButton>
  );
};

export default RepeatIconButton;
