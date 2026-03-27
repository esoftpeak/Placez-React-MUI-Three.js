import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Theme, useTheme } from '@mui/material';

import { Apps, ViewList } from '@mui/icons-material';
import { Slide, Typography, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';

// Models
import { ReduxState } from '../../reducers';
import { PlacezLayoutPlan } from '../../api';
import { GetTemplates } from '../../reducers/layouts';
import formStyles from '../Styles/formStyles.css';
import { DefaultPlacezLayoutPlan } from '../../api/placez/models/PlacezLayoutPlan';
import TemplateTable from '../Tables/TemplateTable';
import PlacezIconButton from '../PlacezUIComponents/PlacezIconButton';
import PlacezGridButton from '../PlacezUIComponents/PlacezGridButton';

interface Props {
  layout?: PlacezLayoutPlan;
  onChange?: (scene: PlacezLayoutPlan) => void;
  selected?: PlacezLayoutPlan;
}

const ChoseTemplate = (props: Props) => {
  const isFirstRender = useRef(true);
  const styles = makeStyles<Theme>(formStyles);
  const classes = styles(props);

  const { selected } = props;

  const templates = useSelector((state: ReduxState) => state.layouts.templates);

  const [detail, setDetail] = useState<PlacezLayoutPlan>(
    props.layout ?? DefaultPlacezLayoutPlan
  );
  const [useGrid, setUseGrid] = useState<boolean>(false);

  const theme: Theme = useTheme();

  const handleSetTemplate = (template: PlacezLayoutPlan) => {
    setDetail({
      ...detail,
      ...template,
    });
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(GetTemplates());
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    props?.onChange?.(detail);
  }, [detail]);

  enum TabOptions {
    template = 'Template',
    new = 'New',
  }

  return (
    <Slide direction="left" in={true} mountOnEnter unmountOnExit>
      <div className={classes.root} style={{ padding: '0px 40px' }}>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '60px',
            justifyContent: 'end',
          }}
        >
          <PlacezIconButton
            color={!useGrid ? 'primary' : 'default'}
            onClick={() => {
              setUseGrid(false);
            }}
          >
            <ViewList />
          </PlacezIconButton>
          <PlacezIconButton
            color={useGrid ? 'primary' : 'default'}
            onClick={() => {
              setUseGrid(true);
            }}
          >
            <Apps />
          </PlacezIconButton>
        </div>
        {useGrid && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 250px)',
              gridGap: '30px',
              maxHeight: '430px',
              overflow: 'scroll',
            }}
          >
            {templates?.map((template, index) => (
              <Tooltip title={template.name} key={index}>
                <PlacezGridButton
                  style={{
                    backgroundImage: `url(${template.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: `2px solid ${selected?.id === template.id ? theme.palette.primary.main : theme.palette.secondary.main}`,
                  }}
                  onClick={() => {
                    handleSetTemplate(template);
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '64px',
                      padding: '0px 6px',
                      backgroundColor: theme.palette.secondary.main,
                    }}
                  >
                    <Typography variant="h6">{template.name}</Typography>
                  </div>
                </PlacezGridButton>
              </Tooltip>
            ))}
          </div>
        )}
        {!useGrid && (
          <div style={{}}>
            <TemplateTable
              onSelect={handleSetTemplate}
              selected={props.selected}
              height="430px"
            />
          </div>
        )}
      </div>
    </Slide>
  );
};

export default ChoseTemplate;
