import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Theme, useTheme } from '@mui/material';

import { ViewList, Apps } from '@mui/icons-material';
import { Slide, Typography, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';

// Models
import { getFloorPlansByPlaceId } from '../../reducers/floorPlans';
import { ReduxState } from '../../reducers';
import PlacezFixturePlan from '../../api/placez/models/PlacezFixturePlan';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import PlacezAutoComplete from '../PlacezUIComponents/PlacezAutoComplete';
import { Place, PlacezLayoutPlan } from '../../api';
import formStyles from '../Styles/formStyles.css';
import { DefaultPlacezLayoutPlan } from '../../api/placez/models/PlacezLayoutPlan';
import PlacezIconButton from '../PlacezUIComponents/PlacezIconButton';
import FloorplanTable from '../Tables/FloorplanTable';
import PlacezGridButton from '../PlacezUIComponents/PlacezGridButton';

interface Props {
  layout?: PlacezLayoutPlan;
  onChange?: (scene: PlacezLayoutPlan) => void;
}

const ChoseFloorplan = (props: Props) => {
  const isFirstRender = useRef(true);
  const styles = makeStyles<Theme>(formStyles);
  const classes = styles(props);

  const [detail, setDetail] = useState<PlacezLayoutPlan>(
    props.layout ?? DefaultPlacezLayoutPlan
  );
  const venues = useSelector((state: ReduxState) => state.place.places);
  const [veneue, setVeneue] = useState<Place>(undefined);
  const floorplans = useSelector((state: ReduxState) =>
    getFloorPlansByPlaceId(state, veneue?.id)
  );
  const [useGrid, setUseGrid] = useState<boolean>(false);

  const theme: Theme = useTheme();
  const [selected, setSelected] = useState<PlacezFixturePlan>(undefined);

  useEffect(() => {
    if (floorplans?.length > 0) {
      if (!detail.floorPlanId) {
        handleDetailChange('floorPlanId')(floorplans[0].id);
      }
      if (detail.floorPlanId && detail.floorPlanId !== selected?.id) {
        setSelected(
          floorplans.find((floorplan) => floorplan.id === detail.floorPlanId)
        );
      }
    }
  }, [detail.floorPlanId, floorplans]);

  const handleDetailChange = (prop: any) => (v: any) => {
    if(prop === 'floorPlanRow') {
      setDetail({
        placeId: v.placeId,
        floorPlanId: v.id
      })
      return;
    }
    setDetail({
      ...detail,
      [prop]: v,
    });
  };
  const dispatch = useDispatch();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    props?.onChange?.(detail);
  }, [detail]);

  return (
    <Slide direction="left" in={true} mountOnEnter unmountOnExit>
      <div className={classes.root} style={{ padding: '0px 40px' }}>
        {/* <PlacezAutoComplete
          options={floorplans
            .map((floorplan, index) => floorplan.name)
          }
          onChange={(e, v) => {handleDetailChange('floorPlanId')(floorplans.find((floorplan) => floorplan.name === v).id)}}
          renderInput={(params) => (
            <PlacezTextField
              {...params}
              label="Floorplan"
            />
          )}
        /> */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '60px',
            justifyContent: 'space-between',
          }}
        >
          <PlacezAutoComplete
            options={venues.map((venue, index) => venue.name)}
            onChange={(e, v) => {
              setVeneue(venues.find((venue) => venue.name === v));
              handleDetailChange('floorPlanId')(undefined);
            }}
            style={{ maxWidth: '200px' }}
            renderInput={(params) => (
              <PlacezTextField {...params} label="Venue" />
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'end' }}>
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
        </div>
        {useGrid && veneue !== undefined && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 250px)',
              gridGap: '30px',
              maxHeight: '430px',
              overflow: 'scroll',
            }}
          >
            {floorplans?.map((template, index) => (
              <Tooltip title={template.name} key={index}>
                <PlacezGridButton
                  style={{
                    backgroundImage: `url(${template.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: `2px solid ${selected?.id === template.id ? theme.palette.primary.main : theme.palette.secondary.main}`,
                  }}
                  onClick={() => handleDetailChange('floorPlanId')(template.id)}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '64px',
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
        {!useGrid && veneue !== undefined && (
          <div style={{}}>
            <FloorplanTable
              onSelect={handleDetailChange('floorPlanRow')}
              selected={detail}
              fixturePlans={floorplans}
              height="430px"
            />
          </div>
        )}
      </div>
    </Slide>
  );
};

export default ChoseFloorplan;
