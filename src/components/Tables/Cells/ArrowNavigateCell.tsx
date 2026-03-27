import { KeyboardArrowRight } from '@mui/icons-material';
import { GridCellProps } from '@progress/kendo-react-grid';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { SetGlobalFilter } from '../../../reducers/settings';

interface CustomCellProps extends GridCellProps {
  path: string;
  onClick?: Function;
}

const ArrowNavigateCell = (props: CustomCellProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <td>
      <KeyboardArrowRight
        style={{ float: 'right' }}
        onClick={() => {
          props.onClick?.();
          navigate(props.path);
          dispatch(SetGlobalFilter(''));
        }}
      />
    </td>
  );
};

export default ArrowNavigateCell;
