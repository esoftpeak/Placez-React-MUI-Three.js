import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

import { ModalConsumer } from '../../../../Modals/ModalContext';
import { HandlesFromBlue } from '../../../models';
import { FloorPlanBar } from '../../bars';
import { ReduxState } from '../../../../../reducers';
import FloorPlanWallScaleModal from '../../../../Modals/FloorPlanWallScaleModal';
import LoadImageModal from '../../../../Modals/LoadImageModal';
import { getFloorPlansByPlaceId } from '../../../../../reducers/floorPlans';

type Props = {
  designerCallbacks?: HandlesFromBlue;
};

const FloorPlanUI = (props: Props) => {
  const params = useParams();
  const placeId = params.id;

  const floorplans = useSelector((state: ReduxState) =>
    getFloorPlansByPlaceId(state, parseInt(placeId))
  );

  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    setActivePlan(floorplans[0]);
  }, []);

  const handleSetFloorPlanImage = (imageURL) => {
    props.designerCallbacks?.onLoadFloorplanImg(imageURL);
  };

  const handleSetWallSettings = (wallSettings: {
    hideWalls: boolean;
    wallHeight: number;
  }) => {
    props.designerCallbacks?.setWallSettings(wallSettings);
  };

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <ModalConsumer>
        {({ showModal }) => (
          <FloorPlanBar
            handleSetFloorPlanImage={handleSetFloorPlanImage}
            onDeleteAllClick={props.designerCallbacks?.deleteFloorplan}
            onSetFloorPlanImageClick={() =>
              showModal(LoadImageModal, {
                ...props,
                imageLabel: 'Floor Plan Image',
                handleSetImage: handleSetFloorPlanImage,
                currentImage: activePlan?.floorplanImageUrl,
              })
            }
            onSetWallSettings={() =>
              showModal(FloorPlanWallScaleModal, {
                ...props,
                wallHeight: activePlan?.wallHeight,
                hideWalls: activePlan?.hideWalls,
                handleSetWallSettings,
              })
            }
          />
        )}
      </ModalConsumer>
    </div>
  );
};

export default FloorPlanUI;
