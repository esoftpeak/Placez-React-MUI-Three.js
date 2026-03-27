// import { LocalizationProvider } from "@mui/x-date-pickers"
// import { GridFilterCellProps } from "@progress/kendo-react-grid"

// const DateRangeFilterCell: any = (props: GridFilterCellProps) => (
//   <DropdownFilterCell
//     {...props}
//     data={categories}
//     defaultItem={"Select category"}
//   />
// );

import { GridFilterCellProps } from '@progress/kendo-react-grid';
import { useEffect, useState } from 'react';

const DateRangeFilterCell: any = (props: GridFilterCellProps) => {
  const [dateRange, setDateRange] = useState(null);

  const inRange = (current, { min, max }) =>
    (min === null || current >= min) && (max === null || current <= max);

  useEffect(() => {
    if (dateRange) {
      // props.onChange({
      //   value: { min: dateRange, max: maxTextBox.value },
      //   operator: inRange,
      //   syntheticEvent: event.syntheticEvent,
      // });
    }
  }, [dateRange]);

  const onClearButtonClick = (event) => {
    event.preventDefault();
    props.onChange({
      value: null,
      operator: '',
      syntheticEvent: event,
    });
  };
  return (
    <div>
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button k-button-md k-rounded-md k-button-solid k-button-solid-base-icon k-clear-button-visible"
        title="Clear"
        disabled={!dateRange}
        onClick={onClearButtonClick}
      >
        <span className="k-icon k-i-filter-clear" />
      </button>
    </div>
  );
};

export default DateRangeFilterCell;
