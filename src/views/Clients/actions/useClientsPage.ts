import { useCallback, useEffect, useMemo, useState } from 'react';
import { Client, placezApi } from '../../../api';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import findInSearchableFeilds from '../../../sharing/utils/findInSearchableFeilds';

export default function useClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const getClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await placezApi.getClients();
      setClients(response.parsedBody);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredClients = useMemo(()=>{
    return clients.filter((client) =>
    findInSearchableFeilds(client, globalFilter)
  );
  }, [clients, globalFilter]);

  useEffect(() => {
    void getClients();
  }, []);

  return {
    filteredClients,
    isLoading,
  };
}
