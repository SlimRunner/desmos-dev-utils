import { calculator } from "Calc";

class Desv {
  changeTitle(title: string) {
    calculator._calc.globalHotkeys.mygraphsController.graphsController.currentGraph.setProperty(
      "title",
      title
    );
  }
}

declare global {
  interface Window {
    desv: Desv
  }
}

window.desv = new Desv();

