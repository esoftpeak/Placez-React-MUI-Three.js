import {
  ListItemButton,
  ListItemText,
  Theme,
  useTheme,
} from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

interface Props {
  subcategories: any;
  selectedSubcategory: string;
  handleSelect: (id: string) => void;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      ...theme.PlacezBorderStyles,
      padding: '12px',
      height: '100%',
      overflowY: 'auto',
    },
  })
);

const SubcategoryList = (props: Props) => {
  const { subcategories, handleSelect, selectedSubcategory } = props;
  const classes = styles(props);
  const theme = useTheme();

  // Brand color (requested)
  const brandPurple = '#5c236f';

  return (
    <div className={classes.root}>
      {subcategories.map((subcategory: any) => {
        const isSelected = subcategory.name === selectedSubcategory;

        return (
          <ListItemButton
            key={subcategory.name}
            selected={isSelected}
            onClick={() => handleSelect(subcategory.name)}
            sx={{
              border: 'none',
              borderRadius: '10px',
              px: 1.25,
              py: 1,
              mb: 0.5,
              transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
              color: 'text.primary',

              '&:hover': {
                backgroundColor: 'rgba(92, 35, 111, 0.08)',
              },

              ...(isSelected && {
                backgroundColor: 'rgba(92, 35, 111, 0.14) !important',
                '&:hover': {
                  backgroundColor: 'rgba(92, 35, 111, 0.18) !important',
                },

                '&::before': {
                  ...theme.PlacezLeftSelectedIndicator,
                  backgroundColor: `${brandPurple} !important`,
                  borderRadius: '999px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                },

                '& .MuiListItemText-primary': {
                  fontWeight: 700,
                  color: 'text.primary',
                },
              }),

              '& .MuiListItemText-primary': {
                fontSize: 14,
                lineHeight: 1.2,
              },
            }}
          >
            <ListItemText primary={subcategory.name} />
          </ListItemButton>
        );
      })}
    </div>
  );
};

export default SubcategoryList;
