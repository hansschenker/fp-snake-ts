import { COLS, POINTS_PER_APPLE, ROWS,  } from "./constants";
import { createPoint, Direction, Point } from './types';

export const nextScore = (score: number) => score + POINTS_PER_APPLE

export const nextGrow = (length:number, grow:number) => length + grow

const range = (l: number) => [...Array(l).keys()];

function checkPoints(a:Point, b:Point):boolean {
  return a.x === b.x && a.y === b.y;
}
export function checkSnakeHasNotCollided(snake = []):boolean {
  const [head, ...tail] = snake;
  return !tail.some((part) => checkPoints(part, head));
}
function getRandomPoint(snake = []):Point {
  return  {
    x: getRandomNumber(0, COLS - 1),
    y: getRandomNumber(0, ROWS - 1),
  };
}

export function nextApplePositions(apples: Point[], snake: Point[]):Point[] {
  const head = snake[0];
  const notEaten = apples.filter((apple) => !checkPoints(head, apple));
  const wasEaten = notEaten.length < apples.length;
  const added = wasEaten ? [getRandomPoint(snake)] : [];
  return [...notEaten, ...added];
}

function getRandomNumber(min:number, max:number):number  {
  return Math.floor(Math.random() * (max - min + 1) + min);
}



  function isEmptyCell(position:Point, snake:Point[]) {
    return !snake.some((segment) => checkPoints(segment, position));
  }

 // return isEmptyCell(position, snake) ? position : getRandomPosition(snake);


export function generateApples(count: number) {
  return range(count).map(() => getRandomPoint());
}
export function initialSnake(length: number) {
  return range(length).map((i) => createPoint(i, 0));
}
export function checkHeadOutsideBounds(head:Point):Point {

  const hx = head.x >= COLS ? 0 : head.x < 0 ? COLS - 1 : head.x;
  const hy = head.y >= ROWS ? 0 : head.y < 0 ? ROWS - 1 : head.y;

  return { x: hx, y: hy };
}

export function nextMove(snake: Point[], move: { direction: Direction; length: number }): Point[] {
  const head = snake[0];

  const newHead = {
    x: head.x + move.direction.x,
    y: head.y + move.direction.y,
  };

  const appleEaten = move.length > snake.length;

  const newBody = appleEaten ? snake : snake.slice(0, -1);

  return [newHead, ...newBody].map(checkHeadOutsideBounds);
}

export function nextDirection(previous: Direction, next: Direction): Direction {
  // opposite direction is not allowed
  return previous.x === next.x || previous.y === next.y ? previous : next;
}

export function compareApples(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
export function compareObjects(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
export function compareXposition(x1:Point, x2:Point) {
  return x1.x < x2.x
}
export function compareYposition(y1:Point, y2:Point) {
  return y1.y > y2.y
}

