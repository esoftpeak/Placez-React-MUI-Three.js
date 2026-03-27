import { createRef, useEffect, useState } from 'react';
import { PhotospherePreview } from '../../../../blue/PhotospherePreview';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { Photosphere } from '../../models/Photosphere';
import { placezApi } from '../../../../api';
import { CircularProgress } from '@mui/material';

interface Props {
  photosphere: Photosphere;
  updatePhotosphere: (sphere: Photosphere) => void;
}

let photosphereRef;

const PhotosphereViewer = (props: Props) => {
  const myRef = createRef<HTMLDivElement>();

  const [spinnerHidden, setSpinnerHidden] = useState<boolean>(false);

  useEffect(() => {
    photosphereRef = new PhotospherePreview(myRef.current, props.photosphere);
    setTimeout(() => {
      setSpinnerHidden(true);
      // tslint:disable-next-line:align
    }, 5000);
    return () => photosphereRef.dispose();
  }, []);

  useEffect(() => {
    if (props.photosphere.direction !== undefined) {
      photosphereRef.pointCamera(
        props.photosphere.direction,
        props.photosphere.transformation
      );
      savePhoto(props.photosphere);
    }
  }, [props.photosphere.direction]);

  const savePhoto = (sphere: Photosphere) => {
    photosphereRef.screenCapture().then((blob) => {
      handleFileSubmit(blob, sphere);
    });
  };

  const handleFileSubmit = (blob: Blob, newPhotosphere: Photosphere) => {
    const formData = new FormData();
    formData.append('file', blob, `${newPhotosphere.name}.png`);

    placezApi.postBlob(formData).then((data) => {
      newPhotosphere.thumbnailPath = `/${data.parsedBody.path}`;
      props.updatePhotosphere(newPhotosphere);
    });
  };

  const classes = styles(props);
  return (
    <div className={classes.root} ref={myRef}>
      {!spinnerHidden && <CircularProgress className={classes.spinner} />}
    </div>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    spinner: {
      position: 'absolute',
      top: '50px',
      left: '45%',
    },
  })
);

export default PhotosphereViewer;
