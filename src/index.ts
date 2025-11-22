import { Calc } from "Calc";
import { ItemModel, TableModel, ExpressionModel } from "models";
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
  batchMutate: (
    mutator: (item: ItemState, index: number) => void,
    filter?: (item: ItemState, index: number) => boolean,
  ) => void;
  batchTransform: (
    transform: (item: ItemState, index: number) => ItemState,
    filter?: (item: ItemState, index: number) => boolean,
  ) => void;
  listProps: (indices: number[]) => any[];
  tableLoader: (text: string, rowSep: string, colSep: string) => void;
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
  const gc = calculator?._calc?.globalHotkeys?.shellController?.graphsController;
  gc.currentGraph.title = title;
};

desv.batchMutate = (
  mutator: (item: ItemState, index: number) => ItemState,
  filter?: (item: ItemState, index: number) => boolean,
) => {
  const state = calculator.getState();

  state.expressions.list
    .filter(filter ?? (() => true))
    .forEach(mutator);

  calculator.setState(state, { allowUndo: true });
};

desv.batchTransform = (
  transform: (item: ItemState, index: number) => ItemState,
  filter?: (item: ItemState, index: number) => boolean,
) => {
  const state = calculator.getState();

  state.expressions.list = state.expressions.list.map((e, i) =>
    (filter ?? (() => true))(e, i) ? transform(e, i) : e
  );
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

desv.tableLoader = (text: string, rowSep = "\n", colSep = ",") => {
  const table = text.split(rowSep).map(row => row.split(colSep));
  const transpose: string[][] = table[0].map(() => []);
  table.forEach((row) => row.map((col, i) => transpose[i].push(col)));
  const columns = transpose.map((e) => {
    return {
      latex: e[0],
      values: e.slice(1)
    }
  })
  calculator.setExpression(
    {
      type: "table",
      columns,
    }
  )
}

window.desv = desv;
