

import { GridFilterCellProps } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { MenuItem, Select } from '@mui/material';
import { SyntheticEvent } from 'react';

interface DropdownFilterCellProps extends GridFilterCellProps {
  defaultItem: string;
  data: string[];
}

export const DropdownFilterCell = (props: DropdownFilterCellProps) => {
  let hasValue: any = (value) => Boolean(value && value !== props.defaultItem);

  const onChange = (event, value) => {
    hasValue = hasValue(event.target.value);
    props.onChange({
      value: hasValue ? event.target.value : '',
      operator: hasValue ? 'eq' : '',
      syntheticEvent: event as SyntheticEvent,
    });
  };

  const onClearButtonClick = (event) => {
    event.preventDefault();
    props.onChange({
      value: '',
      operator: '',
      syntheticEvent: event,
    });
  };
  return (
    <div className="k-filtercell">
      {/* <DropDownList
          data={props.data}
          onChange={onChange}
          value={props.value || props.defaultItem}
          defaultItem={props.defaultItem}
            /> */}
      <Select value={props.value || props.defaultItem} onChange={onChange}>
        {props.data.map((item, index) => (
          <MenuItem value={item}>{item}</MenuItem>
        ))}
      </Select>
      <Button
        title="Clear"
        disabled={!hasValue(props.value)}
        onClick={onClearButtonClick}
        icon="filter-clear"
      />
    </div>
  );
};
