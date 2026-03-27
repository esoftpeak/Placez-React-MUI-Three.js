import { GridFilterCellProps } from '@progress/kendo-react-grid';
import { DropdownFilterCell } from './DropdownFilterCell';
import SceneStatus from '../../../api/placez/selects/SceneStatus';

const StatusFilterCell: any = (props: GridFilterCellProps) => {
  const statuses = Object.keys(SceneStatus).slice(
    Object.keys(SceneStatus).length / 2
  );
  return (
    <DropdownFilterCell
      {...props}
      data={statuses}
      defaultItem={'Select Status'}
    />
  );
};

export default StatusFilterCell;
