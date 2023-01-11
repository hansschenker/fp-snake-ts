// board
export const COLS = 30;
export const ROWS = 30;
export const GAP_SIZE = 1;
export const CELL_SIZE = 10;
// score
export const GROW_PER_APPLE = 1;
// snake
export const INITIAL_SNAKE_LENGTH = 3;
export const SPEED = 100;
// key to direction
export const KEY_DIRECTIONS = {
  37: { x: -1, y:  0 },
  38: { x:  0, y: -1 },
  39: { x:  1, y:  0 },
  40: { x:  0, y:  1 },
};
export const INITIAL_DIRECTION = KEY_DIRECTIONS[40];
