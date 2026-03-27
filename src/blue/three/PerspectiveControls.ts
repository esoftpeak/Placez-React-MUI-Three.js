import {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  Vector2,
  Vector3,
  Matrix4,
  PerspectiveCamera,
} from 'three';
import PlacezCameraState from '../../api/placez/models/PlacezCameraState';
import { TargetSpecs } from './Cameras';

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

export const PerspectiveControls = function (
  camera: PerspectiveCamera,
  domElement
) {
  const scope = this;

  this.object = camera;

  this.domElement = domElement !== undefined ? domElement : document;

  // Set to false to disable this control
  this.enabled = true;

  // "target" sets the location of focus, where the object orbits around
  this.target = new Vector3();

  // How far you can dolly in and out ( PerspectiveCamera only )
  this.minDistance = 0;
  this.maxDistance = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI / 2; // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
  this.minAzimuthAngle = -Infinity; // radians
  this.maxAzimuthAngle = Infinity; // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  this.enableDamping = false;
  this.dampingFactor = 0.25;

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  this.enableZoom = true;
  this.zoomSpeed = 1.0;

  // Set to false to disable rotating
  this.enableRotate = true;
  this.rotateSpeed = 1.0;

  // Set to false to disable panning
  this.enablePan = true;
  this.panSpeed = 1.0;
  this.screenSpacePanning = false; // if true, pan in screen-space
  this.keyPanSpeed = 7.0; // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  this.autoRotate = false;
  this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

  // Set to false to disable use of the keys
  this.enableKeys = false;

  // The four arrow keys
  this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

  // Mouse buttons
  this.mouseButtons = {
    LEFT: MOUSE.LEFT,
    MIDDLE: MOUSE.MIDDLE,
    RIGHT: MOUSE.RIGHT,
  };

  // for reset
  this.perspectiveState = {
    target0: this.target.clone().setY(150),
    position0: this.object.position.clone(),
  };

  //
  // public methods
  //

  this.getPolarAngle = function () {
    return spherical.phi;
  };

  this.getAzimuthalAngle = function () {
    return spherical.theta;
  };

  this.saveState = function () {
    this.perspectiveState.target0.copy(scope.target);
    this.perspectiveState.position0.copy(scope.object.position);
  };

  this.loadState = function (cameraState: PlacezCameraState) {
    if (!cameraState.perspectiveState) return;
    const perspectiveState = cameraState.perspectiveState;
    const pTransformation = new Matrix4().fromArray(
      perspectiveState.transformation
    );
    this.target.fromArray(perspectiveState.target).setY(150);
    this.object.position.setFromMatrixPosition(pTransformation);
    this.update();

    this.object.updateProjectionMatrix();
    scope.dispatchEvent(changeEvent);
    state = STATE.NONE;
  };

  // This maintaines view angle
  // this.setTarget = function (targetSpecs: TargetSpecs) {
  //   const relMove = this.target.sub(targetSpecs.center).clone();
  //   this.target.copy(targetSpecs.center);
  //   this.object.position.add(relMove);
  //   this.update();
  // };

  // this sets to iso view
  this.setTarget = function (targetSpecs: TargetSpecs) {
    const relMove = this.target.sub(targetSpecs.center).clone();
    this.target.copy(targetSpecs.center);
    this.target.setY(150);
    this.object.position.add(relMove);
    this.object.position.copy(
      new Vector3(1, 1, 1)
        .multiplyScalar(
          new Vector3().subVectors(this.object.position, this.target).length()
        )
        .add(this.target)
    );
    this.update();
  };

  // have to fire fit to view before load state to initialize the camera distance etc
  this.fitToView = function (targetSpecs: TargetSpecs) {
    const radius = new Vector3()
      .subVectors(scope.object.position, scope.target)
      .length();
    this.setTarget(targetSpecs);
    scale =
      (targetSpecs.diagonal * 1.2) /
      2 /
      Math.tan(
        (((scope.object.fov * scope.object.aspect) / 2) * Math.PI) / 180.0
      ) /
      radius;
    this.update();
    const coord = new Vector3().subVectors(
      scope.object.position,
      targetSpecs.center
    );

    // set far and maxdistance based on largest fit to view
    this.object.far = coord.length() * 4;
    this.maxDistance = coord.length() * 2;

    this.object.updateProjectionMatrix();
  };

  // this method is exposed, but perhaps it would be better if we can make it private...
  this.update = (function () {
    scope.needsUpdate = true;
    const offset = new Vector3();

    // so camera.up is the orbit axis
    // not sure why scope is undefined
    const quat = new Quaternion().setFromUnitVectors(
      scope.object.up,
      new Vector3(0, 1, 0)
    );

    const quatInverse = (quat.clone() as any).invert();

    const lastPosition = new Vector3();
    const lastQuaternion = new Quaternion();

    return function update() {
      const position = scope.object.position;

      offset.copy(position).sub(scope.target);

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);

      // angle from z-axis around y-axis
      spherical.setFromVector3(offset);

      if (scope.autoRotate && state === STATE.NONE) {
        rotateLeft(getAutoRotationAngle());
      }

      spherical.theta += sphericalDelta.theta;
      spherical.phi += sphericalDelta.phi;

      // restrict theta to be between desired limits
      spherical.theta = Math.max(
        scope.minAzimuthAngle,
        Math.min(scope.maxAzimuthAngle, spherical.theta)
      );

      // restrict phi to be between desired limits
      spherical.phi = Math.max(
        scope.minPolarAngle,
        Math.min(scope.maxPolarAngle, spherical.phi)
      );

      spherical.makeSafe();

      spherical.radius *= scale;

      // restrict radius to be between desired limits
      spherical.radius = Math.max(
        scope.minDistance,
        Math.min(scope.maxDistance, spherical.radius)
      );

      // move target to panned location
      scope.target.add(panOffset);

      offset.setFromSpherical(spherical);

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse);

      position.copy(scope.target).add(offset);

      if (scope.enableDamping === true) {
        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;

        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);

        panOffset.set(0, 0, 0);
      }

      scope.object.lookAt(scope.target);
      scale = 1;

      scope.saveState();
      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      if (zoomChanged) scope.dispatchEvent(zoomEvent);

      if (
        zoomChanged ||
        lastPosition.distanceToSquared(scope.object.position) > EPS ||
        8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
      ) {
        scope.dispatchEvent(changeEvent);

        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);
        zoomChanged = false;

        return true;
      }

      return false;
    };
  })();

  //
  // internals
  //

  // tslint:disable-next-line:no-this-assignment

  const changeEvent = { type: 'change' };
  const startEvent = { type: 'start' };
  const endEvent = { type: 'end' };
  const zoomEvent = { type: 'zoom' };

  const STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY_PAN: 4,
  };

  let state = STATE.NONE;

  const EPS = 0.000001;

  // current position in spherical coordinates
  const spherical = new Spherical();
  const sphericalDelta = new Spherical();

  let scale = 1;
  const panOffset = new Vector3();
  let zoomChanged = false;

  const rotateStart = new Vector2();
  const rotateEnd = new Vector2();
  const rotateDelta = new Vector2();

  const panStart = new Vector2();
  const panEnd = new Vector2();
  const panDelta = new Vector2();

  const dollyStart = new Vector2();
  const dollyEnd = new Vector2();
  const dollyDelta = new Vector2();

  function getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
  }

  function getZoomScale() {
    return Math.pow(0.95, scope.zoomSpeed);
  }

  function rotateLeft(angle) {
    sphericalDelta.theta -= angle;
  }

  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }

  const panLeft = (function () {
    const v = new Vector3();

    return function panLeft(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
      v.multiplyScalar(-distance);

      panOffset.add(v);
    };
  })();

  const panUp = (function () {
    const v = new Vector3();

    return function panUp(distance, objectMatrix) {
      if (scope.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(scope.object.up, v);
      }

      v.multiplyScalar(distance);

      panOffset.add(v);
    };
  })();

  // deltaX and deltaY are in pixels; right and down are positive
  const pan = (function () {
    const offset = new Vector3();

    return function pan(deltaX, deltaY) {
      const element =
        scope.domElement === document
          ? scope.domElement.body
          : scope.domElement;

      // perspective
      const position = scope.object.position;
      offset.copy(position).sub(scope.target);
      let targetDistance = offset.length();

      // half of the fov is center to top of screen
      targetDistance *= Math.tan(((scope.object.fov / 2) * Math.PI) / 180.0);

      // we use only clientHeight here so aspect ratio does not distort speed
      panLeft(
        (2 * deltaX * targetDistance) / element.clientHeight,
        scope.object.matrix
      );
      panUp(
        (2 * deltaY * targetDistance) / element.clientHeight,
        scope.object.matrix
      );
    };
  })();

  function dollyIn(dollyScale) {
    scale /= dollyScale;
    zoomChanged = true;
  }

  function dollyOut(dollyScale) {
    scale *= dollyScale;
    zoomChanged = true;
  }

  this.getViewSize = (): number => {
    return spherical.radius * Math.tan(Math.PI / 8) * 2;
  };

  //
  // event callbacks - update the object state
  //

  function handleMouseDownRotate(event) {
    // console.log( 'handleMouseDownRotate' );

    rotateStart.set(event.clientX, event.clientY);
  }

  function handleMouseDownDolly(event) {
    // console.log( 'handleMouseDownDolly' );

    dollyStart.set(event.clientX, event.clientY);
  }

  function handleMouseDownPan(event) {
    // console.log( 'handleMouseDownPan' );

    panStart.set(event.clientX, event.clientY);
  }

  function handleMouseMoveRotate(event) {
    // console.log( 'handleMouseMoveRotate' );

    rotateEnd.set(event.clientX, event.clientY);

    rotateDelta
      .subVectors(rotateEnd, rotateStart)
      .multiplyScalar(scope.rotateSpeed);

    const element =
      scope.domElement === document ? scope.domElement.body : scope.domElement;

    rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight); // yes, height

    rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

    rotateStart.copy(rotateEnd);

    scope.update();
  }

  function handleMouseMoveDolly(event) {
    // console.log( 'handleMouseMoveDolly' );

    dollyEnd.set(event.clientX, event.clientY);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    if (dollyDelta.y > 0) {
      dollyIn(getZoomScale());
    } else if (dollyDelta.y < 0) {
      dollyOut(getZoomScale());
    }

    dollyStart.copy(dollyEnd);

    scope.update();
  }

  function handleMouseMovePan(event) {
    // console.log( 'handleMouseMovePan' );

    panEnd.set(event.clientX, event.clientY);

    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

    pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    scope.update();
  }

  function handleMouseUp(event) {
    // console.log( 'handleMouseUp' );
  }

  function handleMouseWheel(event) {
    if (event.deltaY < 0) {
      dollyOut(getZoomScale());
    } else if (event.deltaY > 0) {
      dollyIn(getZoomScale());
    }

    scope.update();
  }

  function handleKeyDown(event) {
    // console.log( 'handleKeyDown' );

    let needsUpdate = false;

    switch (event.keyCode) {
      case scope.keys.UP:
        pan(0, scope.keyPanSpeed);
        needsUpdate = true;
        break;

      case scope.keys.BOTTOM:
        pan(0, -scope.keyPanSpeed);
        needsUpdate = true;
        break;

      case scope.keys.LEFT:
        pan(scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      case scope.keys.RIGHT:
        pan(-scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;
    }

    if (needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();

      scope.update();
    }
  }

  function handleTouchStartRotate(event) {
    // console.log( 'handleTouchStartRotate' );

    rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  }

  function handleTouchStartDollyPan(event) {
    // console.log( 'handleTouchStartDollyPan' );

    if (scope.enableZoom) {
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);
    }

    if (scope.enablePan) {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      panStart.set(x, y);
    }
  }

  function handleTouchMoveRotate(event) {
    // console.log( 'handleTouchMoveRotate' );

    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

    rotateDelta
      .subVectors(rotateEnd, rotateStart)
      .multiplyScalar(scope.rotateSpeed);

    const element =
      scope.domElement === document ? scope.domElement.body : scope.domElement;

    rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight); // yes, height

    rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

    rotateStart.copy(rotateEnd);

    scope.update();
  }

  function handleTouchMoveDollyPan(event) {
    // console.log( 'handleTouchMoveDollyPan' );

    if (scope.enableZoom) {
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

      dollyIn(dollyDelta.y);

      dollyStart.copy(dollyEnd);
    }

    if (scope.enablePan) {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      panEnd.set(x, y);

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);
    }

    scope.update();
  }

  function handleTouchEnd(event) {
    // console.log( 'handleTouchEnd' );
  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  function onMouseDown(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    // Prevent the browser from scrolling.

    event.preventDefault();

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.

    scope.domElement.focus ? scope.domElement.focus() : window.focus();

    switch (event.button) {
      case scope.mouseButtons.LEFT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enablePan === false) return;

          handleMouseDownPan(event);

          state = STATE.PAN;
        } else {
          if (scope.enableRotate === false) return;

          handleMouseDownRotate(event);

          state = STATE.ROTATE;
        }

        break;

      case scope.mouseButtons.MIDDLE:
        if (scope.enableZoom === false) return;

        handleMouseDownDolly(event);

        state = STATE.DOLLY;

        break;

      case scope.mouseButtons.RIGHT:
        if (scope.enablePan === false) return;

        handleMouseDownPan(event);

        state = STATE.PAN;

        break;
    }

    if (state !== STATE.NONE) {
      scope.domElement.addEventListener('mousemove', onMouseMove, false);
      scope.domElement.addEventListener('mouseup', onMouseUp, false);

      scope.dispatchEvent(startEvent);
    }
  }

  function onMouseMove(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    event.preventDefault();

    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false) return;

        handleMouseMoveRotate(event);

        break;

      case STATE.DOLLY:
        if (scope.enableZoom === false) return;

        handleMouseMoveDolly(event);

        break;

      case STATE.PAN:
        if (scope.enablePan === false) return;

        handleMouseMovePan(event);

        break;
    }
  }

  function onMouseUp(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    handleMouseUp(event);

    scope.domElement.removeEventListener('mousemove', onMouseMove, false);
    scope.domElement.removeEventListener('mouseup', onMouseUp, false);

    scope.dispatchEvent(endEvent);

    state = STATE.NONE;
  }

  function onMouseWheel(event) {
    if (
      scope.enabled === false ||
      scope.enableZoom === false ||
      (state !== STATE.NONE && state !== STATE.ROTATE)
    )
      return;
    scope.needsUpdate = true;

    event.preventDefault();
    event.stopPropagation();

    scope.dispatchEvent(startEvent);

    handleMouseWheel(event);

    scope.dispatchEvent(endEvent);
  }

  function onKeyDown(event) {
    if (
      scope.enabled === false ||
      scope.enableKeys === false ||
      scope.enablePan === false
    )
      return;
    scope.needsUpdate = true;

    handleKeyDown(event);
  }

  function onTouchStart(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    event.preventDefault();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (scope.enableRotate === false) return;

        handleTouchStartRotate(event);

        state = STATE.TOUCH_ROTATE;

        break;

      case 2: // two-fingered touch: dolly-pan
        if (scope.enableZoom === false && scope.enablePan === false) return;

        handleTouchStartDollyPan(event);

        state = STATE.TOUCH_DOLLY_PAN;

        break;

      default:
        state = STATE.NONE;
    }

    if (state !== STATE.NONE) {
      scope.dispatchEvent(startEvent);
    }
  }

  function onTouchMove(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (scope.enableRotate === false) return;
        if (state !== STATE.TOUCH_ROTATE) return; // is this needed?

        handleTouchMoveRotate(event);

        break;

      case 2: // two-fingered touch: dolly-pan
        if (scope.enableZoom === false && scope.enablePan === false) return;
        if (state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?

        handleTouchMoveDollyPan(event);

        break;

      default:
        state = STATE.NONE;
    }
  }

  function onTouchEnd(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    handleTouchEnd(event);

    scope.dispatchEvent(endEvent);

    state = STATE.NONE;
  }

  function onContextMenu(event) {
    if (scope.enabled === false) return;
    scope.needsUpdate = true;

    event.preventDefault();
  }

  function contextmenu(event) {
    event.preventDefault();
  }

  // Expose
  this.rotateLeft = rotateLeft;
  this.rotateUp = rotateUp;
  this.dollyOut = dollyOut;
  this.dollyIn = dollyIn;
  this.getZoomScale = getZoomScale;

  this.init = () => {
    this.domElement.addEventListener('contextmenu', onContextMenu, false);
    this.domElement.addEventListener('mousedown', onMouseDown, false);
    this.domElement.addEventListener('wheel', onMouseWheel, false);
    this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
    this.domElement.addEventListener('touchstart', onTouchStart, false);
    this.domElement.addEventListener('touchend', onTouchEnd, false);
    this.domElement.addEventListener('touchmove', onTouchMove, false);
    window.addEventListener('keydown', onKeyDown, false);
  };

  this.dispose = () => {
    this.domElement.removeEventListener('contextmenu', contextmenu, false);
    this.domElement.removeEventListener('mousedown', onMouseDown, false);
    this.domElement.removeEventListener('wheel', onMouseWheel, false);
    this.domElement.removeEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
    this.domElement.removeEventListener('touchstart', onTouchStart, false);
    this.domElement.removeEventListener('touchend', onTouchEnd, false);
    this.domElement.removeEventListener('touchmove', onTouchEnd, false);
    window.removeEventListener('keydown', onKeyDown, false);

    this.domElement.removeEventListener('mousemove', onMouseMove, false);
    this.domElement.removeEventListener('mouseup', onMouseUp, false);
  };

  // force an update at start
  this.update();
};

