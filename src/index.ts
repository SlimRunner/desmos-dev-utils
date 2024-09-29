import { calculator } from "Calc";
import { ItemModel, ExpressionModel } from "models";

interface Desv {
  changeTitle: (title: string) => void;
  renameAll: (regex: RegExp, repl: string) => void;
  addNamePrefixToAll: (prefix: string) => void;
}

type DesvKeys<T> = {
  [key in keyof T]: Function;
};

declare global {
  interface Window {
    desv: DesvKeys<Desv>;
  }
}

let desv: DesvKeys<Desv> = Object.create(null);

desv.changeTitle = (title: string) => {
  calculator._calc.globalHotkeys.mygraphsController.graphsController.currentGraph.setProperty(
    "title",
    title
  );
};

desv.renameAll = (regex: RegExp, repl: string) => {
  const expressionWithTokenFilter = (item: ItemModel) =>
    item.type === "expression" &&
    (item as ExpressionModel).cachedAssignmentOrFunctionName.result !==
      undefined;

  const tokens = calculator.controller
    .getAllItemModels()
    .filter(expressionWithTokenFilter)
    .map(
      (item) =>
        (item as ExpressionModel).cachedAssignmentOrFunctionName.result!.latex
    );

  const newTokens = tokens.map((item) => item.replace(regex, repl));

  tokens.forEach((token, i) => {
    const newToken = newTokens[i];
    if (token !== newToken) {
      calculator.controller.dispatch({
        type: "rename-identifier-global",
        search: token,
        replace: newToken,
      });
    }
  });
};

desv.addNamePrefixToAll = (prefix: string) => {
  if (prefix === "") {
    return;
  }
  const matchSub = /^(.+_.+)$/;
  const expressionWithTokenFilter = (item: ItemModel) =>
    item.type === "expression" &&
    (item as ExpressionModel).cachedAssignmentOrFunctionName.result !==
      undefined;

  const tokens = calculator.controller
    .getAllItemModels()
    .filter(expressionWithTokenFilter)
    .map(
      (item) =>
        (item as ExpressionModel).cachedAssignmentOrFunctionName.result!.latex
    );

  const newTokens = tokens.map((item) => {
    if (matchSub.test(item)) {
      return item.replace(/\}/, `${prefix}$&`);
    } else {
      return `${item}_\{${prefix}\}`;
    }
  });

  tokens.forEach((token, i) => {
    const newToken = newTokens[i];
    calculator.controller.dispatch({
      type: "rename-identifier-global",
      search: token,
      replace: newToken,
    });
  });
};

window.desv = desv;
