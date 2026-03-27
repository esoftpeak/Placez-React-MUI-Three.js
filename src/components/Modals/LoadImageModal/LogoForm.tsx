import { useState, useEffect } from 'react';

import { Theme, Typography } from '@mui/material';

import { createStyles } from '@mui/styles';

import { CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';

import FileSelector from '../../Utils/FileSelector';
import { placezApi } from '../../../api';
import { Delete, Image } from '@mui/icons-material';
import PlacezIconButton from '../../PlacezUIComponents/PlacezIconButton';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    title: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: '8px',
      fontSize: '24px',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    error: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
    },
    heading: {
      ...theme.typography.h2,
      fontSize: '20px',
      height: '40px',
      backgroundColor: theme.palette.secondary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0px ${theme.spacing(3)}px`,
    },
    content: {
      paddingRight: 0,
      paddingLeft: 0,
    },
    field: {
      minWidth: '40%',
      margin: '10px 24px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '',
    },
    actionButton: {
      margin: '10px',
    },
    container: {
      padding: theme.spacing(),
      textAlign: 'center',
    },
    image: {
      width: '500px',
    },
    imageDetails: {
      display: 'flex',
      justifyContent: 'flex-start',
    },
    logo: {},
    leftColumn: {
      flexDirection: 'column',
      width: '50%',
      padding: theme.spacing(),
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputField: {
      marginBottom: '0px',
    },
    inputCheckField: {
      marginBottom: '-15px',
    },
    logoContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px',
    },
    buttonContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    progressContainer: {
      width: '300px',
      height: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      width: '300px',
      height: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
);

interface Props {
  imageLabel?: string;
  setAName?: boolean;
  handleSetImage: (imageUrl: string, name?: string) => void;
  onClose?: (e?) => void;
  currentImage?: string;
  autoSetImage?: boolean;
  imageTypes?: string;
  defaultImage?: string;
  isFromSettings?: boolean;
}

const LogoForm = (props: Props) => {
  const {
    imageLabel,
    onClose,
    currentImage,
    autoSetImage,
    handleSetImage,
    isFromSettings,
  } = props;

  const [imageUrl, setImageUrl] = useState<string>(currentImage);

  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState(undefined);
  const [name, setName] = useState(undefined);

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

  const classes = styles(props);

  const onClickDelete = () => {
    handleImport('');
    setImageUrl('');
  };
  return (
    <>
      <div className={classes.logoContainer}>
        <Typography variant="body1">Logo Image</Typography>
        <div className={classes.buttonContainer}>
          {currentImage && currentImage !== props.defaultImage && (
            <PlacezIconButton
              className={classes.actionButton}
              classes={{
                root: classes.error,
              }}
              onClick={onClickDelete}
            >
              <Delete />
            </PlacezIconButton>
          )}
          <FileSelector
            customID={`load${imageLabel}Image`}
            handleFileSubmit={handleFileSubmit}
            buttonText={currentImage ? 'Replace Image' : 'Load Image'}
            accept={props.imageTypes ?? 'image/*'}
          />
        </div>
      </div>
      <div
        style={{
          height: isFromSettings ? '128px' : '200px',
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
              width="200px"
              src={previewImage ? previewImage : props.defaultImage}
              alt={'Missing'}
              style={{ padding: '20px' }}
            />
          )}
        {saving && (
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div>
        )}
        {!saving && !currentImage && !imageUrl && !props.defaultImage && (
          <div className={classes.imageContainer}>
            <Image color="secondary" style={{ fontSize: 50 }} />
          </div>
        )}
      </div>
    </>
  );
};

export default LogoForm;
