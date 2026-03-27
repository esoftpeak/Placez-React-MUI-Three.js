import { Theme, Typography } from '@mui/material';
// Icons
import { Add } from '@mui/icons-material';
// Components
import MultiFilter from '../../../components/MultiFilter/MultiFilter';
import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import TablePageStyles from '../../../components/Styles/TablePageStyles';
import PlacezIconButton from '../../../components/PlacezUIComponents/PlacezIconButton';
import { ModalConsumer } from '../../../components/Modals/ModalContext';
import SceneModal from '../../../components/Modals/SceneModal';
import SceneTable from '../../../components/Tables/SceneTable';
import useEventPage from './actions/useEventPage';

interface Props {}

const Scenes = (props: Props) => {
  const styles = makeStyles<Theme>(TablePageStyles);
  const classes = styles(props);
  const { filteredScenes, isLoading, filters } = useEventPage();

  return (
    <div className={classes.root}>
      <div className={classes.pageTools}>
        <Typography variant="h4" component="h1" style={{ width: '100%' }}>
          {`Events${filteredScenes.length ? ` (${filteredScenes.length})` : ''}`}
        </Typography>
        <ModalConsumer>
          {({ showModal, props }) => (
            <Tooltip title="Add Event">
              <PlacezIconButton
                onClick={() => {
                  showModal(SceneModal, { ...props });
                }}
              >
                <Add />
              </PlacezIconButton>
            </Tooltip>
          )}
        </ModalConsumer>
        <MultiFilter
          className={classes.dateSelect}
          filters={filters}
          isFromScene
        />
      </div>

      <div className={classes.table}>
        <SceneTable
          loading={isLoading}
          scenes={filteredScenes}
          height={'calc(100vh - 224px)'}
        />
      </div>
    </div>
  );
};

export default Scenes;
