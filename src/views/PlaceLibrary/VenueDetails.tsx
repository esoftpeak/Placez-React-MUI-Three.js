import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { useParams } from 'react-router';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  Tab,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DeletePlace, placeById } from '../../reducers/place';

import PlaceModal from '../../components/Modals/PlaceModal';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import {
  Add,
  DeleteOutlined,
  EditOutlined,
  Image,
  PrintOutlined,
} from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useEffect, useRef, useState } from 'react';
import {
  GetFloorPlans,
  getFloorPlansByPlaceId,
} from '../../reducers/floorPlans';
import FloorplanCard from './FloorplanCard';
import FloorplanModal from '../../components/Modals/FloorplanModal';
import DetailViewStyles from '../../components/Styles/DetailViewStyles.css';
import ReactToPrint from 'react-to-print';
import { formatAddress } from '../../components/Tables/Cells/AddressCell';
import { UniversalModalWrapper } from '../../components/Modals/UniversalModalWrapper';
import { AreYouSureDelete } from '../../components/Modals/UniversalModal';

type Props = {};

type TabValues = 'Floorplan';

const VenueDetails = (props: Props) => {
  const styles = makeStyles<Theme>(DetailViewStyles);
  const classes = styles(props);
  const { id } = useParams();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(GetFloorPlans());
  }, []);

  const place = useSelector((state: ReduxState) =>
    placeById(state, parseInt(id))
  );
  const fixturePlans = useSelector((state: ReduxState) =>
    getFloorPlansByPlaceId(state, place?.id)
  );

  const [tabValue, setTabValue] = useState<TabValues>('Floorplan');

  const [selectedFixturePlanId, setSelectedFixturePlanId] = useState<
    string | null
  >(null);
  const selectedFixturePlan = fixturePlans.find(
    (fixturePlan) => fixturePlan.id === selectedFixturePlanId
  );

  const handleChange = (event: React.SyntheticEvent, newValue: TabValues) => {
    setTabValue(newValue);
  };

  const thumbnailRef = useRef(null);

  const onDelete = () => {
    dispatch(DeletePlace(place.id));
  };

  useEffect(() => {
    setSelectedFixturePlanId(
      fixturePlans[0]?.id === selectedFixturePlanId ? null : fixturePlans[0]?.id
    );
  }, []);

  return (
    <div className={classes.root}>
      <Box className={classes.topIconBar}>
        <ModalConsumer>
          {({ showModal, props }) => (
            <Tooltip title="Edit Venue">
              <PlacezIconButton
                onClick={() => {
                  showModal(PlaceModal, { ...props, place });
                }}
              >
                <EditOutlined />
              </PlacezIconButton>
            </Tooltip>
          )}
        </ModalConsumer>
        <UniversalModalWrapper
          onDelete={() => onDelete()}
          modalHeader="Are you sure?"
        >
          <Tooltip title="Delete Venue">
            <PlacezIconButton>
              <DeleteOutlined />
            </PlacezIconButton>
          </Tooltip>
          {AreYouSureDelete('a Venue')}
        </UniversalModalWrapper>
      </Box>
      <Box className={classes.venueCardHeader}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">{place?.name}</Typography>
          <Typography variant="body1">ID: {place?.id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">Event Total</Typography>
          <Typography variant="body1">{place?.cost}</Typography>
        </Box>
      </Box>
      {place && (
        <Box className={classes.venueCard}>
          <PropertyDisplay label="Name" value={place.name} />
          <PropertyDisplay label="Primary Contact" value={place.contact} />
          <PropertyDisplay
            label="Address"
            value={formatAddress(place.address)}
          />
          <PropertyDisplay label="Capacity" value={place.capacity} />
          <PropertyDisplay label="VenuType" value={place.type} />
        </Box>
      )}

      <div className={classes.detailGrid}>
        <div className={classes.gridColumn}>
          <div className={classes.detailColumnHeader}>
            <div>Floorplans</div>
            <ModalConsumer>
              {({ showModal, props }) => (
                <Tooltip title="Add Floorplan">
                  <IconButton
                    onClick={() => {
                      showModal(FloorplanModal, {
                        ...props,
                        floorplan: {
                          placeId: id,
                        },
                      });
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              )}
            </ModalConsumer>
          </div>
          <List className={classes.tabPanel}>
            {fixturePlans.map((fixturePlan) => (
              <ListItemButton
                style={{ padding: '0px', margin: '10px 0px' }}
                disableGutters
                selected={selectedFixturePlanId === fixturePlan.id}
                onClick={(e) => {
                  setSelectedFixturePlanId(
                    fixturePlan.id === selectedFixturePlanId
                      ? null
                      : fixturePlan.id
                  );
                  e.stopPropagation();
                }}
              >
                <FloorplanCard key={fixturePlan.id} floorplan={fixturePlan} />
              </ListItemButton>
            ))}
          </List>
        </div>
        <div className={classes.gridColumn}>
          <TabContext value={tabValue}>
            <div className={classes.detailColumnHeader}>
              <TabList onChange={handleChange}>
                <Tab
                  className={classes.tabIcon}
                  aria-label="Settings"
                  value={'Floorplan'}
                  label="Floorplan"
                />
              </TabList>
              {tabValue === 'Floorplan' && (
                <div className={classes.tabPanelActions}>
                  <ReactToPrint
                    trigger={() => (
                      <PlacezIconButton
                        onClick={() =>
                          (window as any).gtag('event', 'print-notes')
                        }
                      >
                        <PrintOutlined />
                      </PlacezIconButton>
                    )}
                    content={() => thumbnailRef.current}
                  />
                </div>
              )}
            </div>
            <TabPanel value="Floorplan" className={classes.tabPanel}>
              <div
                ref={thumbnailRef}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: selectedFixturePlan?.thumbnailUrl ? 1 : 0.5,
                  height: '100%',
                  width: '100%', // Ensure the div occupies the full space
                  backgroundImage: `url(${selectedFixturePlan?.thumbnailUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                {!selectedFixturePlan?.thumbnailUrl && (
                  <Image style={{ fontSize: 300 }} />
                )}
              </div>
            </TabPanel>
          </TabContext>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;

const PropertyDisplay = (props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1">{props.label}</Typography>
      <Typography variant="caption">{props.value}</Typography>
    </Box>
  );
};
