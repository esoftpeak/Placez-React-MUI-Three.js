import { useEffect, useState } from 'react';

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  Slider,
  Box,
  Typography,
  Button,
} from '@mui/material';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import LargeIconButton from '../ShareModal/LargeIconButton';
import {
  Camera,
  RefreshOutlined,
  Image,
  FileDownloadOutlined,
} from '@mui/icons-material';
import { ReduxState } from '../../../reducers';
import { GlobalViewState, ViewState } from '../../../models/GlobalState';
import {
  Screenshot,
  TakeEquirectangularPhotoAction,
  SetWatermark,
  SetWatermarkOpacity,
  SetWatermarkSize,
} from '../../../reducers/blue';
import { useDispatch, useSelector } from 'react-redux';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import formModalStyles from '../../Styles/FormModal.css';
import LinkCopyButton from '../ShareModal/LinkCopyButton';
import { PhotosphereIcon } from '../../../assets/icons';
import { placezApi } from '../../../api';

enum VirtualCameraModes {
  None = 'none',
  Screenshot = 'screenshot',
  Equirectangular = 'equirectangular',
}

interface Props {
  hideModal: () => void;
}

const useCustomStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    screenshotContainer: {
      display: 'flex',
      gap: '16px !important',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    },
    previewContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
  })
);

