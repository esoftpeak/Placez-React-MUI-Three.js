import React from 'react';
import { GridCellProps } from '@progress/kendo-react-grid';
import { Checkbox } from '@mui/material';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';


const CheckboxCell = (props: GridCellProps) => {
  return (
    <td>
      <Checkbox
        color="primary"
        icon={<CheckBoxOutlineBlank fontSize="small" />}
        checkedIcon={<CheckBox fontSize="small" />}
      />
    </td>
  );

}

export default CheckboxCell;
