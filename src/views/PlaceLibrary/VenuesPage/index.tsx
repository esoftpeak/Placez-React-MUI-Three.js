import { Theme, Typography } from '@mui/material';

// Components
import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { PlaceTable } from '../../../components/Tables';

// Util
import PlacezIconButton from '../../../components/PlacezUIComponents/PlacezIconButton';
import { ModalConsumer } from '../../../components/Modals/ModalContext';
import PlaceModal from '../../../components/Modals/PlaceModal';
import TablePageStyles from '../../../components/Styles/TablePageStyles';
import useVenuesPage from './actions/useVenuesPage';

type Props = {};

const Venues = (props: Props) => {
  const styles = makeStyles<Theme>(TablePageStyles);
  const classes = styles(props);
  const { filteredPlaces, isLoading } = useVenuesPage();

  return (
    <div className={classes.root}>
      <div className={classes.pageTools}>
        <Typography variant="h4" component="h1" style={{ width: '100%' }}>
          {`Venues${filteredPlaces.length ? ` (${filteredPlaces.length})` : ''}`}
        </Typography>
        <ModalConsumer>
          {({ showModal, props }) => (
            <Tooltip title="Add Venue">
              <PlacezIconButton
                onClick={() => {
                  showModal(PlaceModal, { ...props });
                }}
              >
                <Add />
              </PlacezIconButton>
            </Tooltip>
          )}
        </ModalConsumer>
      </div>
      <div className={classes.table}>
        <PlaceTable
          isLoading={isLoading}
          places={filteredPlaces}
          height={'calc(100vh - 224px)'}
        />
      </div>
    </div>
  );
};

export default Venues;
