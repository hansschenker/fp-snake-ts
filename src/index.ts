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
import { Direction, DirectionDown, Game, Point } from "./types";

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
const keyDownChange$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document.body, "keydown");
const directionChange$ = keyDownChange$.pipe(
  keyboardToDirections$,
  directionToNextDirection$
);
// track apples eaten to calculate score
const growLengthState$ = new BehaviorSubject(0);
const growLengthChange$ : Observable<number> = growLengthState$.pipe(scan(nextGrow, SNAKE_LENGTH));

const tickChange$: Observable<number> = interval(SPEED);

// sanke position for scene
const snakePositionChange$:Observable<Point[]> = tickChange$.pipe(
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
const scoreChange$:Observable<number> = growLengthState$.pipe(
  skip(1),
  startWith(0),
  scan(nextScore)
);



const gameChange$: Observable<Game> = combineLatest(
  snakePositionChange$,
  applesPositionChange$,
  scoreChange$,
  (snake, apples, score) => ({ snake, apples, score })
);

const gameLoopChange$: Observable<Game> = tickChange$.pipe(
  withLatestFrom(gameChange$, (_, game) => game),
  takeWhile((game) => checkSnakeHasNotCollided(game.snake))
);

gameLoopChange$.subscribe((game) => render(ctx, game));
