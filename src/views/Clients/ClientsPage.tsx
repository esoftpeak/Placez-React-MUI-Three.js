import { useDispatch, useSelector } from 'react-redux';

import { Theme, Typography } from '@mui/material';

// Components
import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ClientTable } from '../../components/Tables';

// Models
import { getClientById } from '../../reducers/client';

// Util
import findInSearchableFeilds from '../../sharing/utils/findInSearchableFeilds';
import { ReduxState } from '../../reducers';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import { Add } from '@mui/icons-material';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import ClientModal from '../../components/Modals/ClientModal';
import TablePageStyles from '../../components/Styles/TablePageStyles';

interface Props { }

const ClientsPage = (props: Props) => {
  const dispatch = useDispatch();

  const styles = makeStyles<Theme>(TablePageStyles);
  const classes = styles(props);

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  // unique to this page
  const clients = useSelector((state: ReduxState) => state.client.clients);
  const selectedId = useSelector(
    (state: ReduxState) => state.client.selectedId
  );

  const client = useSelector((state: ReduxState) =>
    getClientById(clients, selectedId ?? 0)
  );

  const filteredClients = clients.filter((client) =>
    findInSearchableFeilds(client, globalFilter)
  );

  return (
    <div className={classes.root}>
      <div className={classes.pageTools}>
        <Typography variant="h4" component="h1" style={{ width: '100%' }}>
          Clients
        </Typography>
        <ModalConsumer>
          {({ showModal, props }) => (
            <Tooltip title="Add Client">
              <PlacezIconButton
                onClick={() => {
                  showModal(ClientModal, { ...props });
                }}
              >
                <Add />
              </PlacezIconButton>
            </Tooltip>
          )}
        </ModalConsumer>
      </div>
      <div className={classes.table}>
        <ClientTable clients={filteredClients} height={'calc(100vh - 224px)'} />
      </div>
    </div>
  );
};

export default ClientsPage;
