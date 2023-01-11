import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  interval,
  Observable
} from 'rxjs';
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
  withLatestFrom
} from 'rxjs/operators';

import { createCanvasElement, render } from './canvas';
import { generateApples, initialSnake, nextMove, nextDirection,
         nextApples, checkSnakeHasNotCollided, compareObjects, nextGrow, nextScore, compareApples } from './functions';

import { SNAKE_LENGTH, APPLE_COUNT, POINTS_PER_APPLE, GROW_PER_APPLE,
         SPEED, DIRECTIONS, INITIAL_DIRECTION,  } from './constants';
import { Direction, DirectionDown, Point } from './types';

const canvas = createCanvasElement();
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const tick$ = interval(SPEED);

// arrows to directions
const keyboardToDirections$  = (src: Observable<KeyboardEvent>):Observable<Direction> => {
  return src.pipe(
    map((e: KeyboardEvent) => DIRECTIONS[e.keyCode]),
    filter(Boolean),
    startWith(DirectionDown),
  )
}

// check next direction (opposite direction not allowed)
const directionToNextDirection$ = (src:Observable<Direction> ) => {
    return src.pipe(
      scan(nextDirection),
      distinctUntilChanged()
    )
}
const keyDown$ = fromEvent<KeyboardEvent>(document.body, 'keydown');
const directionChange$ = keyDown$
  .pipe(
    keyboardToDirections$,
    directionToNextDirection$
  );
// track apples eaten to calculate score
const growLength$ = new BehaviorSubject(0);
const growLengthChange$ = growLength$
  .pipe(
    scan(nextGrow, SNAKE_LENGTH)
  );

  // sanke position for scene
const snakePosition$ = tick$
  .pipe(
    withLatestFrom(
      directionChange$,
      growLengthChange$,
      (_, direction, length) => ({direction, length} )
    ),
    scan(nextMove, initialSnake(SNAKE_LENGTH))
  );

  // apples positions for scene
const applesPositions$:Observable<Point[]> = snakePosition$
  .pipe(
    scan(nextApples, generateApples(APPLE_COUNT)),
    distinctUntilChanged(compareApples),
    share()
  );

const eatenGrowLength$ = applesPositions$
  .pipe(
    skip(1), // initial apple creation
    map(_ => GROW_PER_APPLE)
  ).subscribe((grow:number) => growLength$.next(grow));

// score for scene
const scoreChange$ = growLength$
  .pipe(
    skip(1),
    startWith(0),
    scan(nextScore)
  );

const sceneChange$ = combineLatest(
  snakePosition$, applesPositions$, scoreChange$,
  (snake, apples, score) => ({ snake, apples, score })
);

const gameChange$ = tick$
  .pipe(
    withLatestFrom(sceneChange$, (_, scene) => scene),
    takeWhile(scene => checkSnakeHasNotCollided(scene.snake))
  );

gameChange$.subscribe(scene => render(ctx, scene));
