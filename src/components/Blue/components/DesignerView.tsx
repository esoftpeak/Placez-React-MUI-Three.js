import { createRef, useEffect, useRef } from 'react';
import { BlueJS } from '../../../blue/blueEntryPoint';
import { HandlesFromBlue } from '../models';
import { Theme } from '@mui/material';
import { useTheme } from '@mui/styles';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import { CrosshairTooltip } from './tooltip';

export interface Props {
  designerCallbacks: HandlesFromBlue;
  showFloorplan: boolean;
  onDesignerReady?: (designer: any) => void;
}

const fullScreenStyle = {
  width: '100%',
  height: '100%',
};

const title = 'Click & Drag to Multiselect';

const DesignerView = (props: Props) => {
  // FIXME CSS Id's should be passed by Blue Core
  const designerId = 'contentViewer';
  const canvasId = 'floorplan';
  const viewerId = 'viewer';
  const theme: Theme = useTheme();
  const designerElementRef = createRef<HTMLDivElement>();
  const designer = useRef(undefined);

  const setDesinger = () => {
    designer.current = new BlueJS(
      designerElementRef.current,
      props.designerCallbacks
    );

    props.onDesignerReady?.(designer.current)
  };

  useEffect(() => {
    setDesinger();
    return () => {
      if (designer) {
        designer.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    designer.current?.setTheme(theme);
  }, [theme]);

  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const multiSelect = useSelector(
    (state: ReduxState) => state.blue.multiSelect
  );

  // Crosshair functionality for 2D viewer
  useEffect(() => {
    if (!viewerRef.current) return () => { };
    const viewerElement = viewerRef.current;
    let originalLabelRendererCursor = '';

    const overrideCursor = () => {
      const labelRenderer = viewerElement.querySelector(
        '#labelRenderer'
      ) as HTMLElement;
      if (!labelRenderer) return;

      if (multiSelect) {
        originalLabelRendererCursor = labelRenderer.style.cursor || '';

        labelRenderer.style.setProperty('cursor', 'crosshair', 'important');
      } else {
        if (originalLabelRendererCursor) {
          labelRenderer.style.cursor = originalLabelRendererCursor;
        } else {
          labelRenderer.style.removeProperty('cursor');
        }
      }
    };

    overrideCursor();

    const observer = new MutationObserver(() => {
      overrideCursor();
    });

    observer.observe(viewerElement, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [multiSelect]);

  // Crosshair functionality for floorplan canvas
  useEffect(() => {
    if (!canvasRef.current) return () => { };
    const canvasElement = canvasRef.current;
    let originalCanvasCursor = '';

    const overrideCanvasCursor = () => {
      if (multiSelect) {
        originalCanvasCursor = canvasElement.style.cursor || '';
        canvasElement.style.setProperty('cursor', 'crosshair', 'important');
      } else {
        if (originalCanvasCursor) {
          canvasElement.style.cursor = originalCanvasCursor;
        } else {
          canvasElement.style.removeProperty('cursor');
        }
      }
    };

    overrideCanvasCursor();

    const observer = new MutationObserver(() => {
      overrideCanvasCursor();
    });

    observer.observe(canvasElement, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [multiSelect]);

  // FIXME 2D and 3D View should have isolated views
  const { showFloorplan } = props;

  return (
    <div style={fullScreenStyle} id={designerId} ref={designerElementRef}>
      <div
        ref={canvasRef}
        id={canvasId}
        style={{ ...fullScreenStyle, position: 'relative' }}
        hidden={!showFloorplan}
      >
        <CrosshairTooltip
          title={title}
          multiSelect={multiSelect}
          viewerRef={canvasRef}
        />
      </div>
      <div
        ref={viewerRef}
        id={viewerId}
        style={{ ...fullScreenStyle, position: 'relative' }}
        hidden={showFloorplan}
      >
        <CrosshairTooltip
          title={title}
          multiSelect={multiSelect}
          viewerRef={viewerRef}
        />
      </div>
    </div>
  );
};

export default DesignerView;
