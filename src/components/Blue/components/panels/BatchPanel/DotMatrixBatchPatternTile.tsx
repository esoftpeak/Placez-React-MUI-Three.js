import React from "react";
import { Theme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    },
    grid: {
      display: "grid",
      width: "100%",
      height: "100%",
      gridGap: '4px',
      padding: '16px',
      backgroundColor: theme.palette.background.shadow,
    },
    dot: {
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      width: '100%',
      height: '100%',
    },
    empty: {
      // borderRadius: "50%",
      // border: `1px solid ${theme.palette.primary.main}`,
      // width: '100%',
      // height: '100%',
    },
  })
);

type DotMatrixBatchPatternTileProps = {
  pattern: boolean[];
  rowColCount: number;
};

const DotMatrixBatchPatternTile: React.FC<DotMatrixBatchPatternTileProps> = ({ pattern, rowColCount }) => {
  const classes = useStyles();

  const gridTemplate = {
    gridTemplateRows: `repeat(${rowColCount}, 1fr)`,
    gridTemplateColumns: `repeat(${rowColCount}, 1fr)`,
  };

  return (
    <div className={classes.root}>
      <div className={`${classes.grid}`} style={gridTemplate}>
        {pattern.map((isDot, index) => (
          <div
            key={index}
            className={isDot ? classes.dot : classes.empty}
          />
        ))}
      </div>
    </div>
  );
};

export default DotMatrixBatchPatternTile;
