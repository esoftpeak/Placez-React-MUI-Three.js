import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import {
  Checkbox,
  CircularProgress,
  DialogTitle,
  FormControlLabel,
  Theme,
  useTheme,
} from '@mui/material';

import { DialogActions, DialogContent, Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { placezApi, SharedUser } from '../../../api';
import { ShareMode } from './ShareMode';
import { ExportDesign } from '../../../reducers/designer';
import { GetLayoutChatSessions } from '../../../reducers/chat';
import { SimpleModalProps } from '../SimpleModal';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import LargeIconButton from './LargeIconButton';
import { RefreshOutlined } from '@mui/icons-material';
import LinkCopyButton from './LinkCopyButton';
import { OpenARIcon, Send3DIcon } from '../../../assets/icons';
import { exportInProgress, ExportStatus } from '../../Blue/models';
import { useForm } from 'react-hook-form';
import ShareLayoutForm from './ShareLayoutForm';
import formStyles from '../../Styles/formStyles.css';
import { addWeeks } from 'date-fns';

type Props = SimpleModalProps & {
  title: string;
  layoutId: string;
  generateAR: () => void;
};

const ShareModal = (props: Props) => {
  const [shareMode, setShareMode] = useState(ShareMode.None);
  const [
    sendUpdateNotificationsToTokenCreator,
    setSendUpdateNotificationsToTokenCreator,
  ] = useState(false);

  const [users, setUsers] = useState([
    {
      email: '',
      name: '',
      expirationUtcDateTime: addWeeks(new Date(), 1),
      guestAccess: [],
    },
  ]);

  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  const otherStyles = makeStyles<Theme>(formStyles);
  const formClasses = otherStyles(props);

  const exportStatus = useSelector(
    (state: ReduxState) => state.designer.exportStatus
  );
  const exportPath = useSelector(
    (state: ReduxState) => state.designer.exportPath
  );

  useEffect(() => {
    setShareMode(ShareMode.None);
  }, [props.open]);

  const onShare = () => {
    const { layoutId, setOpen } = props;
    const expirationUtcDateTime = new Date();
    expirationUtcDateTime.setFullYear(expirationUtcDateTime.getFullYear() + 1);
    const values = getValues();
    const users = [
      {
        expirationUtcDateTime: expirationUtcDateTime,
        ...values,
      },
    ];
    switch (shareMode) {
      case ShareMode.OpenAR:
        window.open(getARLink(exportPath));
        break;
      case ShareMode.ShareAR:
        // placezApi.shareAR({
        //   layoutId: this.props.layoutId,
        //   email: this.state.email,
        //   name: this.state.name,
        // });
        break;
      case ShareMode.Share3D:
        placezApi
          .shareLayout({
            layoutId,
            users,
            sendUpdateNotificationsToTokenCreator, // TODO
          })
          .then((response) => {
            if (response && response.ok) {
              dispatch(GetLayoutChatSessions(layoutId));
            }
          });
        break;
      default:
        break;
    }
    setOpen(false);
    reset();
  };

  const handleSwitchMode = (shareMode: ShareMode) => {
    setShareMode(shareMode);
  };

  const switchUpdateNotifications = (e, checked) => {
    setSendUpdateNotificationsToTokenCreator(checked);
  };

  const handleExport = (e) => {
    const { generateAR } = props;
    dispatch(ExportDesign());
    generateAR?.();
    handleSwitchMode(ShareMode.ShareAR);
  };

  const handleSendAR = (e) => {
    if (exportStatus === ExportStatus.Uploaded) {
      handleSwitchMode(ShareMode.ShareAR);
    } else {
      handleExport(e);
    }
  };

  const getARLink = (link) => {
    const damUrl = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const fullArUrl = `${damUrl.replace(/\/$/, '')}/${link.replace(/^\//, '')}`;
    const usdzLink = fullArUrl.replace('gltf', 'usdz').replace('glb', 'usdz');
    return `${window.location.origin}/ar.html?src=${fullArUrl}&ios-src=${usdzLink}`;
  };

  const theme = useTheme<Theme>();

  const renderTitle = () => {
    switch (shareMode) {
      case ShareMode.ShareAR:
        return 'AR';
      case ShareMode.Share3D:
        return 'Share Layout';
      case ShareMode.None:
      default:
        return 'Share';
    }
  };

  const handleClose = () => {
    const { setOpen } = props;
    setOpen(false);
    setShareMode(ShareMode.None);
    reset();
  };

  const SharedUserHookForm = useForm<SharedUser>({
    mode: 'onSubmit',
    defaultValues: {
      guestAccess: [],
      expirationUtcDateTime: addWeeks(new Date(), 1),
    },
  });

  const {
    getValues,
    formState: { isValid },
    reset,
  } = SharedUserHookForm;

  const renderContent = () => {
    const { name, email, guestAccess, expirationUtcDateTime } = users[0];
    switch (shareMode) {
      case ShareMode.ShareAR:
        return (
          <>
            {exportStatus === ExportStatus.Uploading && (
              <LargeIconButton
                label="Generating Layout"
                color={theme.palette.secondary.main}
              >
                <CircularProgress variant="indeterminate" color="primary" />
              </LargeIconButton>
            )}
            {exportStatus === ExportStatus.Uploaded && (
              <>
                <LargeIconButton
                  label="Refresh Link"
                  color={theme.palette.secondary.main}
                  onClick={handleExport}
                >
                  <RefreshOutlined fontSize="inherit" />
                </LargeIconButton>
                <LargeIconButton
                  label="View Link"
                  color={theme.palette.secondary.main}
                  onClick={() => window.open(getARLink(exportPath), '_blank')}
                >
                  <OpenARIcon fontSize="inherit" />
                </LargeIconButton>
                <LinkCopyButton
                  label="Copy Link"
                  link={getARLink(exportPath)}
                />
              </>
            )}
          </>
        );
      case ShareMode.Share3D:
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              className={classes.formTwoColGrid}
              style={{ maxHeight: '150px', paddingBottom: '0px' }}
            >
              <ShareLayoutForm hookForm={SharedUserHookForm} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendUpdateNotificationsToTokenCreator}
                    onChange={switchUpdateNotifications}
                    value={sendUpdateNotificationsToTokenCreator}
                  />
                }
                label="Notify Me of Client Changes"
              />
            </div>
          </div>
        );
      case ShareMode.None:
      default:
        return (
          <>
            <LargeIconButton
              label="Mixed Reality"
              onClick={handleSendAR}
              color={theme.palette.secondary.main}
              loading={exportInProgress(exportStatus)}
            >
              <OpenARIcon fontSize="inherit" />
            </LargeIconButton>
            <LargeIconButton
              label="Layout"
              onClick={() => {
                (window as any).gtag('event', 'share_3d');
                handleSwitchMode(ShareMode.Share3D);
              }}
              color={theme.palette.secondary.main}
            >
              <Send3DIcon fontSize="inherit" />
            </LargeIconButton>
          </>
        );
    }
  };

  return (
    <Dialog fullWidth maxWidth="md" open={props.open}>
      <DialogTitle className={classes.dialogTitle} position="static">
        {renderTitle()}
      </DialogTitle>
      <DialogContent className={classes.content}>
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px' }}
        >
          {renderContent()}
        </div>
      </DialogContent>

      <DialogActions className={classes.actions}>
        {shareMode !== ShareMode.None && (
          <PlacezActionButton onClick={() => setShareMode(ShareMode.None)}>
            Back
          </PlacezActionButton>
        )}
        <PlacezActionButton onClick={handleClose}>Cancel</PlacezActionButton>
        {shareMode === ShareMode.Share3D && (
          <PlacezActionButton
            disabled={!isValid}
            className={classes.button}
            color="primary"
            onClick={onShare}
          >
            Send
          </PlacezActionButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
