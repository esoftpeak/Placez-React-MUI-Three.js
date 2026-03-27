import { Theme, Typography } from '@mui/material';
import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ClientTable } from '../../components/Tables';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import { Add } from '@mui/icons-material';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import ClientModal from '../../components/Modals/ClientModal';
import TablePageStyles from '../../components/Styles/TablePageStyles';
import useClientsPage from './actions/useClientsPage';

interface Props {}

const ClientsPage = (props: Props) => {
  const { filteredClients, isLoading } = useClientsPage();
  const styles = makeStyles<Theme>(TablePageStyles);
  const classes = styles(props);

  return (
    <div className={classes.root}>
      <div className={classes.pageTools}>
        <Typography variant="h4" component="h1" style={{ width: '100%' }}>
          {`Clients${filteredClients.length ? ` (${filteredClients.length})` : ''}`}
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
        <ClientTable
          isLoading={isLoading}
          clients={filteredClients}
          height={'calc(100vh - 224px)'}
        />
      </div>
    </div>
  );
};

export default ClientsPage;
