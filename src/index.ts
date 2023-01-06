import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  interval
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
  withLatestFrom
} from 'rxjs/operators';

import { createCanvasElement, render } from './canvas';
import { generateApples, initialSnake, move, nextDirection,
         eat, checkSnakeCollision, compareObjects } from './functions';
import { SNAKE_LENGTH, APPLE_COUNT, POINTS_PER_APPLE, GROW_PER_APPLE,
         SPEED, DIRECTIONS, INITIAL_DIRECTION, DirectionDown } from './constants';

const canvas = createCanvasElement();
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const tick$ = interval(SPEED);
const keyDown$ = fromEvent(document.body, 'keydown');
const direction$ = keyDown$
  .pipe(
    map((e: any) => DIRECTIONS[e.keyCode]),
    filter(Boolean),
    startWith(DirectionDown),
    scan(nextDirection),
    distinctUntilChanged()
  );

const increaseLength$ = new BehaviorSubject(0);
const snakeLength$ = increaseLength$
  .pipe(
    scan((snakeLength, grow) => snakeLength + grow, SNAKE_LENGTH)
  );

const snake$ = tick$
  .pipe(
    withLatestFrom(
      direction$,
      snakeLength$,
      (_, direction, snakeLength) => ({direction, snakeLength} )
    ),
    scan(move, initialSnake(SNAKE_LENGTH))
  );

const apples$ = snake$
  .pipe(
    scan(eat, generateApples(APPLE_COUNT)),
    distinctUntilChanged(compareObjects),
    share()
  );

const applesEaten$ = apples$
  .pipe(
    skip(1),
    map(_ => GROW_PER_APPLE)
  )
  .subscribe(v => increaseLength$.next(v));

const score$ = increaseLength$
  .pipe(
    skip(1),
    startWith(0),
    scan((score, _) => score + POINTS_PER_APPLE)
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