const ScreenshotOptions = (props: Props) => {
  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const photosphereLink = useSelector(
    (state: ReduxState) => state.blue.selectedEquirectangularPhotoLink
  );
  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const watermarkUrl = useSelector(
    (state: ReduxState) => state.blue.watermarkUrl
  );
  const watermarkOpacity = useSelector(
    (state: ReduxState) => state.blue.watermarkOpacity
  );
  const watermarkSize = useSelector(
    (state: ReduxState) => state.blue.watermarkSize
  );

  const [download, setDownload] = useState<boolean>(true);
  const [sceneImage, setSetSceneImage] = useState<boolean>(false);
  const [floorplanImage, setFloorplanImage] = useState<boolean>(false);
  const [virtualCameraMode, setVirtualCameraMode] =
    useState<VirtualCameraModes>(VirtualCameraModes.None);
  const [generatingPhotosphereLink, setGeneratingPhotosphereLink] =
    useState<boolean>(false);
  const [uploadingWatermark, setUploadingWatermark] = useState<boolean>(false);
  const styles = makeStyles<Theme>(formModalStyles);
  const customStyles = useCustomStyles();
  const classes = { ...styles(props), ...customStyles };
  const theme = useTheme<Theme>();

  const dispatch = useDispatch();

  useEffect(() => {
    if (
      virtualCameraMode === VirtualCameraModes.Equirectangular &&
      !photosphereLink
    ) {
      getPhotosphere();
    }
  }, [virtualCameraMode]);

  useEffect(() => {
    if (generatingPhotosphereLink) {
      dispatch(TakeEquirectangularPhotoAction());
    }
  }, [generatingPhotosphereLink]);

  useEffect(() => {
    setGeneratingPhotosphereLink(false);
  }, [photosphereLink]);

  const handleScreenshot = (event: any) => {
    setVirtualCameraMode(VirtualCameraModes.None);
    event.preventDefault();
    const { hideModal } = props;

    dispatch(Screenshot(download, sceneImage, floorplanImage));
    hideModal();
  };

  const downloadScreenshot = (event: any) => {
    setVirtualCameraMode(VirtualCameraModes.None);
    event.preventDefault();
    const { hideModal } = props;
    dispatch(Screenshot(true, false, false));
    hideModal();
  };

  const getPhotosphere = () => {
    setGeneratingPhotosphereLink(true);
  };

  const handleWatermarkUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      setUploadingWatermark(true);
      const formData = new FormData();
      formData.append('file', file, file.name);

      placezApi
        .postBlob(formData)
        .then((data) => {
          dispatch(SetWatermark(data.parsedBody.url));
          setUploadingWatermark(false);
        })
        .catch((error) => {
          console.error('Failed to upload watermark:', error);
          setUploadingWatermark(false);
        });
    }
  };

  const handleOpacityChange = (event: Event, newValue: number | number[]) => {
    dispatch(SetWatermarkOpacity(newValue as number));
  };

  const handleSizeChange = (event: Event, newValue: number | number[]) => {
    dispatch(SetWatermarkSize(newValue as number));
  };

  const handleRemoveWatermark = () => {
    dispatch(SetWatermark(''));
  };

  const handleCancelScreenshot = (event: any) => {
    setVirtualCameraMode(VirtualCameraModes.None);
    event.preventDefault();
    const { hideModal } = props;
    hideModal();
  };

  const getPhotosphereLink = (link: string): string => {
    const damUrl = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const photosphereUrl = `${damUrl.replace(/\/$/, '')}/Assets/${link.replace(/^\//, '')}`;
    return `${window.location.origin}/360Viewer.html?src=${photosphereUrl}`;
  };

  const renderContent = () => {
    switch (virtualCameraMode) {
      case VirtualCameraModes.Screenshot:
        return (
          <Box className={classes.screenshotContainer}>
            {/* Left Side - Watermark Preview */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 1,
                boxShadow: 1,
                minWidth: '240px',
              }}
            >
              {watermarkUrl && (
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'text.primary', fontSize: '1.1rem' }}
                >
                  Watermark Preview
                </Typography>
              )}

              {!watermarkUrl ? (
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingWatermark}
                  startIcon={
                    uploadingWatermark ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Image />
                    )
                  }
                  size="small"
                  sx={{ mb: 2 }}
                >
                  {uploadingWatermark ? 'Uploading...' : 'Upload Watermark'}
                  <input
                    type="file"
                    hidden
                    accept="image/png"
                    onChange={handleWatermarkUpload}
                  />
                </Button>
              ) : (
                <Box className={classes.previewContainer}>
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      bgcolor: 'white',
                      boxShadow: 1,
                      width: '200px',
                      height: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={watermarkUrl}
                      alt="Watermark"
                      style={{
                        maxWidth: `${watermarkSize * 100}%`,
                        maxHeight: `${watermarkSize * 100}%`,
                        objectFit: 'contain',
                        opacity: watermarkOpacity,
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  </Box>

                  {/* Remove Button */}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleRemoveWatermark}
                    sx={{ mt: 1, mb: 2, fontSize: '0.75rem' }}
                  >
                    Remove Watermark
                  </Button>
                </Box>
              )}
              {/* Screenshot Button */}
              <Button
                variant="contained"
                onClick={downloadScreenshot}
                startIcon={<FileDownloadOutlined />}
                sx={{
                  minWidth: '140px',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                Screenshot
              </Button>
            </Box>

            {/* Right Side - Controls and Screenshot Button */}
            {virtualCameraMode === VirtualCameraModes.Screenshot &&
              watermarkUrl && (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    minWidth: '225px',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: 'text.primary', fontSize: '1.1rem' }}
                  >
                    Settings
                  </Typography>

                  {watermarkUrl && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        mb: 3,
                      }}
                    >
                      {/* Opacity Slider */}
                      <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1,
                            textAlign: 'center',
                            fontSize: '0.875rem',
                          }}
                        >
                          Opacity: {Math.round(watermarkOpacity * 100)}%
                        </Typography>
                        <Slider
                          value={watermarkOpacity}
                          onChange={handleOpacityChange}
                          min={0}
                          max={1}
                          step={0.01}
                          sx={{
                            '& .MuiSlider-thumb': {
                              bgcolor: theme.palette.primary.main,
                            },
                            '& .MuiSlider-track': {
                              bgcolor: theme.palette.primary.main,
                            },
                          }}
                        />
                      </Box>

                      {/* Size Slider */}
                      <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1,
                            textAlign: 'center',
                            fontSize: '0.875rem',
                          }}
                        >
                          Size: {Math.round(watermarkSize * 100)}%
                        </Typography>
                        <Slider
                          value={watermarkSize}
                          onChange={handleSizeChange}
                          min={0.1}
                          max={1}
                          step={0.05}
                          sx={{
                            '& .MuiSlider-thumb': {
                              bgcolor: theme.palette.primary.main,
                            },
                            '& .MuiSlider-track': {
                              bgcolor: theme.palette.primary.main,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
          </Box>
        );
      case VirtualCameraModes.Equirectangular:
        return (
          <>
            {generatingPhotosphereLink && (
              <LargeIconButton
                label="Generating Photosphere"
                color={theme.palette.secondary.main}
              >
                <CircularProgress variant="indeterminate" color="primary" />
              </LargeIconButton>
            )}
            {photosphereLink !== '' && !generatingPhotosphereLink && (
              <>
                <LargeIconButton
                  label="Refresh Link"
                  onClick={(e) => getPhotosphere()}
                >
                  <RefreshOutlined fontSize="inherit" />
                </LargeIconButton>
                <LargeIconButton
                  label="View Link"
                  color={theme.palette.secondary.main}
                  onClick={() =>
                    window.open(getPhotosphereLink(photosphereLink), '_blank')
                  }
                >
                  <PhotosphereIcon fontSize="inherit" />
                </LargeIconButton>
                <LinkCopyButton
                  label="Copy Link"
                  link={getPhotosphereLink(photosphereLink)}
                />
              </>
            )}
          </>
        );
      case VirtualCameraModes.None:
      default:
        return (
          <>
            <LargeIconButton
              label="Screenshot"
              color={theme.palette.secondary.main}
              onClick={() =>
                setVirtualCameraMode(VirtualCameraModes.Screenshot)
              }
            >
              <Camera fontSize="inherit" />
            </LargeIconButton>
            {globalViewState === GlobalViewState.Layout &&
              (viewState === ViewState.PhotosphereView ||
                viewState === ViewState.StreetView) && (
                <LargeIconButton
                  label="Photosphere"
                  color={theme.palette.secondary.main}
                  onClick={() =>
                    setVirtualCameraMode(VirtualCameraModes.Equirectangular)
                  }
                >
                  <PhotosphereIcon fontSize="inherit" />
                </LargeIconButton>
              )}
          </>
        );
    }
  };

  const renderTitle = () => {
    switch (virtualCameraMode) {
      case VirtualCameraModes.Screenshot:
        return 'Screenshot';
      case VirtualCameraModes.Equirectangular:
        return 'Photosphere';
      default:
        return 'Screenshot Options';
    }
  };

  return (
    <>
      <DialogTitle
        className={classes.dialogTitle}
        id="alert-dialog-slide-title"
      >
        {renderTitle()}
      </DialogTitle>
      <DialogContent className={classes.content}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '350px',
            padding: '20px 0',
          }}
        >
          {renderContent()}
        </div>
      </DialogContent>
      <DialogActions className={classes.actions}>
        {virtualCameraMode !== VirtualCameraModes.None &&
          globalViewState === GlobalViewState.Layout &&
          (viewState === ViewState.PhotosphereView ||
            viewState === ViewState.StreetView) && (
            <PlacezActionButton
              onClick={() => setVirtualCameraMode(VirtualCameraModes.None)}
            >
              Back
            </PlacezActionButton>
          )}
        <PlacezActionButton onClick={(e) => handleCancelScreenshot(e)}>
          Cancel
        </PlacezActionButton>
        {/* {virtualCameraMode === VirtualCameraModes.Screenshot && (
          <PlacezActionButton
            onClick={(e) => handleScreenshot(e)}
          >
            Confirm
          </PlacezActionButton>
        )} */}
      </DialogActions>
    </>
  );
};

export default ScreenshotOptions;
