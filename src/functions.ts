import { POINTS_PER_APPLE } from './../evolution/snake-3/src/constants';
import { COLS, ROWS,  } from "./constants";
import { createPoint, Direction, Point } from './types';

export const nextScore = (score: number) => score + POINTS_PER_APPLE

export const nextGrow = (length:number, grow:number) => length + grow

const range = (l: number) => [...Array(l).keys()];

function checkPointCollision(a:Point, b:Point):boolean {
  return a.x === b.x && a.y === b.y;
}
export function checkSnakeCollision(snake = []) {
  const [head, ...tail] = snake;
  return !tail.some((part) => checkPointCollision(part, head));
}
function getRandomPoint(snake = []):Point {
  return  {
    x: getRandomNumber(0, COLS - 1),
    y: getRandomNumber(0, ROWS - 1),
  };
}

export function nextApples(apples: Point[], snake: Point[]):Point[] {
  const head = snake[0];
  const notEaten = apples.filter((apple) => !checkPointCollision(head, apple));
  const wasEaten = notEaten.length < apples.length;
  const added = wasEaten ? [getRandomPoint(snake)] : [];
  return [...notEaten, ...added];
}

function getRandomNumber(min:number, max:number):number  {
  return Math.floor(Math.random() * (max - min + 1) + min);
}



  function isEmptyCell(position:Point, snake:Point[]) {
    return !snake.some((segment) => checkPointCollision(segment, position));
  }

 // return isEmptyCell(position, snake) ? position : getRandomPosition(snake);


export function generateApples(count: number) {
  return range(count).map(() => getRandomPoint());
}
export function initialSnake(length: number) {
  return range(length).map((i) => createPoint(i, 0));
}
export function wrapBounds(point) {
  const x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x;

  const y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y;

  return { x, y };
}

export function nextMove(
  snake: Point[],
  to: { direction: Direction; snakeLength: number }
): Point[] {
  const head = snake[0];

  const newHead = {
    x: head.x + to.direction.x,
    y: head.y + to.direction.y,
  };

  const ateApple = to.snakeLength > snake.length;

  const newBody = ateApple ? snake : snake.slice(0, -1);

  return [newHead, ...newBody].map(wrapBounds);
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

