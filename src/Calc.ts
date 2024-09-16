import { GraphState } from "State";

export interface Calc {
  _calc: any;
  controller: any;
  getState: (opts: any) => GraphState;
  setState: (state: GraphState, opts: any) => GraphState;
}

export let calculator: Calc;

function defineCalc() {
  if (!(window as any).Calc) {
    setTimeout(defineCalc, 500);
  } else {
    calculator = (window as any).Calc;
  }
}

defineCalc();
