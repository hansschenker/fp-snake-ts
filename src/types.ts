export type Point ={
    x: number;
    y: number;
  }
  export const createPoint = (x: number, y:number):Point =>  ({  x, y}) 
  
  export type Direction = {x: number; y: number}
  
  export const DirectionLeft: Direction = { x: -1, y: 0 };
  export const DirectionRight: Direction = { x: 1, y: 0 };
  export const DirectionUp: Direction = { x: 0, y: -1 };
  export const DirectionDown: Direction = { x: 0, y: 1 };

  export type Game = {snake: Point[], apples: Point[], score: number}