// ==UserScript==
// @name        desmos-dev-utils
// @namespace   slidav.Desmos
// @version     0.1.4
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
    }).filter(function(_ref) {
      var _ref2 = _slicedToArray(_ref, 2), _ = _ref2[0], num = _ref2[1];
      return !isNaN(num);
    }).reduce(function(_ref3, _ref4) {
      var _ref5 = _slicedToArray(_ref3, 2), acid = _ref5[0], acnum = _ref5[1];
      var _ref6 = _slicedToArray(_ref4, 2), id = _ref6[0], num = _ref6[1];
      return acnum > num ? [acid, acnum] : [id, num];
    })[0];
  };
  window.desv = desv;
})();
