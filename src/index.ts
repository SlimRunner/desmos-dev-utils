import { Calc } from "Calc";
import { ItemModel, ExpressionModel } from "models";
import { ItemState } from "state";

export let calculator: Calc;

function defineCalc() {
  if (!(window as any).Calc) {
    setTimeout(defineCalc, 500);
  } else {
    calculator = (window as any).Calc;
  }
}

defineCalc();

interface Desv {
  getID: (index: number) => string;
  getIndex: (id: string) => number;
  changeTitle: (title: string) => void;
  renameAll: (regex: RegExp, repl: string) => void;
  addNamePrefixToAll: (prefix: string) => void;
  getLargestNumericID: () => string;
  batchEditor: (options: {
    filter?: (item: ItemState) => void;
    mapper?: (item: ItemState) => void;
  }) => void;
  listProps: (indices: number[]) => any[];
  enlistPropValues: (indices: number[]) => any[];
}

type DesvKeys<T> = {
  [key in keyof T]: Function;
};

type anyobj = { [key: string]: any };

declare global {
  interface Window {
    desv: DesvKeys<Desv>;
  }
}

let desv: DesvKeys<Desv> = Object.create(null);

desv.getID = (index: number) =>
  calculator.controller.getItemModelByIndex(index)?.id;

desv.getIndex = (id: string) => calculator.controller.getItemModel(id)?.index;

desv.changeTitle = (title: string) => {
  calculator._calc.globalHotkeys.mygraphsController.graphsController.currentGraph.title =
    title;
};

desv.batchEditor = (options: {
  filter?: (item: ItemState) => void;
  mapper?: (item: ItemState) => void;
}) => {
  const state = calculator.getState();
  state.expressions.list
    .filter(options.filter ?? (() => true))
    .forEach(options.mapper ?? (() => {}));
  calculator.setState(state, { allowUndo: true });
};

desv.listProps = (indices: number[] | undefined) => {
  const indexSet = new Set(indices);
  const state = calculator.getState();
  return state.expressions.list.reduce((acc: anyobj, curr, i) => {
    if (indices !== undefined && !indexSet.has(i)) {
      return acc;
    }

    const agregateSet = (obj: anyobj, prop: string, value: any) => {
      // in is not an issue here because obj is created from null
      if (!(prop in obj)) {
        obj[prop] = new Set();
        obj[prop].add(value);
      } else if (obj[prop] instanceof Set) {
        obj[prop].add(value);
      } else {
        throw TypeError("Object props must be a set");
      }
    };

    const isPrimitive = (v: any) => {
      return (
        typeof v === "number" || typeof v === "string" || typeof v === "boolean"
      );
    };

    const getValueTree = (obj: anyobj, src: ItemState | any) => {
      Object.entries(src).forEach(([k, v]) => {
        if ((v ?? null) !== null) {
          if (isPrimitive(v)) {
            agregateSet(obj, k, v);
          } else if (Array.isArray(v)) {
            v.forEach((subv) => {
              if (isPrimitive(subv)){
                agregateSet(obj, k, subv)
              } else {
                if (!(k in obj)) {
                  obj[k] = Object.create(null);
                }
                getValueTree(obj[k], subv)
              }
            });
          } else if (typeof v == "object") {
            if (!(k in obj)) {
              obj[k] = Object.create(null);
            }
            getValueTree(obj[k], v);
          }
        }
      });
    };

    getValueTree(acc, curr);
    return acc;
  }, Object.create(null));
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
  const filterReserved = (name: string) => {
    return !["x", "y"].some((t) => t === name);
  };
  const expressionWithTokenFilter = (item: ItemModel) => {
    return (
      item.type === "expression" &&
      (item as ExpressionModel).cachedAssignmentOrFunctionName.result !==
        undefined &&
      filterReserved(
        (item as ExpressionModel).cachedAssignmentOrFunctionName.result!.latex
      )
    );
  };

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

desv.getLargestNumericID = () => {
  type idnum = [string, number];
  const exprlist = calculator.getState().expressions.list;
  return exprlist
    .map((e) => [e.id, parseInt(e.id)] as idnum)
    .filter(([_, num]) => !isNaN(num))
    .reduce(([acid, acnum], [id, num]) =>
      acnum > num ? [acid, acnum] : [id, num]
    )[0];
};

window.desv = desv;
