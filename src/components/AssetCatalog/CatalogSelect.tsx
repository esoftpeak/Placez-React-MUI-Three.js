import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
} from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { Catalog } from '../../models';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { userIsInRole } from '../../sharing/utils/userHelpers';

interface Props {
  catalogsById: { [catalogId: string]: Catalog };
  selectedId: string;
  onCardClick: (id: string) => void;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {},
  })
);

const reorderCatalogsByOwnVsNot = function (catalogsById, user) {
  const catalogs = [] as Catalog[];
  Object.keys(catalogsById).map((catalogId: string) => {
    catalogs.push(catalogsById[catalogId]);
  });
  const own = catalogs.filter((catalog) => {
    return catalog.owned;
  });
  const notOwned = catalogs.filter((catalog) => {
    return !catalog.owned;
  });

  if (userIsInRole(user, 'admin')) {
    return [
      ...own.sort((a, b) => a.sortOrder - b.sortOrder),
      ...notOwned.sort((a, b) => a.sortOrder - b.sortOrder),
    ];
  } else {
    return [...own.sort((a, b) => a.sortOrder - b.sortOrder)];
  }
};

const CatalogSelect = (props: Props) => {
  const { catalogsById, onCardClick, selectedId } = props;
  const user = useSelector((state: ReduxState) => state.oidc.user);

  const reorderedCatatlogs = reorderCatalogsByOwnVsNot(catalogsById, user);
  const classes = styles(props);

  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel shrink={true} id="demo-simple-select-standard-label">
        Model Library
      </InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={selectedId}
        defaultValue={selectedId}
        onChange={(e) => onCardClick(e.target.value)}
        label="Model Library"
        displayEmpty={false}
        sx={{
          '&:before': {
            borderBottom: 'none',
          },
          '&:after': {
            borderBottom: 'none',
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: 'none', 
          },
        }}
      >
        {reorderedCatatlogs.map((catalog: Catalog, index) => (
          <MenuItem value={catalog.id} key={catalog.id}>
            {catalog.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CatalogSelect;
