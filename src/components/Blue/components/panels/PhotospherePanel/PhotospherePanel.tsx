import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../../../../../reducers';
import { Vector3, Matrix4, Quaternion } from 'three';
import { Typography, Button, Tooltip, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  HandlesFromBlue,
  ControlsType,
  PhotosphereSetup,
  CameraType,
} from '../../../models';

import panelStyles from '../../../../Styles/panels.css';
import { UpdatePhotosphereSetup } from '../../../../../reducers/globalState';
import {
  SetControlsType,
  SetAutoRotate,
  SetPhotosphere,
  AutoRotatePhotosphereCamera,
  SetCameraType,
  Save,
  FitToView,
} from '../../../../../reducers/blue';

import { ModalConsumer } from '../../../../Modals/ModalContext';
import { Photosphere } from '../../../models/Photosphere';

import LoadImageModal from '../../../../Modals/LoadImageModal';
import { SetFloorPlan } from '../../../../../reducers/designer';
import { GlobalViewState } from '../../../../../models/GlobalState';
import PhotosphereCard from './PhotosphereCard';

const storageName = 'PhotospherePanel';

type Props = {
  handlesFromBlue: HandlesFromBlue;
  setFullScreen?: Function;
};

const PhotospherePanel = (props: Props) => {
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  const globalState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const edit = globalState === GlobalViewState.Fixtures;

  const controlsType = useSelector(
    (state: ReduxState) => state.blue.controlsType
  );
  const autoRotate = useSelector((state: ReduxState) => state.blue.autoRotate);
  const currentFixturePlan = useSelector(
    (state: ReduxState) => state.designer.floorPlan
  );
  const photoSphereSetup = useSelector(
    (state: ReduxState) => state.globalstate.photoSphereSetup
  );

  const [fixturePhotospheres, setFixturePhotospheres] = useState<Photosphere[]>(
    currentFixturePlan?.photoSpheres ?? []
  );

  const [selectedPhotosphereID, setSelectedPhotosphereID] =
    useState<number>(undefined);
  const [moved, setMoved] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');

  useEffect(() => {
    if (!selectedPhotosphereID && fixturePhotospheres.length > 0) {
      onPhotosphere(fixturePhotospheres[0]);
    }
  }, [fixturePhotospheres, selectedPhotosphereID]);

  const handleCreatePhotosphere = (imageUrl: string, name?: string) => {
    const imagePath = imageUrl.slice(imageUrl.search('/Assets'));
    const newPhotosphere = {
      imagePath,
      name: name ?? '',
      id: 0,
    } as Photosphere;
    handleAddPhotosphere(newPhotosphere);
  };

  const handleAddPhotosphere = (photosphere: Photosphere) => {
    const photoSpheres = [...fixturePhotospheres];
    photoSpheres.push(photosphere);
    dispatch(
      SetFloorPlan({
        photoSpheres,
      })
    );
    dispatch(Save());
  };

  const handleUpdatePhotosphere = (photoSphere: Photosphere) => {
    const photoSpheres = [...fixturePhotospheres];
    const newPhotospheres = photoSpheres.filter((returnableSphere) => {
      return returnableSphere.id !== photoSphere.id;
    });
    newPhotospheres.push(photoSphere);
    dispatch(
      SetFloorPlan({
        photoSpheres: newPhotospheres,
      })
    );
  };

  const handleInitPhotosphere = () => {
    dispatch(SetCameraType(CameraType.Orthographic));
    dispatch(SetControlsType(ControlsType.OrthographicControls));
    dispatch(FitToView());
  };

  const onMove = (e) => {
    setMoved(true);
  };

  const onDragPhotosphere = (e, photo) => {
    if (moved && controlsType === ControlsType.OrthographicControls) {
      const coordinates = props.handlesFromBlue.onDragCoordinates(e);
      if (coordinates) {
        coordinates.position.setY(5 * 12 * 2.54);
        const transformation = new Matrix4();
        transformation.setPosition(coordinates.position);
        const scaleMat = new Matrix4();
        const size = props.handlesFromBlue.getCameraFar();
        scaleMat.makeScale(-size, size, size);
        transformation.multiply(scaleMat);
        photo.transformation = transformation.toArray();
        handleUpdatePhotosphere(photo);
        setMoved(false);
        onPhotosphere(photo);
      }
    }
  };

  const onPhotosphere = (photo: Photosphere) => {
    if (!photo) return;
    if (!photo.transformation) {
      handleInitPhotosphere();
      return;
    }
    if (autoRotate) dispatch(SetAutoRotate(false));
    const transformation = new Matrix4().fromArray(photo.transformation);
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    transformation.decompose(position, quaternion, scale);

    dispatch(SetPhotosphere(photo, edit));

    if (photo.direction) {
      const direction = new Vector3().fromArray(photo.direction);
      dispatch(SetCameraType(CameraType.FPVCamera));
      dispatch(SetControlsType(ControlsType.Photosphere, position, direction));
    } else {
      dispatch(SetCameraType(CameraType.FPVCamera));
      dispatch(SetControlsType(ControlsType.Photosphere, position));
    }
    setSelectedPhotosphereID(photo.id);
  };

  const findIndexById = (id: number) => (photosphere: Photosphere) => {
    return photosphere.id === id;
  };

  const saveCurrentPhotosphereMesh = () => {
    if (edit) {
      const sphere = props.handlesFromBlue.getPhotosphere();
      if (sphere.id) {
        handleUpdatePhotosphere(sphere);
        dispatch(Save());
        dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home));
      }
    }
  };

  const onDelete = (sphere: Photosphere) => {
    const photoSpheres = [...fixturePhotospheres];
    const newFixturePhotospheres = photoSpheres.filter((returnableSphere) => {
      return returnableSphere.id !== sphere.id;
    });
    dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home));
    dispatch(SetFloorPlan({ photoSpheres: newFixturePhotospheres }));
    dispatch(Save());
    handleInitPhotosphere();
  };

  const saveSelectedPhotosphere = () => {
    const photosphere = fixturePhotospheres.find(
      (photosphere: Photosphere) => photosphere.id === selectedPhotosphereID
    );

    if (!photosphere || !currentFixturePlan) {
      localStorage.removeItem(storageName);
      return;
    }

    localStorage.setItem(
      storageName,
      JSON.stringify({
        currentFixturePlanId: currentFixturePlan.id,
        selectedPhotosphereId: photosphere.id,
      })
    );
  };

  const saveName = (sphere: Photosphere) => {
    const photoSpheres = fixturePhotospheres.map(
      (photosphsere: Photosphere) => {
        if (photosphsere.id === sphere.id) {
          return {
            ...photosphsere,
            name: newName,
          };
        } else {
          return photosphsere;
        }
      }
    );
    dispatch(SetFloorPlan({ photoSpheres }));
    dispatch(Save());
  };

  useEffect(() => {
    props.handlesFromBlue.drawPhotosphereLocations(fixturePhotospheres);
    dispatch(AutoRotatePhotosphereCamera(false));
    props.setFullScreen(false);
    return () => {
      saveSelectedPhotosphere();
      props.handlesFromBlue.drawPhotosphereLocations([]);
    };
  }, []);

  useEffect(() => {
    const fixturePhotospheres = currentFixturePlan?.photoSpheres ?? [];
    setFixturePhotospheres(fixturePhotospheres);
  }, [currentFixturePlan]);

  useEffect(() => {
    props.handlesFromBlue.drawPhotosphereLocations(fixturePhotospheres);
  }, [fixturePhotospheres]);

  useEffect(() => {
    switch (photoSphereSetup) {
      case PhotosphereSetup.SaveSetup:
        saveCurrentPhotosphereMesh();
        break;
      case PhotosphereSetup.Cancel:
        setFixturePhotospheres(currentFixturePlan?.photoSpheres ?? []);
        dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home));
        const selectedPhotosphere = fixturePhotospheres.find(
          (photoSphere: Photosphere) => photoSphere.id === selectedPhotosphereID
        );
        onPhotosphere(selectedPhotosphere);
        break;

      default:
        break;
    }
  }, [photoSphereSetup]);

  const photoSpherelistItems = fixturePhotospheres
    .sort((a, b) => (a?.name > b?.name ? 1 : -1))
    .map((sphere: Photosphere, index) => (
      <PhotosphereCard
        key={sphere.id}
        sphere={sphere}
        selected={selectedPhotosphereID === sphere.id}
        edit={edit}
        onDragPhotosphere={onDragPhotosphere}
        onMove={onMove}
        photosphereSetup={photoSphereSetup}
        onPhotosphere={onPhotosphere}
        onDelete={onDelete}
        handleUpdatePhotosphere={handleUpdatePhotosphere}
        saveName={saveName}
        setNewName={setNewName}
      />
    ));

  return (
    <div className={classes.root}>
      <div className={classes.panelUpper}>
        {fixturePhotospheres.length === 0 && (
          <Typography className={classes.photosphereName}>
            No Photospheres{' '}
          </Typography>
        )}
      </div>
      <div className={classes.panelLower}>
        <div className={classes.listItemContainer}>{photoSpherelistItems}</div>
      </div>
      <div className={classes.groupContainer}>
        {edit && (
          <ModalConsumer>
            {({ showModal, props }) => (
              <Tooltip title="Set FloorPlan Image">
                <Button
                  className={classes.button}
                  onClick={() =>
                    showModal(LoadImageModal, {
                      ...props,
                      imageLabel: 'Photosphere',
                      handleSetImage: handleCreatePhotosphere,
                      setName: true,
                    })
                  }
                  variant="outlined"
                  classes={{
                    root: classes.button,
                  }}
                >
                  Add Photosphere
                </Button>
              </Tooltip>
            )}
          </ModalConsumer>
        )}
      </div>
    </div>
  );
};

export default PhotospherePanel;
