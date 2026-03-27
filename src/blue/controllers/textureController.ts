import { store } from '../..';
import { ReduxState } from '../../reducers';
import { SetSelectedSurfaces } from '../../reducers/blue';
import { CameraLayers, ControllerType } from '../../models/BlueState';

import { from, fromEvent, merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  withLatestFrom,
  startWith,
} from 'rxjs/operators';
import {
  EdgesGeometry,
  Mesh,
  Raycaster,
  Vector2,
} from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry'

export const TextureController = function (
  scene,
  cameras,
  element,
  controls,
  model,
  main
) {
  this.cameras = cameras;
  this.controllerType = ControllerType.Texture;
  const clickTolerance = 3;

  const state = {
    longPressTime: 500,
    raycaster: new Raycaster(),
  };
  let wireframe;

  function selectedMesh(mesh) {
    if (wireframe) scene.remove(wireframe);

    const color = main.theme.palette.primary.main;
    const lineWidth = 5.0;
    // Create edges geometry from the mesh geometry
    const edgesGeometry = new EdgesGeometry(mesh.geometry);

    const lineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(edgesGeometry);

    // Create line material
    const lineMaterial = new LineMaterial({
      color,
      linewidth: lineWidth, // in world units with size attenuation
      resolution: new Vector2(window.innerWidth, window.innerHeight) // to handle size attenuation
    });
    lineMaterial.depthTest = false; // Make sure the wireframe is visible through the mesh

    // Create LineSegments2
    const lineSegments = new LineSegments2(lineGeometry, lineMaterial);

    // Set the position, rotation, and scale to match the original mesh
    lineSegments.position.copy(mesh.position);
    lineSegments.rotation.copy(mesh.rotation);
    lineSegments.scale.copy(mesh.scale);

    wireframe = lineSegments;
    scene.add(wireframe);
    // return lineSegments;
  }

//   function selectedMesh(mesh) {

//   // Create wireframe geometry from the cloned mesh's geometry
//   const geometryClone = mesh.geometry.clone();
//   // const wireframeGeometry = new WireframeGeometry(geometryClone);
//   const wireframeGeometry = new EdgesGeometry(geometryClone);

//   // Create wireframe material with red color
//   const color = main.theme.palette.primary.main;
//   console.log(color)
//   const wireframeMaterial = new LineBasicMaterial({
//     color, // Red color
//     linewidth: 2
//   });

//   if (wireframe) scene.remove(wireframe);
//   // Create line segments from the wireframe geometry and material
//   wireframe = new LineSegments(wireframeGeometry, wireframeMaterial);

//   // Scale the wireframe slightly larger than the original mesh
//   const scale = 1.00;
//   wireframe.scale.set(scale, scale, scale);

//   // Set the position and rotation of the wireframe to match the original mesh
//   wireframe.position.copy(mesh.position);
//   wireframe.rotation.copy(mesh.rotation);
//   wireframe.scale.copy(mesh.scale);

//   // Optionally, you can set the position, rotation, and scale directly if the cloned mesh has transformations
//   wireframe.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
//   wireframe.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
//   wireframe.scale.set(mesh.scale.x * scale, mesh.scale.y * scale, mesh.scale.z * scale);

//   // Add the wireframe to the scene
//   scene.add(wireframe);

//   return wireframe;
// }


  const blueInitialized$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.blueInitialized;
    }),
    distinctUntilChanged()
  );

  const enabled$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.activeController === ControllerType.Texture;
    }),
    distinctUntilChanged()
  );


  const selectedSurfaces$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState) => {
      return state.blue.selectedSurfaces;
    }),
    distinctUntilChanged()
  );

  const mouseEventToCoordinate = (mouseEvent: MouseEvent) => {
    mouseEvent.preventDefault();
    const rect = element.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - rect.x,
      y: mouseEvent.clientY - rect.y,
    };
  };

  const touchEventToCoordinate = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault();
    const rect = element.getBoundingClientRect();
    return {
      x: touchEvent.changedTouches[0].clientX - rect.x,
      y: touchEvent.changedTouches[0].clientY - rect.y,
    };
  };

  const mouseIsDown$ = merge(
    fromEvent(element, 'mousedown'),
    fromEvent(element, 'mouseup'),
    fromEvent(element, 'touchstart'),
    fromEvent(element, 'touchend')
  ).pipe(
    map((event: MouseEvent | TouchEvent): boolean => {
      if (event.type === 'touchend' || event.type === 'mouseup') {
        controls.enabled = true;
      }
      return event.type === 'mousedown' || event.type === 'touchstart';
    }),
    distinctUntilChanged(),
    startWith(false)
  );

  const mouseDown$ = fromEvent(element, 'mousedown', { passive: false }).pipe(
    map(mouseEventToCoordinate)
  );
  const mouseMove$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    filter((e) => e.buttons === 0),
    filter((e) => !(e.movementX === 0 && e.movementY === 0)),
    map(mouseEventToCoordinate),
  );
  const mouseDrag$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    filter((e) => e.buttons === 1),
    filter((e) => !(e.movementX === 0 && e.movementY === 0)),
    map(mouseEventToCoordinate)
  );
  const mouseUp$ = fromEvent(element, 'mouseup').pipe(
    map(mouseEventToCoordinate)
  );

  const touchStart$ = fromEvent(element, 'touchstart', { passive: false }).pipe(
    map(touchEventToCoordinate)
  );
  const touchMove$ = fromEvent(window, 'touchmove').pipe(
    map(touchEventToCoordinate)
  );
  const touchEnd$ = fromEvent(element, 'touchend', { passive: false }).pipe(
    map(touchEventToCoordinate)
  );
  const drop$ = fromEvent(element, 'drop').pipe(map(mouseEventToCoordinate));
  const drag$ = fromEvent(window, 'drag').pipe(map(mouseEventToCoordinate));
  const keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown');

  const start$ = merge(mouseDown$, touchStart$);
  const coordinate$ = merge(mouseMove$, touchStart$, drop$);
  const dragCoordinate$ = merge(mouseDrag$, touchMove$, drop$, drag$);
  const end$ = merge(mouseUp$, touchEnd$);

  const normalizedVector$ = coordinate$.pipe(
    filter((e) => element.clientWidth !== 0 && element.clientHeight !== 0),
    map((coord: { x: number; y: number }) => {
      const retVec = new Vector2();
      retVec.x = (coord.x / element.clientWidth) * 2 - 1;
      retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
      return retVec;
    })
  );

  const normalizedDrag$ = dragCoordinate$.pipe(
    filter((e) => element.clientWidth !== 0 && element.clientHeight !== 0),
    map((coord: { x: number; y: number }) => {
      const retVec = new Vector2();
      retVec.x = (coord.x / element.clientWidth) * 2 - 1;
      retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
      return retVec;
    })
  );

  const intersectedWall$ = normalizedVector$.pipe(
    map((screenVec) => {
      let intersections = [];
      state.raycaster.layers.set(CameraLayers.Default);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      const walls = model?.floorplan?.wallEdgePlanes();
      if (walls) {
        intersections = intersections.concat(
          state.raycaster.intersectObjects(walls)
        )
      }
      return intersections;
    }),
    map((intersections) => {
      return ({ surface: intersections?.[0]?.object?.edge, mesh: intersections?.[0]?.object as Mesh });
      // return intersections?.[0]?.object?.edge;
    }),
    startWith(undefined),
    distinctUntilChanged(),
  );

  const intersectedRoom$ = normalizedVector$.pipe(
    map((screenVec) => {
      let intersections = [];
      state.raycaster.layers.set(CameraLayers.Floorplanes);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      const rooms = main?.floorplan?.floorPlaneMeshes();
      if (rooms) {
        intersections = intersections.concat(
          state.raycaster.intersectObjects(rooms)
        );
      }
      return intersections;
    }),
    map((intersections) => {
      return ({ surface: intersections?.[0]?.object?.userData?.room, mesh: intersections?.[0]?.object as Mesh });
      // return intersections?.[0]?.object?.userData?.room;
    }),
    startWith(undefined),
    distinctUntilChanged(),
  );


  const click$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) < clickTolerance &&
        Math.abs(obs[0].y - obs[1].y) < clickTolerance
      );
    }),
    map(([start, end]) => start)
  );

  const doOnSurfaceClick$ = click$.pipe(
    withLatestFrom(intersectedWall$, intersectedRoom$),
    map(([mousePositions, intersectedWall, intersectedRoom]) => {
      if (intersectedWall?.surface) return intersectedWall;
      if (intersectedRoom?.surface) return intersectedRoom;
      return undefined;
    })
  );

  let doOnKeyDownSubscription;
  let doOnClickSubscription;
  let doOnSelectedSurfaceSubscription;

  enabled$.subscribe((enabled: boolean) => {
    doOnKeyDownSubscription?.unsubscribe();
    doOnClickSubscription?.unsubscribe();
    doOnSelectedSurfaceSubscription?.unsubscribe();

    if (enabled) {
      doOnKeyDownSubscription = keyDown$
        .pipe(
          withLatestFrom(selectedSurfaces$),
        )
        .subscribe(([event, surfaces]) => {
          switch (event.key) {
            case 'Backspace':
            case 'Delete':
              break;
            case 'h':
              // if (scope.selectedSurfaces?.[0] instanceof HalfEdge) {
              //   const selectedWall = scope.selectedSurfaces[0] as HalfEdge;
              //   selectedWall.toggleVisibility();
              //   scope.update();
              //   store.dispatch(SetSelectedSurfaces([]));
              // }
              // break;
          }
        })

      doOnClickSubscription = doOnSurfaceClick$.subscribe(
        (intersection) => {
          if (intersection) {
            store.dispatch(SetSelectedSurfaces([intersection?.surface]));
            selectedMesh(intersection.mesh);
          } else {
            store.dispatch(SetSelectedSurfaces([]));
            if (wireframe) scene.remove(wireframe);
          }
        }
      );

      doOnSelectedSurfaceSubscription = selectedSurfaces$.subscribe(
        (selectedSurfaces) => {
          if (selectedSurfaces.length === 0 && wireframe) {
            scene.remove(wireframe);
          }
      });

    } else {
      if (wireframe) scene.remove(wireframe);
    }
  });

  this.setCamera = (cam) => {
    this.camera = cam;
  };

  this.update = () => {
    this.needsUpdate = true;
  };

};
