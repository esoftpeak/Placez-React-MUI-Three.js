import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Theme, Typography, useTheme } from '@mui/material';

// Icons
import { Add } from '@mui/icons-material';

// Components
import MultiFilter from '../../components/MultiFilter/MultiFilter';

// Filters
import {
  Filter,
  shouldFilter,
  DateFilter,
  SceneValueFilter,
  GuestCountFilter,
  SceneCategoryFilter,
} from '../../components/MultiFilter/Filters';

// Models
import { Scene } from '../../api';

// Util
import { ReduxState } from '../../reducers';
import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { GetFloorPlans } from '../../reducers/floorPlans';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../components/Hooks/useLocalStorageState';
import TablePageStyles from '../../components/Styles/TablePageStyles';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import SceneModal from '../../components/Modals/SceneModal';
import { getScenes } from '../../reducers/scenes';
import SceneTable from '../../components/Tables/SceneTable';
import { SetSceneFilters } from '../../reducers/settings';

interface Props {}

enum tabValue {
  upcoming = 'upcoming',
  complete = 'complete',
  all = 'all',
}

const Scenes = (props: Props) => {
  const dispatch = useDispatch();

  const theme: Theme = useTheme();
  const styles = makeStyles<Theme>(TablePageStyles);
  const classes = styles(props);

  const [filters, setFilters] = useState<Filter<Scene>[]>([]);
  const filterMap = useSelector(
    (state: ReduxState) => state.settings.sceneFilters ?? {}
  );
  const selectedId = useSelector(
    (state: ReduxState) => state.scenes.selectedId
  );

  useEffect(() => {
    resetFilters();
    dispatch(GetFloorPlans());
    const localFilter = localStorage.getItem('sceneFilters');
    if (localFilter) {
      const filterData = JSON.parse(localFilter);
      setFilters(filterData);
      dispatch(SetSceneFilters(filterData));
    } else {
      dispatch(SetSceneFilters({}));
    }
  }, []);

  const activeFilter = useMemo(() => {
    const localFilter = localStorage.getItem('sceneFilters');
    if (localFilter) {
      return JSON.parse(localFilter);
    }
    return filterMap;
  }, [filterMap]);

  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [completionFilter, setCompletionFilter] =
    useLocalStorageState<tabValue>(
      LocalStorageKey.SceneViewSelection,
      tabValue.upcoming
    );

  const scenes = useSelector(getScenes);
  // const globalFilter = useSelector(
  //   (state: ReduxState) => state.settings.globalFilter
  // );

  const sceneTypes = useSelector((state: ReduxState) =>
    state.settings.pickLists?.find((list) => {
      return list.name === 'SceneType';
    })
  );

  const resetFilters = () => {
    const nextFilters: Filter<Scene>[] = [new DateFilter()];

    if (sceneTypes) {
      nextFilters.push(new SceneCategoryFilter(sceneTypes as any));
    }

    nextFilters.push(new GuestCountFilter(), new SceneValueFilter());

    setFilters(nextFilters);
  };

  useEffect(() => {
    resetFilters();
  }, [sceneTypes]);

  const filteredScenes = scenes
    // .filter((scene) =>
    //   globalFilter ? findInSearchableFeilds(scene, globalFilter) : true
    // )
    .filter((scene) => shouldFilter<Scene>(activeFilter, filters, scene))
    // .filter(scene => {
    //   const date = new Date(scene.startUtcDateTime);
    //   const currentDate = new Date();
    //   if (date > currentDate && completionFilter === tabValue.upcoming) {
    //     return true;
    //   }
    //   if (date < currentDate && completionFilter === tabValue.complete) {
    //     return true;
    //   }
    //   if (completionFilter === tabValue.all) {
    //     return true;
    //   }
    //   return false;
    // })
    .sort((scene1, scene2) => {
      const date1 = new Date(scene1.lastModifiedUtcDateTime);
      const date2 = new Date(scene2.lastModifiedUtcDateTime);
      return date2.getTime() - date1.getTime();
    });

  return (
    <div className={classes.root}>
      <div className={classes.pageTools}>
        <Typography variant="h4" component="h1" style={{ width: '100%' }}>
          Events
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
          scenes={filteredScenes}
          showFilters={showFilters}
          height={'calc(100vh - 224px)'}
        />
      </div>
    </div>
  );
};

export default Scenes;
