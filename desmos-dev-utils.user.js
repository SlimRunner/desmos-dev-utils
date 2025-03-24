// ==UserScript==
// @name        desmos-dev-utils
// @namespace   slidav.Desmos
// @version     0.1.6
// @author      David Flores
// @description Web console utilities for Desmos
// @grant       none
// @match       https://*.desmos.com/calculator*
// @match       https://*.desmos.com/geometry*
// @match       https://*.desmos.com/3d*
// ==/UserScript==

/*jshint esversion: 6 */

"use strict";
(function() {
  // src/index.ts
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  var calculator;
  function defineCalc() {
    if (!window.Calc) {
      setTimeout(defineCalc, 500);
    } else {
      calculator = window.Calc;
    }
  }
  defineCalc();
  var desv = /* @__PURE__ */ Object.create(null);
  desv.getID = function(index) {
    var _calculator$controlle;
    return (_calculator$controlle = calculator.controller.getItemModelByIndex(index)) === null || _calculator$controlle === void 0 ? void 0 : _calculator$controlle.id;
  };
  desv.getIndex = function(id) {
    var _calculator$controlle2;
    return (_calculator$controlle2 = calculator.controller.getItemModel(id)) === null || _calculator$controlle2 === void 0 ? void 0 : _calculator$controlle2.index;
  };
  desv.changeTitle = function(title) {
    calculator._calc.globalHotkeys.mygraphsController.graphsController.currentGraph.title = title;
  };
  desv.batchEditor = function(options) {
    var _options$filter, _options$mapper;
    var state = calculator.getState();
    state.expressions.list.filter((_options$filter = options.filter) !== null && _options$filter !== void 0 ? _options$filter : function() {
      return true;
    }).forEach((_options$mapper = options.mapper) !== null && _options$mapper !== void 0 ? _options$mapper : function() {
    });
    calculator.setState(state, {
      allowUndo: true
    });
  };
  desv.listProps = function(indices) {
    var indexSet = new Set(indices);
    var state = calculator.getState();
    return state.expressions.list.reduce(function(acc, curr, i) {
      if (indices !== void 0 && !indexSet.has(i)) {
        return acc;
      }
      var agregateSet = function agregateSet2(obj, prop, value) {
        if (!(prop in obj)) {
          obj[prop] = /* @__PURE__ */ new Set();
          obj[prop].add(value);
        } else if (obj[prop] instanceof Set) {
          obj[prop].add(value);
        } else {
          throw TypeError("Object props must be a set");
        }
      };
      var isPrimitive = function isPrimitive2(v) {
        return typeof v === "number" || typeof v === "string" || typeof v === "boolean";
      };
      var _getValueTree = function getValueTree(obj, src) {
        Object.entries(src).forEach(function(_ref) {
          var _ref2 = _slicedToArray(_ref, 2), k = _ref2[0], v = _ref2[1];
          if ((v !== null && v !== void 0 ? v : null) !== null) {
            if (isPrimitive(v)) {
              agregateSet(obj, k, v);
            } else if (Array.isArray(v)) {
              v.forEach(function(subv) {
                if (isPrimitive(subv)) {
                  agregateSet(obj, k, subv);
                } else {
                  if (!(k in obj)) {
                    obj[k] = /* @__PURE__ */ Object.create(null);
                  }
                  _getValueTree(obj[k], subv);
                }
              });
            } else if (_typeof(v) == "object") {
              if (!(k in obj)) {
                obj[k] = /* @__PURE__ */ Object.create(null);
              }
              _getValueTree(obj[k], v);
            }
          }
        });
      };
      _getValueTree(acc, curr);
      return acc;
    }, /* @__PURE__ */ Object.create(null));
  };
  desv.renameAll = function(regex, repl) {
    var expressionWithTokenFilter = function expressionWithTokenFilter2(item) {
      return item.type === "expression" && item.cachedAssignmentOrFunctionName.result !== void 0;
    };
    var tokens = calculator.controller.getAllItemModels().filter(expressionWithTokenFilter).map(function(item) {
      return item.cachedAssignmentOrFunctionName.result.latex;
    });
    var newTokens = tokens.map(function(item) {
      return item.replace(regex, repl);
    });
    tokens.forEach(function(token, i) {
      var newToken = newTokens[i];
      if (token !== newToken) {
        calculator.controller.dispatch({
          type: "rename-identifier-global",
          search: token,
          replace: newToken
        });
      }
    });
  };
  desv.addNamePrefixToAll = function(prefix) {
    if (prefix === "") {
      return;
    }
    var matchSub = /^(.+_.+)$/;
    var filterReserved = function filterReserved2(name) {
      return !["x", "y"].some(function(t) {
        return t === name;
      });
    };
    var expressionWithTokenFilter = function expressionWithTokenFilter2(item) {
      return item.type === "expression" && item.cachedAssignmentOrFunctionName.result !== void 0 && filterReserved(item.cachedAssignmentOrFunctionName.result.latex);
    };
    var tokens = calculator.controller.getAllItemModels().filter(expressionWithTokenFilter).map(function(item) {
      return item.cachedAssignmentOrFunctionName.result.latex;
    });
    var newTokens = tokens.map(function(item) {
      if (matchSub.test(item)) {
        return item.replace(/\}/, "".concat(prefix, "$&"));
      } else {
        return "".concat(item, "_{").concat(prefix, "}");
      }
    });
    tokens.forEach(function(token, i) {
      var newToken = newTokens[i];
      calculator.controller.dispatch({
        type: "rename-identifier-global",
        search: token,
        replace: newToken
      });
    });
  };
  desv.getLargestNumericID = function() {
    var exprlist = calculator.getState().expressions.list;
    return exprlist.map(function(e) {
      return [e.id, parseInt(e.id)];
    }).filter(function(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2), _ = _ref4[0], num = _ref4[1];
      return !isNaN(num);
    }).reduce(function(_ref5, _ref6) {
      var _ref7 = _slicedToArray(_ref5, 2), acid = _ref7[0], acnum = _ref7[1];
      var _ref8 = _slicedToArray(_ref6, 2), id = _ref8[0], num = _ref8[1];
      return acnum > num ? [acid, acnum] : [id, num];
    })[0];
  };
  window.desv = desv;
})();
