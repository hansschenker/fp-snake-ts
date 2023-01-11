import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  interval,
  Observable,
} from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  share,
  skip,
  startWith,
  takeWhile,
  tap,
  withLatestFrom,
} from "rxjs/operators";

import { createCanvasElement, render } from "./canvas";
// functions
import {
  generateApples,
  initialSnake,
  nextMove,
  nextDirection,
  checkSnakeHasNotCollided,
  compareObjects,
  nextGrow,
  nextScore,
  compareApples,
  nextApplePositions,
} from "./functions";
// constants
import {
  SNAKE_LENGTH,
  APPLE_COUNT,
  POINTS_PER_APPLE,
  GROW_PER_APPLE,
  SPEED,
  DIRECTIONS,
  INITIAL_DIRECTION,
} from "./constants";

// types
import { Direction, DirectionDown, Point } from "./types";

const canvas = createCanvasElement();
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// arrow keys to directions {x,y}
const keyboardToDirections$ = (
  src: Observable<KeyboardEvent>
): Observable<Direction> => {
  return src.pipe(
    map((e: KeyboardEvent) => DIRECTIONS[e.keyCode]),
    filter(Boolean),
    startWith(DirectionDown)
  );
};

// check next direction (opposite direction not allowed)
const directionToNextDirection$ = (src: Observable<Direction>) => {
  return src.pipe(scan(nextDirection), distinctUntilChanged());
};
const keyDownChange$ = fromEvent<KeyboardEvent>(document.body, "keydown");
const directionChange$ = keyDownChange$.pipe(
  keyboardToDirections$,
  directionToNextDirection$
);
// track apples eaten to calculate score
const growLengthState$ = new BehaviorSubject(0);
const growLengthChange$ = growLengthState$.pipe(scan(nextGrow, SNAKE_LENGTH));

const tick$ = interval(SPEED);
// sanke position for scene
const snakePositionChange$ = tick$.pipe(
  withLatestFrom(
    directionChange$,
    growLengthChange$,
    (_, direction, length) => ({ direction, length })
  ),
  scan(nextMove, initialSnake(SNAKE_LENGTH))
);

// apples positions for scene
const applesPositionChange$: Observable<Point[]> = snakePositionChange$.pipe(
  scan(nextApplePositions, generateApples(APPLE_COUNT)),
  distinctUntilChanged(compareApples),
  share()
);

const appleEatenGrowLengthState$ = applesPositionChange$
  .pipe(
    skip(1), // initial apple creation
    map((_) => GROW_PER_APPLE)
  )
  .subscribe((grow: number) => growLengthState$.next(grow));

// score for scene
const scoreChange$ = growLengthState$.pipe(
  skip(1),
  startWith(0),
  scan(nextScore)
);

const sceneChange$ = combineLatest(
  snakePositionChange$,
  applesPositionChange$,
  scoreChange$,
  (snake, apples, score) => ({ snake, apples, score })
);

const gameChange$ = tick$.pipe(
  withLatestFrom(sceneChange$, (_, scene) => scene),
  takeWhile((scene) => checkSnakeHasNotCollided(scene.snake))
);

gameChange$.subscribe((scene) => render(ctx, scene));
