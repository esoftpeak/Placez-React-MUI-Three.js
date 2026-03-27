import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Place, placezApi } from '../../../../api';
import findInSearchableFeilds from '../../../../sharing/utils/findInSearchableFeilds';
import { ReduxState } from '../../../../reducers';

export default function useVenuesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const getPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await placezApi.getPlaces();
      setPlaces(response.parsedBody);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredPlaces = useMemo(()=>{
    return places.filter((place) =>
    findInSearchableFeilds(place, globalFilter)
  );
  }, [places, globalFilter]);

  
  useEffect(() => {
    void getPlaces();
  }, []);

  return {
    filteredPlaces,
    isLoading,
  };
}
