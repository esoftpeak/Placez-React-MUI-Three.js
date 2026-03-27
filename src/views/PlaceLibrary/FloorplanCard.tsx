import { createStyles, makeStyles } from '@mui/styles';
import PlacezFixturePlan from '../../api/placez/models/PlacezFixturePlan';
import { Box, Theme, Tooltip, Typography } from '@mui/material';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import FloorplanModal from '../../components/Modals/FloorplanModal';
import { CopyAll, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import { placeRoutes } from '../../routes';
import { useNavigate } from 'react-router';
import { UniversalModalWrapper } from '../../components/Modals/UniversalModalWrapper';
import { Send3DIcon } from '../../assets/icons';
import { billingRate } from '../../blue/core/utils';
import { CopyFloorPlan, DeleteFloorPlan } from '../../reducers/floorPlans';
import { useDispatch } from 'react-redux';
import AssetModifierHelper from '../../blue/itemModifiers/AssetModifierHelper';
import { AreYouSureDelete } from '../../components/Modals/UniversalModal';

interface Props {
  floorplan: PlacezFixturePlan;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      border: `1px solid ${theme.palette.primary.main}`,
      padding: '12px',
      borderRadius: '5px'
    },
    title: {
      ...theme.typography.h5,
      fontSize: 18,
      fontWeight: 'bold',
    },
    venueCard: {
      display: 'flex',
      alignItems: 'center',
      height: '90px',
      padding: '28px',
      justifyContent: 'space-between',
      backgroundColor: theme.palette.background.paper,
    },
  })
);

const FloorplanCard = (props: Props) => {
  const { floorplan } = props;
  const classes = styles(props);
  const navigate = useNavigate();

  const goToSpecificFloor = (placeId: number, floorPlanId: string) =>
    navigate(
      placeRoutes.editFloorPlan.path
        .replace(':id', placeId.toString())
        .replace(':floorPlanId', floorPlanId.toString())
    );

  const dispatch = useDispatch();

  const resetIdsForFloorPlan = (
    floorPlan: PlacezFixturePlan
  ): PlacezFixturePlan => {
    const EmptyGuid = '00000000-0000-0000-0000-000000000000';

    return {
      ...floorPlan,
      id: EmptyGuid,
      walls: floorPlan.walls.map((wall) => ({
        ...wall,
        id: 0,
        floorPlanId: null,
        frontMaterial: wall.frontMaterial
          ? { ...wall.frontMaterial, id: EmptyGuid }
          : null,
        backMaterial: wall.backMaterial
          ? { ...wall.backMaterial, id: EmptyGuid }
          : null,
      })),
      fixtures: floorPlan.fixtures?.map((item) => ({
        ...item,
        id: 0,
        floorPlanId: null,
        modifiers: AssetModifierHelper.clearAllModifierFields(item.modifiers),
        materialMask: item.materialMask?.map((material) =>
          material
            ? {
                ...material,
                id: EmptyGuid,
                mediaAssetId: null,
                placedAssetId: null,
                organizationId: null,
              }
            : null
        ),
      })),
      photoSpheres: floorPlan.photoSpheres?.map((photoSphere) => ({
        ...photoSphere,
        id: 0,
        floorPlanId: null,
      })),
      cameraState: floorPlan.cameraState
        ? {
            ...floorPlan.cameraState,
            id: 0,
            floorPlanId: null,
            orthographicState: floorPlan.cameraState.orthographicState
              ? {
                  ...floorPlan.cameraState.orthographicState,
                  id: 0,
                  cameraStateId: 0,
                }
              : undefined,
            perspectiveState: floorPlan.cameraState.perspectiveState
              ? {
                  ...floorPlan.cameraState.perspectiveState,
                  id: 0,
                  cameraStateId: 0,
                }
              : undefined,
          }
        : undefined,
      floorplanLabels: floorPlan.floorplanLabels?.map((floorplanLabel) => ({
        ...floorplanLabel,
        id: EmptyGuid,
        floorPlanId: null,
      })),
      dimensions: floorPlan.dimensions?.map((dimensions) => ({
        ...dimensions,
        id: 0,
        floorPlanId: null,
      })),
    };
  };

  const onCopy = (floorPlan) => {
    const floorPlanCopy = resetIdsForFloorPlan({
      ...floorPlan,
      name: `${floorPlan.name} - Copy`,
    });
    dispatch(CopyFloorPlan(floorPlanCopy));
  };

  const onDelete = () => {
    dispatch(DeleteFloorPlan(props.floorplan.id));
  };

  return (
    <div
      className={classes.root}
      // onClick={(e) => goToSpecificFloor(floorplan.placeId, floorplan.id)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>{floorplan.name}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ModalConsumer>
            {({ showModal, props }) => (
              <Tooltip title="Edit Details">
                <PlacezIconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    showModal(FloorplanModal, { ...props, floorplan });
                  }}
                >
                  <EditOutlined />
                </PlacezIconButton>
              </Tooltip>
            )}
          </ModalConsumer>
          <PlacezIconButton onClick={(e) => onCopy(props.floorplan)}>
            <CopyAll />
          </PlacezIconButton>
          <UniversalModalWrapper
            onDelete={() => onDelete()}
            modalHeader="Are you sure?"
          >
            <Tooltip title="Delete Floorplan">
              <PlacezIconButton>
                <DeleteOutlined />
              </PlacezIconButton>
            </Tooltip>
            {AreYouSureDelete('a Floorplan')}
          </UniversalModalWrapper>
          <UniversalModalWrapper
            modalHeader="Floorplan and Fixture Editor"
            onContinue={() => {
              goToSpecificFloor(floorplan.placeId, floorplan.id);
            }}
          >
            <PlacezIconButton>
              <Send3DIcon />
            </PlacezIconButton>
            {`Are you sure you want to edit the floorplan and room fixtures?
              Floorplan changes will apply to any existing and future subevents using this floorplan.`}
          </UniversalModalWrapper>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        <PropertyDisplay label="Name" value={floorplan.name} />
        {/*<PropertyDisplay label="Capacity" value="TODO" />*/}
        <PropertyDisplay
          label="Rate"
          value={
            billingRate.find(
              (rate) => rate.value === floorplan.priceRateInHours
            )?.label ?? ''
          }
        />
        <PropertyDisplay label="Price" value={floorplan.price} />
      </div>
    </div>
  );
};

export default FloorplanCard;

const PropertyDisplay = (props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1">{props.label}</Typography>
      <Typography variant="caption">{props.value}</Typography>
    </Box>
  );
};
