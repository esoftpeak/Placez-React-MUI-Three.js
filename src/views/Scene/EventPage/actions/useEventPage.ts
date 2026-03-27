import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { placezApi, Scene } from '../../../../api';
import { ReduxState } from '../../../../reducers';
import {  
   Filter,
  shouldFilter,
  DateFilter,
  SceneValueFilter,
  GuestCountFilter,
  SceneCategoryFilter
 } from '../../../../components/MultiFilter/Filters';
import { GetFloorPlans } from '../../../../reducers/floorPlans';
import { SetSceneFilters } from '../../../../reducers/settings';

export default function useEventPage() {
  const dispatch = useDispatch();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
   const [filters, setFilters] = useState<Filter<Scene>[]>([]);
  const filterMap = useSelector(
    (state: ReduxState) => state.settings.sceneFilters ?? {}
  );

  const getScenes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await placezApi.getScenes();
      setScenes(response.parsedBody);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const sceneTypes = useSelector((state: ReduxState) =>
    state.settings.pickLists.find((list) => {
      return list.name === 'SceneType';
    })
  );

  const resetFilters = () => {
    setFilters([
      new DateFilter(),
      new SceneCategoryFilter(sceneTypes),
      new GuestCountFilter(),
      new SceneValueFilter(),
    ]);
  };

  useEffect(() => {
    resetFilters();
  }, [sceneTypes]);

  const filteredScenes = useMemo(() => {
    return scenes
      .filter((scene) => shouldFilter<Scene>(activeFilter, filters, scene))
      .sort((scene1, scene2) => {
        const date1 = new Date(scene1.lastModifiedUtcDateTime);
        const date2 = new Date(scene2.lastModifiedUtcDateTime);
        return date2.getTime() - date1.getTime();
      });
  }, [scenes, activeFilter, filters]);

  
  useEffect(() => {
    void getScenes();
  }, []);

  return {
    filteredScenes,
    isLoading,
    filters,
  };
}