PerspectiveControls.prototype = Object.create(EventDispatcher.prototype);
PerspectiveControls.prototype.constructor = PerspectiveControls;

Object.defineProperties(PerspectiveControls.prototype, {
  center: {
    get() {
      console.warn('THREE.OrbitControls: .center has been renamed to .target');
      return this.target;
    },
  },

  // backward compatibility

  /**
   * @deprecated .noZoom has been deprecated. Use .enableZoom instead.
   */
  noZoom: {
    get() {
      console.warn(
        'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.'
      );
      return !this.enableZoom;
    },

    set(value) {
      console.warn(
        'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.'
      );
      this.enableZoom = !value;
    },
  },

  /**
   * @deprecated .noPan has been deprecated. Use .enablePan instead.
   */
  noPan: {
    get() {
      console.warn(
        'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.'
      );
      return !this.enablePan;
    },

    set(value) {
      console.warn(
        'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.'
      );
      this.enablePan = !value;
    },
  },

  /**
   * @deprecated .noKeys has been deprecated. Use .enableKeys instead.
   */
  noKeys: {
    get() {
      console.warn(
        'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.'
      );
      return !this.enableKeys;
    },

    set(value) {
      console.warn(
        'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.'
      );
      this.enableKeys = !value;
    },
  },

  /**
   * @deprecated .staticMoving has been deprecated. Use .enableDamping instead.
   */
  staticMoving: {
    get() {
      console.warn(
        'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.'
      );
      return !this.enableDamping;
    },

    set(value) {
      console.warn(
        'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.'
      );
      this.enableDamping = !value;
    },
  },

  /**
   * @deprecated .dynamicDampingFactor has been renamed. Use .dampingFactor instead.
   */
  dynamicDampingFactor: {
    get() {
      console.warn(
        'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.'
      );
      return this.dampingFactor;
    },

    set(value) {
      console.warn(
        'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.'
      );
      this.dampingFactor = value;
    },
  },
});
