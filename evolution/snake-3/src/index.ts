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
  startWith,
  withLatestFrom,
  skip
} from 'rxjs/operators';
import { createCanvasElement, render } from './canvas';
import { nextDirection, move, generateSnake } from './functions';
import { SPEED, KEY_DIRECTIONS, INITIAL_DIRECTION, INITIAL_SNAKE_LENGTH,
         GROW_PER_APPLE } from './constants';

const canvas = createCanvasElement();
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const tick$ = interval(SPEED);
const keyDown$ = fromEvent(document.body, 'keydown');
const direction$ = keyDown$
  .pipe(
    map((e: any) => KEY_DIRECTIONS[e.keyCode]),
    filter(Boolean),
    startWith(INITIAL_DIRECTION),
    scan(nextDirection),
    distinctUntilChanged()
  );

const growState$ = new BehaviorSubject(0);
const growStateChange$ = growState$
  .pipe(
    scan((length, grow) => length + grow, INITIAL_SNAKE_LENGTH)
  );

const score$ = growState$
  .pipe(
    skip(1),
    startWith(0),
    scan((score, _) => score + GROW_PER_APPLE)
  );

const snake$ = tick$
  .pipe(
    withLatestFrom(
      direction$,
      growStateChange$,
      (_, direction, snakeLength) => ({ direction, snakeLength })
    ),
    scan(move, generateSnake(INITIAL_SNAKE_LENGTH))
  );

const scene$ = combineLatest(
  snake$, direction$, growStateChange$, score$,
  (snake, direction, length, score) => ({ snake, direction, length, score })
);

const game$ = tick$
  .pipe(
    withLatestFrom(scene$, (_, scene) => scene)
  );

game$.subscribe(scene => render(ctx, scene));




// reduce((acc, curr) => newAcc, defaultAcc);
// reduce((resultingValue, newcomingValue) => newResultingValue, defaultValue);
