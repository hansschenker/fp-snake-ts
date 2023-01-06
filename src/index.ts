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
         nextApples, checkSnakeCollision, compareObjects, nextLength, nextScore, compareApples } from './functions';
import { SNAKE_LENGTH, APPLE_COUNT, POINTS_PER_APPLE, GROW_PER_APPLE,
         SPEED, DIRECTIONS, INITIAL_DIRECTION, DirectionDown, Point } from './constants';

const canvas = createCanvasElement();
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const tick$ = interval(SPEED);
const keyDown$ = fromEvent<KeyboardEvent>(document.body, 'keydown');
const direction$ = keyDown$
  .pipe(
    map((e: KeyboardEvent) => DIRECTIONS[e.keyCode]),
    filter(Boolean),
    startWith(DirectionDown),
    scan(nextDirection),
    distinctUntilChanged()
  );

const increaseLength$ = new BehaviorSubject(0);
const snakeLength$ = increaseLength$
  .pipe(
    scan(nextLength, SNAKE_LENGTH)
  );

const snake$ = tick$
  .pipe(
    withLatestFrom(
      direction$,
      snakeLength$,
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
  .subscribe(v => increaseLength$.next(v));

const score$ = increaseLength$
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
