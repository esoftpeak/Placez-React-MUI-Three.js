import { useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

import type { Libraries } from '@react-google-maps/api';

const apiLibraries: Libraries = ['core', 'geometry', 'maps', 'places'];

/**
 * For use in components that require Google Maps API integration. Ensures that the proper scripts are loaded.
 */
export function useGoogleMapsApi() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
    id: 'google-maps-script',
    language: 'en',
    libraries: apiLibraries,
    region: 'us',
  });

  const apiHookValue = useMemo(
    () => ({
      apiLoaded: isLoaded,
      apiError: loadError,
    }),
    [isLoaded, loadError]
  );

  return apiHookValue;
}
