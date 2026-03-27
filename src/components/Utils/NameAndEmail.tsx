import { Control, UseFormGetValues, UseFormRegister, UseFormWatch } from "react-hook-form"
import { ControlledPlacezAutocomplete } from "../PlacezUIComponents/PlacezAutoComplete"
import PlacezTextField from "../PlacezUIComponents/PlacezTextField"
import { useSelector } from "react-redux"
import { ReduxState } from "../../reducers"
import { useEffect, useState } from "react"
import { Client } from "../../api"

type NameAndEmailProps = {
  register: UseFormRegister<any>,
  watch: UseFormWatch<any>,
  control: Control<any>,
  getValues: UseFormGetValues<any>,
  onClientSelect: (client: Client) => void,
}



const NameAndEmail = (props: NameAndEmailProps) => {
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
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        height: '170px',
      }}
    >
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
      {/* <PlacezTextField
        required
        type="number"
        id="standard-required"
        label="Number of Payments"
        value={numberOfPayments}
        onChange={handleInput(setNumberOfPayments)}
      /> */}
      Or
      <PlacezTextField
        {...register('payor', {
          required: 'Name is required',
        })}
        required
        id="standard-required"
        label="Payor Name"
        InputLabelProps={{ shrink: !!watch('payor') }}
      />
      <PlacezTextField
        required
        {...register('payorEmail', {
          pattern: {
            value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: 'Invalid Email',
          },
          required: 'Email is required',
        })}
        type="email"
        id="standard-required"
        label="Payor Email"
        InputLabelProps={{ shrink: !!watch('payorEmail') }}
      />
    </form>
  )
}

export default NameAndEmail
