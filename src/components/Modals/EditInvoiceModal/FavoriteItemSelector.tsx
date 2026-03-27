import { Autocomplete, TextField, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { InvoiceLineItem } from '../../Invoicing/InvoiceLineItemModel';

export interface BaseSelectOption {
  value: string | number;
  label: string;
}

interface FavoriteItemProps {
  options: BaseSelectOption[];
  value: string;
  onChange: (event: any, newValue: BaseSelectOption | string | null) => void;
  onInputChange?: (event: React.SyntheticEvent, newInputValue: string) => void;
  onDelete?: (item: InvoiceLineItem) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const FavoriteItemSelector = ({
  options,
  value,
  onChange,
  onInputChange,
  onDelete,
  label,
  required,
  error,
  helperText,
}: FavoriteItemProps) => {
  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      renderOption={(props, option) => (
        <li {...props} key={typeof option === 'string' ? option : option.value}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <span>{typeof option === 'string' ? option : option.label}</span>
            {onDelete && typeof option !== 'string' && (
              <IconButton
                size="small"
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete({ id: Number(option.value) });
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </li>
      )}
      value={value}
      onChange={onChange}
      onInputChange={onInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="standard"
          error={error}
          helperText={helperText}
          required={required}
        />
      )}
    />
  );
};

export default FavoriteItemSelector;
