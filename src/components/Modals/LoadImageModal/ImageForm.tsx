import { useState, useEffect } from 'react';

import { Theme } from '@mui/material';


import {
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import FileSelector from '../../Utils/FileSelector';
import { placezApi } from '../../../api';
import { Image } from '@mui/icons-material';
import formModalStyles from '../../Styles/FormModal.css'
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton'

interface Props {
  imageLabel?: string;
  setAName?: boolean;
  handleSetImage: (imageUrl: string, name?: string) => void;
  onClose?: (e?) => void;
  currentImage?: string;
  autoSetImage?: boolean;
  imageTypes?: string;
  defaultImage?: string;
}

const ImageForm = (props: Props) => {
  const { imageLabel, onClose, currentImage, autoSetImage, handleSetImage } =
    props;

  const [imageUrl, setImageUrl] = useState<string>(currentImage);

  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState(null);
  const [name, setName] = useState(null);

  const handleImport = (imageUrl?: string) => () => {
    if (props.handleSetImage !== undefined)
      props.handleSetImage(imageUrl, name);
    if (props.onClose !== undefined) {
      props.onClose();
    }
  };

  useEffect(() => {
    if (autoSetImage) {
      if (props.handleSetImage !== undefined) props.handleSetImage(imageUrl);
    }
  }, [autoSetImage, imageUrl]);

  useEffect(() => {
    if (saving) {
      placezApi.postBlob(formData).then((data) => {
        setImageUrl(data.parsedBody.url);
        setSaving(false);
      });
    }
  }, [saving, formData]);

  const handleFileSubmit = (files: FileList) => {
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);
    setFormData(formData);
    setSaving(true);
  };

  const previewImage = imageUrl ?? currentImage;

  const styles = makeStyles<Theme>(formModalStyles)
  const classes = styles(props);

  return (
    <>
      {imageLabel && (
        <DialogTitle className={classes.dialogTitle}>
          {imageLabel} Preview
        </DialogTitle>
      )}
      <DialogContent
        style={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!saving &&
          ((previewImage && previewImage !== '') || props.defaultImage) && (
            <img
              width="100%"
              src={previewImage ? previewImage : props.defaultImage}
              alt={'Missing'}
            />
          )}
        {saving && (
          <div
            style={{
              width: '300px',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </div>
        )}
        {!saving && !currentImage && !imageUrl && !props.defaultImage && (
          <div
            style={{
              width: '300px',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image color="secondary" style={{ fontSize: 50 }} />
          </div>
        )}
        {props.setAName && imageUrl && (
          <Input
            placeholder="Label Photo"
            id="adornment-password"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            style={{
              margin: '10px',
            }}
          />
        )}
      </DialogContent>

      {handleSetImage !== undefined && (
        <DialogActions className={classes.dialogActions}>
          {onClose !== undefined && (
            <PlacezActionButton
              onClick={onClose}
            >
              Cancel
            </PlacezActionButton>
          )}
          <FileSelector
            customID={`load${imageLabel}Image`}
            handleFileSubmit={handleFileSubmit}
            buttonText={currentImage ? 'Replace Image' : 'Load Image'}
            accept={props.imageTypes ?? 'image/*'}
          />
          {currentImage && currentImage !== props.defaultImage && (
            <PlacezActionButton
              classes={{
                root: classes.error,
              }}
              onClick={() => {
                handleImport('');
                setImageUrl('');
              }}
              color='error'
            >
              Remove Image
            </PlacezActionButton>
          )}
          {!autoSetImage && (
            <PlacezActionButton
              disabled={imageUrl === undefined}
              onClick={handleImport(imageUrl)}
            >
              Save
            </PlacezActionButton>
          )}
        </DialogActions>
      )}
    </>
  );
};

export default ImageForm;
