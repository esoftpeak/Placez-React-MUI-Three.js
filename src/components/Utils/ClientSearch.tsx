import { Control, UseFormRegister, UseFormWatch } from "react-hook-form"
import { ControlledPlacezAutocomplete } from "../PlacezUIComponents/PlacezAutoComplete"
import { useSelector } from "react-redux"
import { ReduxState } from "../../reducers"
import { useEffect, useState } from "react"
import { Client } from "../../api"

type NameAndEmailProps = {
  register: UseFormRegister<any>,
  watch: UseFormWatch<any>,
  control: Control<any>,
  onClientSelect: (client: Client) => void,
}



const ClientSearch = (props: NameAndEmailProps) => {
  const { register, watch, control } = props

  const clients = useSelector((state: ReduxState) => state.client.clients);
  const [modifiedClients, setModifiedClients] = useState<Client[]>(clients);

  const clientId = watch('clientId');

  useEffect(() => {
    if (clientId) {
      const client = clients.find((client) => client.id === clientId);
      props.onClientSelect(client);
    }
  }, [clientId]);

  return (
    <ControlledPlacezAutocomplete
      control={control}
      name="clientId"
      label={'Choose Client'}
      options={modifiedClients?.map((client, index) => {
        return {
          label: client.name ?? '',
          value: client.id,
        };
      })}
    />
  )
}

export default ClientSearch
