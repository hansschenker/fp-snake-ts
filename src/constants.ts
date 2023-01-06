// board
export const COLS = 30;
export const ROWS = 30;
export const GAP_SIZE = 1;
export const CELL_SIZE = 10;
// snake
export const SNAKE_LENGTH = 3;
export const SPEED = 100;
// score follows from apples eaten
export const APPLE_COUNT = 2;
export const POINTS_PER_APPLE = 1;
export const GROW_PER_APPLE = 1;

export type Point ={
  x: number;
  y: number;
}
export const createPoint = (x: number, y:number):Point =>  ({  x, y}) 

export type Direction = {
  x: number;
  y: number;
}
export const DirectionLeft = { x: -1, y: 0 };
export const DirectionRight = { x: 1, y: 0 };
export const DirectionUp = { x: 0, y: -1 };
export const DirectionDown = { x: 0, y: 1 };

export const DIRECTIONS: {[key:number]:Direction} = {
  37: { x: -1, y:  0, },
  38: { x:  0, y: -1 },
  39: { x:  1, y:  0 },
  40: { x:  0, y:  1 },
};
export const INITIAL_DIRECTION = DirectionDown;
