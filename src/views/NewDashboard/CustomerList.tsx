import { Typography, useTheme } from '@mui/material';
import { Scene } from '../../api';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { getClientById } from '../../reducers/client';

interface CustomerListProps {
  scenes: Scene[];
}

const CustomerList = (props: CustomerListProps) => {
  const theme = useTheme();
  const clientIds = props.scenes.map((scene: Scene) => scene.clientId);
  const tallies: { [clientId: string]: { count: number; client } } = {};
  const clients = useSelector((state: ReduxState) => state.client.clients);
  const clientTallies = clientIds.reduce((clientTallies, clientId) => {
    if (!tallies[clientId]) {
      tallies[clientId] = {
        count: 0,
        client: getClientById(clients, clientId),
      };
    }
    tallies[clientId].count += 1;
    tallies[clientId].client = getClientById(clients, clientId);
    return clientTallies;
  }, tallies);
  const clientList = Object.values(clientTallies)
    .filter((clientTally) => clientTally.client)
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ ...theme.PlacezBorderStyles }}>
      <Typography variant="h6">Customer List</Typography>
      {clientList.length > 0 &&
        Object.values(clientList).map((clientTally) => {
          return (
            <div key={clientTally.client.id}>
              <div>{clientTally.client?.name}</div>
              <div>{clientTally.count}</div>
            </div>
          );
        })}
    </div>
  );
};

export default CustomerList;
