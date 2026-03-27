import { useState, useEffect } from 'react';
import withModalContext, { WithModalContext } from '../withModalContext';
import { DialogActions, DialogContent, DialogTitle, Theme } from '@mui/material';

import { Button, CircularProgress, Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';
import FileSelector from '../../Utils/FileSelector';
import { placezApi } from '../../../api';
import { useDispatch, useSelector } from 'react-redux';
import { Save } from '../../../reducers/blue';
import { ReduxState } from '../../../reducers';
import { SetFloorPlan } from '../../../reducers/designer';
import { SceneScan } from '../../../blue/items/sceneScan';
import { Matrix4 } from 'three';
import formModalStyles from '../../Styles/FormModal.css'

interface Props extends WithModalContext {
  onClose;
}

const ScanModal = (props: Props) => {
  const [fileName, setFileName] = useState('');

  const [scanUrl, setScanUrl] = useState<string>(undefined);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState(undefined);

  const currentScan = useSelector(
    (state: ReduxState) => state.designer.floorPlan?.sceneScans?.[0]
  );

  useEffect(() => {
    setFileName(currentScan?.name);
  }, [currentScan]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (saving) {
      placezApi.postBlob(formData).then((data) => {
        console.log('data', data);
        setScanUrl(data.parsedBody.url);
        setSaving(false);
      });
    }
  }, [saving, formData]);

  const handleFileSubmit = (files: FileList) => {
    const formData = new FormData();
    const trimmedFileName = files[0].name.split('.')[0];
    setFileName(trimmedFileName);
    formData.append('file', files[0], files[0].name);

    setFormData(formData);
    setSaving(true);
  };

  const handleImport = (scanUrl?) => {
    if (scanUrl) {
      const sceneScan: SceneScan = {
        transformation: new Matrix4().toArray(),
        sceneScanUrl: scanUrl,
        name: fileName,
      };
      dispatch(
        SetFloorPlan({
          sceneScans: [sceneScan],
        })
      );
    } else {
      dispatch(
        SetFloorPlan({
          sceneScans: [],
        })
      );
    }
    dispatch(Save());
    props.modalContext.hideModal();
  };

  const handleSetScan = () => {
    console.log('handlesetscanx');
  };

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  return (
    <Dialog
      open={true}
      keepMounted
      maxWidth="sm"
      fullWidth={true}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle className={classes.dialogTitle}>Scene Scan Preview</DialogTitle>
        <DialogContent className={classes.dialogContent}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px'
            }}>
              {!saving && fileName && fileName !== '' && <div>{fileName}</div>}
              {saving && <CircularProgress />}
              <FileSelector
                customID={'load Room Sacan'}
                handleFileSubmit={handleFileSubmit}
                accept=".gltf, .glb"
              />
            </div>
        </DialogContent>
        {handleSetScan !== undefined && (
          <DialogActions className={classes.dialogActions}>
            <Button
              className={classes.actionButton}
              variant="contained"
              classes={{
                root: classes.error,
              }}
              onClick={props.modalContext.hideModal}
            >
              Cancel
            </Button>
            {currentScan !== undefined && (
              <Button
                className={classes.actionButton}
                variant="contained"
                classes={{
                  root: classes.error,
                }}
                onClick={() => {
                  handleImport();
                }}
              >
                Remove Scan
              </Button>
            )}
            <Button
              className={classes.actionButton}
              variant="contained"
              color="primary"
              disabled={scanUrl === undefined}
              onClick={() => handleImport(scanUrl)}
            >
              Save
            </Button>
          </DialogActions>
        )}
    </Dialog>
  );
};

export default withModalContext(ScanModal);
