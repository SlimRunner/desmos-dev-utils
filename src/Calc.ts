import { GraphState } from "State";

export interface Calc {
  _calc: any;
  controller: any;
  getState: (opts: any) => GraphState;
  setState: (state: GraphState, opts: any) => GraphState;
}

export const calculator: Calc = (window as any).Calc;
