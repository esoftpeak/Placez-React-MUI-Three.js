import { Utils } from "../core/utils"
import { Corner } from "./corner"

/*
  * Find the "rooms" in our planar straight-line graph.
  * Rooms are set of the smallest (by area) possible cycles in this graph.
  * @param corners The corners of the floorplan.
  * @returns The rooms, each room as an array of corners.
  */

function removeDuplicateRooms(roomArray: Corner[][]): Corner[][] {
  const results: Corner[][] = [];
  const lookup = {};
  const hashFunc = function (corner) {
    return corner.id;
  };
  const sep = '-';
  for (let i = 0; i < roomArray.length; i++) {
    // rooms are cycles, shift it around to check uniqueness
    let add = true;
    let str;
    const room = roomArray[i];
    for (let j = 0; j < room.length; j++) {
      const roomShift = Utils.cycle(room, j);
      str = roomShift.map(hashFunc).join(sep);
      if (lookup.hasOwnProperty(str)) {
        add = false;
      }
    }
    if (add) {
      results.push(roomArray[i]);
      lookup[str] = true;
    }
  }
  return results;
}

function calculateTheta(
  previousCorner: Corner,
  currentCorner: Corner,
  nextCorner: Corner
) {
  const theta = Utils.angle2pi(
    previousCorner._position.x - currentCorner._position.x,
    previousCorner._position.z - currentCorner._position.z,
    nextCorner._position.x - currentCorner._position.x,
    nextCorner._position.z - currentCorner._position.z
  );
  return theta;
}

function removeStraightCorners(roomArray: Corner[][]): Corner[][] {
  const newRoomArray = roomArray.map((room: Corner[]) => {
    for (let index = 0; index < room.length; index++) {
      let theta: number;
      if (index === 0) {
        theta = calculateTheta(
          room[room.length - 1],
          room[index],
          room[index + 1]
        );
      } else if (index === room.length - 1) {
        theta = calculateTheta(room[index - 1], room[index], room[0]);
      } else {
        theta = calculateTheta(
          room[index - 1],
          room[index],
          room[index + 1]
        );
      }
      if (Utils.approxeq(theta, Math.PI, 0.01)) {
        room.splice(index, 1);
        index--;
      }
    }
    return room;
  });
  return newRoomArray;
}

function findTightestCycle(
  firstCorner: Corner,
  secondCorner: Corner
): Corner[] {
  const stack: {
    corner: Corner;
    previousCorners: Corner[];
  }[] = [];

  let next = {
    corner: secondCorner,
    previousCorners: [firstCorner],
  };
  const visited = {};
  visited[firstCorner.id] = true;

  while (next) {
    // update previous corners, current corner, and visited corners
    const currentCorner = next.corner;
    visited[currentCorner.id] = true;

    // did we make it back to the startCorner?
    if (next.corner === firstCorner && currentCorner !== secondCorner) {
      return next.previousCorners;
    }

    const addToStack: Corner[] = [];

    const adjacentCorners = next.corner.adjacentCorners();
    for (let i = 0; i < adjacentCorners.length; i++) {
      const nextCorner = adjacentCorners[i];

      // is this where we came from?
      // give an exception if its the first corner and we aren't at the second corner
      if (
        nextCorner.id in visited &&
        !(nextCorner === firstCorner && currentCorner !== secondCorner)
      ) {
        continue;
      }

      // nope, throw it on the queue
      addToStack.push(nextCorner);
    }

    const previousCorners = next.previousCorners.slice(0);
    previousCorners.push(currentCorner);
    if (addToStack.length > 1) {
      // visit the ones with smallest theta first
      const previousCorner =
        next.previousCorners[next.previousCorners.length - 1];
      addToStack.sort((a, b) => {
        return (
          calculateTheta(previousCorner, currentCorner, b) -
          calculateTheta(previousCorner, currentCorner, a)
        );
      });
    }

    if (addToStack.length > 0) {
      // add to the stack
      addToStack.forEach((corner: any) => {
        stack.push({
          corner,
          previousCorners,
        });
      });
    }

    // pop off the next one
    next = stack.pop();
  }
  return [];
}

export function findRooms(corners: Corner[]): Corner[][] {

  // find tightest loops, for each corner, for each adjacent
  // TODO: optimize this, only check corners with > 2 adjacents, or isolated cycles
  const loops: Corner[][] = [];

  corners.forEach((firstCorner: any) => {
    firstCorner.adjacentCorners().forEach((secondCorner: any) => {
      loops.push(findTightestCycle.apply(this, [firstCorner, secondCorner]));
    });
  });

  // remove duplicates
  const uniqueLoops = removeDuplicateRooms(loops);
  // remove CW loops
  const uniqueCCWLoops = uniqueLoops.filter((loop: Corner[]) => {
    return !Utils.isClockwise(loop);
  });

  return uniqueCCWLoops;
}
