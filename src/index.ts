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
         nextApples, checkSnakeCollision, compareObjects, nextGrow, nextScore, compareApples } from './functions';

import { SNAKE_LENGTH, APPLE_COUNT, POINTS_PER_APPLE, GROW_PER_APPLE,
         SPEED, DIRECTIONS, INITIAL_DIRECTION,  } from './constants';
import { DirectionDown, Point } from './types';

const canvas = createCanvasElement();
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const tick$ = interval(SPEED);
export type Direction = {x: number; y: number}

const keyboardToDirections$  = (src: Observable<KeyboardEvent>):Observable<Direction> => {
  return src.pipe(
    map((e: KeyboardEvent) => DIRECTIONS[e.keyCode]),
    filter(Boolean),
    startWith(DirectionDown),
  )
}
const directionToNextDirection$ = (src:Observable<Direction> ) => {

    return src.pipe(
      scan(nextDirection),
      distinctUntilChanged()
    )
}
const keyDown$ = fromEvent<KeyboardEvent>(document.body, 'keydown');
const direction$ = keyDown$
  .pipe(
    keyboardToDirections$,
    // map((e: KeyboardEvent) => DIRECTIONS[e.keyCode]),
    // filter(Boolean),
    // startWith(DirectionDown),
    directionToNextDirection$
    // scan(nextDirection),
    // distinctUntilChanged()
  );

const growState$ = new BehaviorSubject(0);
const growStateChange$ = growState$
  .pipe(
    scan(nextGrow, SNAKE_LENGTH)
  );

const snake$ = tick$
  .pipe(
    withLatestFrom(
      direction$,
      growStateChange$,
      (_, direction, snakeLength) => ({direction, snakeLength} )
    ),
    scan(nextMove, initialSnake(SNAKE_LENGTH))
  );

const apples$:Observable<Point[]> = snake$
  .pipe(
    scan(nextApples, generateApples(APPLE_COUNT)),
    distinctUntilChanged(compareApples),
    share()
  );

const eatenToLength$ = apples$
  .pipe(
    skip(1), // initial apple creation
    map(_ => GROW_PER_APPLE)
  )
  .subscribe(v => growState$.next(v));

const score$ = growState$
  .pipe(
    skip(1),
    startWith(0),
    scan(nextScore)
  );

const scene$ = combineLatest(
  snake$, apples$, score$,
  (snake, apples, score) => ({ snake, apples, score })
);

const game$ = tick$
  .pipe(
    withLatestFrom(scene$, (_, scene) => scene),
    takeWhile(scene => checkSnakeCollision(scene.snake))
  );

game$.subscribe(scene => render(ctx, scene));
