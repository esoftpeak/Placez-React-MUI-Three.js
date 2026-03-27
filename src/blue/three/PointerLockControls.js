/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Euler, EventDispatcher, Vector3 } from 'three';

var PointerLockControls = function (camera, domElement) {
  if (domElement === undefined) {
    console.warn(
      'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.'
    );
    domElement = document.body;
  }

  this.domElement = domElement;
  this.isLocked = false;

  //
  // internals
  //

  var scope = this;

  var changeEvent = { type: 'change' };
  var lockEvent = { type: 'lock' };
  var unlockEvent = { type: 'unlock' };

  var euler = new Euler(0, 0, 0, 'YXZ');

  var PI_2 = Math.PI / 2;

  var vec = new Vector3();

  function onMouseMove(event) {
    if (scope.isLocked === false) return;

    var movementX =
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY =
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    if (movementX > scope.range || movementX < -scope.range) return;

    euler.setFromQuaternion(camera.quaternion);

    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;

    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

    camera.quaternion.setFromEuler(euler);

    scope.dispatchEvent(changeEvent);
  }

  var lastTouchX, lastTouchY;

  function onTouchStart(event) {
    if (event.touches.length === 1) {
      lastTouchX = event.touches[0].pageX;
      lastTouchY = event.touches[0].pageY;
    }
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }

  function onTouchMove(event) {
    // only work for one or two touches
    if (event.touches.length > 2) return;

    // Prevent the default behavior (which is scrolling/zooming)
    event.preventDefault();

    let selectedTouch = null;

    // single touch or the target touch in case of multi touch
    for (let i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];

      // Select touch based on the target
      if (touch.target.nodeName === 'CANVAS') {
        selectedTouch = touch;
        break;
      }
    }

    if (selectedTouch) {
      var deltaX = selectedTouch.clientX - lastTouchX;
      var deltaY = selectedTouch.clientY - lastTouchY;

      lastTouchX = selectedTouch.clientX;
      lastTouchY = selectedTouch.clientY;

      euler.setFromQuaternion(camera.quaternion);

      euler.y -= deltaX * 0.002;
      euler.x -= deltaY * 0.002;

      euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

      camera.quaternion.setFromEuler(euler);

      scope.dispatchEvent(changeEvent);
    }
  }

  function onPointerlockChange() {
    if (document.pointerLockElement === scope.domElement) {
      scope.dispatchEvent(lockEvent);
      scope.isLocked = true;
    } else {
      scope.dispatchEvent(unlockEvent);
      scope.isLocked = false;
    }
  }

  function onPointerlockError() {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
  }

  this.connect = function () {
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('touchstart', onTouchStart, false);
    document.addEventListener('touchmove', onTouchMove, { passive: false }); // Set passive to false to allow preventDefault
    document.addEventListener('pointerlockchange', onPointerlockChange, false);
    document.addEventListener('pointerlockerror', onPointerlockError, false);
  };

  this.disconnect = function () {
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('touchstart', onTouchStart, false);
    document.removeEventListener('touchmove', onTouchMove, { passive: false }); // Set passive to false to allow preventDefault
    document.removeEventListener(
      'pointerlockchange',
      onPointerlockChange,
      false
    );
    document.removeEventListener('pointerlockerror', onPointerlockError, false);
  };

  this.dispose = function () {
    this.disconnect();
  };

  this.getObject = function () {
    // retaining this method for backward compatibility

    return camera;
  };

  this.getDirection = (function () {
    var direction = new Vector3(0, 0, -1);

    return function (v) {
      return v.copy(direction).applyQuaternion(camera.quaternion);
    };
  })();

  this.moveForward = function (distance) {
    // move forward parallel to the xz-plane
    // assumes camera.up is y-up
    vec.setFromMatrixColumn(camera.matrix, 0);
    vec.crossVectors(camera.up, vec);
    vec.multiplyScalar(distance);
    camera.position.add(vec);

    return vec;
  };

  this.moveRight = function (distance) {
    vec.setFromMatrixColumn(camera.matrix, 0);
    vec.multiplyScalar(distance);
    camera.position.add(vec);

    return vec;
  };

  this.lock = function () {
    this.domElement.requestPointerLock();
  };

  this.unlock = function () {
    document.exitPointerLock();
  };
};

PointerLockControls.prototype = Object.create(EventDispatcher.prototype);
PointerLockControls.prototype.constructor = PointerLockControls;

export { PointerLockControls };
