import { createStyles, Theme, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRef } from 'react';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton'

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      marginBottom: 24,
    },
  })
);

interface Props {
  handleFileSubmit: Function;
  accept: string; // ".xls,.xlsx" or "image/*" or "video/*"
  customID: string;
  disabled?: boolean;
  buttonText?: string;
  optionButton?: React.ReactNode; // The option button as a React node
  isInsidePrint?: boolean;
}

const FileSelector = (props: Props) => {
  const classes = styles(props);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (selectorFiles: FileList) => {
    props.handleFileSubmit(selectorFiles);
    if (fileInputRef.current && props.isInsidePrint) {
      const form = document.createElement('form');
      const parentNode = fileInputRef.current.parentNode;
      parentNode.insertBefore(form, fileInputRef.current);
      form.appendChild(fileInputRef.current);
      form.reset();
      parentNode.insertBefore(fileInputRef.current, form);
      parentNode.removeChild(form);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        id={props.customID}
        type="file"
        onChange={(e) => handleChange(e.target.files)}
        accept={props.accept}
      />
      {props.optionButton ? (
        <IconButton
          onClick={handleButtonClick}
          disabled={props.disabled}
          component="span" // Render the IconButton as a span to prevent default button styles
        >
          {props.optionButton}
        </IconButton>
      ) : (
        <PlacezActionButton
          onClick={handleButtonClick}
          disabled={props.disabled}
        >
          {props.buttonText ?? 'Upload File'}
        </PlacezActionButton>
      )}
    </>
  );
};

export default FileSelector;
