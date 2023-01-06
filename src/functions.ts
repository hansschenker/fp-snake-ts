import { COLS, ROWS, Direction, createPoint, Point } from "./constants";

const range = (l: number) => [...Array(l).keys()];
function checkCollision(a, b) {
  return a.x === b.x && a.y === b.y;
}
export function checkSnakeCollision(snake = []) {
  const [head, ...tail] = snake;
  return !tail.some((part) => checkCollision(part, head));
}

export function eat(apples: Point[], snake: Point[]) {
  const head = snake[0];
  const withoutEaten = apples.filter((apple) => !checkCollision(head, apple));
  const wasEaten = withoutEaten.length < apples.length;
  const added = wasEaten ? [getRandomPosition(snake)] : [];
  return [...withoutEaten, ...added];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomPosition(snake = []) {
  const position = {
    x: getRandomNumber(0, COLS - 1),
    y: getRandomNumber(0, ROWS - 1),
  };

  function isEmptyCell(position, snake) {
    return !snake.some((segment) => checkCollision(segment, position));
  }

  return isEmptyCell(position, snake) ? position : getRandomPosition(snake);
}

export function generateApples(count: number) {
  return range(count).map(() => getRandomPosition());
}
export function initialSnake(length: number) {
  return range(length).map((i) => createPoint(i, 0));
}
export function wrapBounds(point) {
  const x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x;

  const y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y;

  return { x, y };
}

export function move(
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
  return previous.x === next.x || previous.y === next.y ? next : previous;
}

export function compareObjects(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
