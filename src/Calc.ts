import { GraphState } from "state";
import { ItemModel } from "models";

export interface Controller {
  getAllItemModels: () => ItemModel[];
  dispatch: (e: any) => void;
}

export interface Calc {
  _calc: any;
  controller: Controller;
  getState: () => GraphState;
  setState: (
    state: GraphState,
    opts?: {
      allowUndo?: boolean;
      remapColors?: boolean;
    }
  ) => void;
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

export type CalcController = Calc["controller"];
