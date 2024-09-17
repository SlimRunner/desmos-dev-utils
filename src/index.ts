import { calculator } from "Calc";

interface Desv {
  changeTitle: (title: string) => void;
}

type DesvKeys<T> = {
  [key in keyof T]: Function;
}

declare global {
  interface Window {
    desv: DesvKeys<Desv>
  }
}

let desv: DesvKeys<Desv> = Object.create(null);

desv.changeTitle = (title: string) => {
  calculator._calc.globalHotkeys.mygraphsController.graphsController.currentGraph.setProperty(
    "title",
    title
  );
}

window.desv = desv;
