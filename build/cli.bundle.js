// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std/_util/assert", [], function (exports_1, context_1) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_1 && context_1.id;
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
        if (!expr) {
            throw new DenoStdInternalError(msg);
        }
    }
    exports_1("assert", assert);
    return {
        setters: [],
        execute: function () {
            DenoStdInternalError = class DenoStdInternalError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "DenoStdInternalError";
                }
            };
            exports_1("DenoStdInternalError", DenoStdInternalError);
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std/flags/mod", ["https://deno.land/std/_util/assert"], function (exports_2, context_2) {
    "use strict";
    var assert_ts_1;
    var __moduleName = context_2 && context_2.id;
    function get(obj, key) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return obj[key];
        }
    }
    function getForce(obj, key) {
        const v = get(obj, key);
        assert_ts_1.assert(v != null);
        return v;
    }
    function isNumber(x) {
        if (typeof x === "number")
            return true;
        if (/^0x[0-9a-f]+$/i.test(String(x)))
            return true;
        return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
    }
    function hasKey(obj, keys) {
        let o = obj;
        keys.slice(0, -1).forEach((key) => {
            o = (get(o, key) ?? {});
        });
        const key = keys[keys.length - 1];
        return key in o;
    }
    /** Take a set of command line arguments, with an optional set of options, and
     * return an object representation of those argument.
     *
     *      const parsedArgs = parse(Deno.args);
     */
    function parse(args, { "--": doubleDash = false, alias = {}, boolean = false, default: defaults = {}, stopEarly = false, string = [], unknown = (i) => i, } = {}) {
        const flags = {
            bools: {},
            strings: {},
            unknownFn: unknown,
            allBools: false,
        };
        if (boolean !== undefined) {
            if (typeof boolean === "boolean") {
                flags.allBools = !!boolean;
            }
            else {
                const booleanArgs = typeof boolean === "string" ? [boolean] : boolean;
                for (const key of booleanArgs.filter(Boolean)) {
                    flags.bools[key] = true;
                }
            }
        }
        const aliases = {};
        if (alias !== undefined) {
            for (const key in alias) {
                const val = getForce(alias, key);
                if (typeof val === "string") {
                    aliases[key] = [val];
                }
                else {
                    aliases[key] = val;
                }
                for (const alias of getForce(aliases, key)) {
                    aliases[alias] = [key].concat(aliases[key].filter((y) => alias !== y));
                }
            }
        }
        if (string !== undefined) {
            const stringArgs = typeof string === "string" ? [string] : string;
            for (const key of stringArgs.filter(Boolean)) {
                flags.strings[key] = true;
                const alias = get(aliases, key);
                if (alias) {
                    for (const al of alias) {
                        flags.strings[al] = true;
                    }
                }
            }
        }
        const argv = { _: [] };
        function argDefined(key, arg) {
            return ((flags.allBools && /^--[^=]+$/.test(arg)) ||
                get(flags.bools, key) ||
                !!get(flags.strings, key) ||
                !!get(aliases, key));
        }
        function setKey(obj, keys, value) {
            let o = obj;
            keys.slice(0, -1).forEach(function (key) {
                if (get(o, key) === undefined) {
                    o[key] = {};
                }
                o = get(o, key);
            });
            const key = keys[keys.length - 1];
            if (get(o, key) === undefined ||
                get(flags.bools, key) ||
                typeof get(o, key) === "boolean") {
                o[key] = value;
            }
            else if (Array.isArray(get(o, key))) {
                o[key].push(value);
            }
            else {
                o[key] = [get(o, key), value];
            }
        }
        function setArg(key, val, arg = undefined) {
            if (arg && flags.unknownFn && !argDefined(key, arg)) {
                if (flags.unknownFn(arg, key, val) === false)
                    return;
            }
            const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
            setKey(argv, key.split("."), value);
            const alias = get(aliases, key);
            if (alias) {
                for (const x of alias) {
                    setKey(argv, x.split("."), value);
                }
            }
        }
        function aliasIsBoolean(key) {
            return getForce(aliases, key).some((x) => typeof get(flags.bools, x) === "boolean");
        }
        for (const key of Object.keys(flags.bools)) {
            setArg(key, defaults[key] === undefined ? false : defaults[key]);
        }
        let notFlags = [];
        // all args after "--" are not parsed
        if (args.includes("--")) {
            notFlags = args.slice(args.indexOf("--") + 1);
            args = args.slice(0, args.indexOf("--"));
        }
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (/^--.+=/.test(arg)) {
                const m = arg.match(/^--([^=]+)=(.*)$/s);
                assert_ts_1.assert(m != null);
                const [, key, value] = m;
                if (flags.bools[key]) {
                    const booleanValue = value !== "false";
                    setArg(key, booleanValue, arg);
                }
                else {
                    setArg(key, value, arg);
                }
            }
            else if (/^--no-.+/.test(arg)) {
                const m = arg.match(/^--no-(.+)/);
                assert_ts_1.assert(m != null);
                setArg(m[1], false, arg);
            }
            else if (/^--.+/.test(arg)) {
                const m = arg.match(/^--(.+)/);
                assert_ts_1.assert(m != null);
                const [, key] = m;
                const next = args[i + 1];
                if (next !== undefined &&
                    !/^-/.test(next) &&
                    !get(flags.bools, key) &&
                    !flags.allBools &&
                    (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, next, arg);
                    i++;
                }
                else if (/^(true|false)$/.test(next)) {
                    setArg(key, next === "true", arg);
                    i++;
                }
                else {
                    setArg(key, get(flags.strings, key) ? "" : true, arg);
                }
            }
            else if (/^-[^-]+/.test(arg)) {
                const letters = arg.slice(1, -1).split("");
                let broken = false;
                for (let j = 0; j < letters.length; j++) {
                    const next = arg.slice(j + 2);
                    if (next === "-") {
                        setArg(letters[j], next, arg);
                        continue;
                    }
                    if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                        setArg(letters[j], next.split("=")[1], arg);
                        broken = true;
                        break;
                    }
                    if (/[A-Za-z]/.test(letters[j]) &&
                        /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                        setArg(letters[j], next, arg);
                        broken = true;
                        break;
                    }
                    if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                        setArg(letters[j], arg.slice(j + 2), arg);
                        broken = true;
                        break;
                    }
                    else {
                        setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                    }
                }
                const [key] = arg.slice(-1);
                if (!broken && key !== "-") {
                    if (args[i + 1] &&
                        !/^(-|--)[^-]/.test(args[i + 1]) &&
                        !get(flags.bools, key) &&
                        (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                        setArg(key, args[i + 1], arg);
                        i++;
                    }
                    else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                        setArg(key, args[i + 1] === "true", arg);
                        i++;
                    }
                    else {
                        setArg(key, get(flags.strings, key) ? "" : true, arg);
                    }
                }
            }
            else {
                if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                    argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
                }
                if (stopEarly) {
                    argv._.push(...args.slice(i + 1));
                    break;
                }
            }
        }
        for (const key of Object.keys(defaults)) {
            if (!hasKey(argv, key.split("."))) {
                setKey(argv, key.split("."), defaults[key]);
                if (aliases[key]) {
                    for (const x of aliases[key]) {
                        setKey(argv, x.split("."), defaults[key]);
                    }
                }
            }
        }
        if (doubleDash) {
            argv["--"] = [];
            for (const key of notFlags) {
                argv["--"].push(key);
            }
        }
        else {
            for (const key of notFlags) {
                argv._.push(key);
            }
        }
        return argv;
    }
    exports_2("parse", parse);
    return {
        setters: [
            function (assert_ts_1_1) {
                assert_ts_1 = assert_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@v0.51.0/fmt/colors", [], function (exports_3, context_3) {
    "use strict";
    var noColor, enabled;
    var __moduleName = context_3 && context_3.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_3("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_3("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_3("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_3("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_3("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_3("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_3("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_3("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_3("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_3("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_3("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_3("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_3("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_3("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_3("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_3("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_3("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_3("white", white);
    function gray(str) {
        return run(str, code([90], 39));
    }
    exports_3("gray", gray);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_3("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_3("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_3("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_3("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_3("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_3("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_3("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_3("bgWhite", bgWhite);
    /* Special Color Sequences */
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    /** Set text color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_3("rgb8", rgb8);
    /** Set background color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_3("bgRgb8", bgRgb8);
    /** Set text color using 24bit rgb. */
    function rgb24(str, color) {
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_3("rgb24", rgb24);
    /** Set background color using 24bit rgb. */
    function bgRgb24(str, color) {
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_3("bgRgb24", bgRgb24);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            /**
             * A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
             * on npm.
             *
             * ```
             * import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
             * console.log(bgBlue(red(bold("Hello world!"))));
             * ```
             *
             * This module supports `NO_COLOR` environmental variable disabling any coloring
             * if `NO_COLOR` is set.
             */
            noColor = Deno.noColor;
            enabled = !noColor;
        }
    };
});
System.register("https://deno.land/std@v0.51.0/testing/diff", [], function (exports_4, context_4) {
    "use strict";
    var DiffType, REMOVED, COMMON, ADDED;
    var __moduleName = context_4 && context_4.id;
    function createCommon(A, B, reverse) {
        const common = [];
        if (A.length === 0 || B.length === 0)
            return [];
        for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
            if (A[reverse ? A.length - i - 1 : i] === B[reverse ? B.length - i - 1 : i]) {
                common.push(A[reverse ? A.length - i - 1 : i]);
            }
            else {
                return common;
            }
        }
        return common;
    }
    function diff(A, B) {
        const prefixCommon = createCommon(A, B);
        const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
        A = suffixCommon.length
            ? A.slice(prefixCommon.length, -suffixCommon.length)
            : A.slice(prefixCommon.length);
        B = suffixCommon.length
            ? B.slice(prefixCommon.length, -suffixCommon.length)
            : B.slice(prefixCommon.length);
        const swapped = B.length > A.length;
        [A, B] = swapped ? [B, A] : [A, B];
        const M = A.length;
        const N = B.length;
        if (!M && !N && !suffixCommon.length && !prefixCommon.length)
            return [];
        if (!N) {
            return [
                ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
                ...A.map((a) => ({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a,
                })),
                ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ];
        }
        const offset = N;
        const delta = M - N;
        const size = M + N + 1;
        const fp = new Array(size).fill({ y: -1 });
        /**
         * INFO:
         * This buffer is used to save memory and improve performance.
         * The first half is used to save route and last half is used to save diff
         * type.
         * This is because, when I kept new uint8array area to save type,performance
         * worsened.
         */
        const routes = new Uint32Array((M * N + size + 1) * 2);
        const diffTypesPtrOffset = routes.length / 2;
        let ptr = 0;
        let p = -1;
        function backTrace(A, B, current, swapped) {
            const M = A.length;
            const N = B.length;
            const result = [];
            let a = M - 1;
            let b = N - 1;
            let j = routes[current.id];
            let type = routes[current.id + diffTypesPtrOffset];
            while (true) {
                if (!j && !type)
                    break;
                const prev = j;
                if (type === REMOVED) {
                    result.unshift({
                        type: swapped ? DiffType.removed : DiffType.added,
                        value: B[b],
                    });
                    b -= 1;
                }
                else if (type === ADDED) {
                    result.unshift({
                        type: swapped ? DiffType.added : DiffType.removed,
                        value: A[a],
                    });
                    a -= 1;
                }
                else {
                    result.unshift({ type: DiffType.common, value: A[a] });
                    a -= 1;
                    b -= 1;
                }
                j = routes[prev];
                type = routes[prev + diffTypesPtrOffset];
            }
            return result;
        }
        function createFP(slide, down, k, M) {
            if (slide && slide.y === -1 && down && down.y === -1) {
                return { y: 0, id: 0 };
            }
            if ((down && down.y === -1) ||
                k === M ||
                (slide && slide.y) > (down && down.y) + 1) {
                const prev = slide.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = ADDED;
                return { y: slide.y, id: ptr };
            }
            else {
                const prev = down.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = REMOVED;
                return { y: down.y + 1, id: ptr };
            }
        }
        function snake(k, slide, down, _offset, A, B) {
            const M = A.length;
            const N = B.length;
            if (k < -N || M < k)
                return { y: -1, id: -1 };
            const fp = createFP(slide, down, k, M);
            while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
                const prev = fp.id;
                ptr++;
                fp.id = ptr;
                fp.y += 1;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = COMMON;
            }
            return fp;
        }
        while (fp[delta + offset].y < N) {
            p = p + 1;
            for (let k = -p; k < delta; ++k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            for (let k = delta + p; k > delta; --k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
        }
        return [
            ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ...backTrace(A, B, fp[delta + offset], swapped),
            ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
        ];
    }
    exports_4("default", diff);
    return {
        setters: [],
        execute: function () {
            (function (DiffType) {
                DiffType["removed"] = "removed";
                DiffType["common"] = "common";
                DiffType["added"] = "added";
            })(DiffType || (DiffType = {}));
            exports_4("DiffType", DiffType);
            REMOVED = 1;
            COMMON = 2;
            ADDED = 3;
        }
    };
});
System.register("https://deno.land/std@v0.51.0/testing/asserts", ["https://deno.land/std@v0.51.0/fmt/colors", "https://deno.land/std@v0.51.0/testing/diff"], function (exports_5, context_5) {
    "use strict";
    var colors_ts_1, diff_ts_1, CAN_NOT_DISPLAY, AssertionError;
    var __moduleName = context_5 && context_5.id;
    function format(v) {
        let string = Deno.inspect(v);
        if (typeof v == "string") {
            string = `"${string.replace(/(?=["\\])/g, "\\")}"`;
        }
        return string;
    }
    function createColor(diffType) {
        switch (diffType) {
            case diff_ts_1.DiffType.added:
                return (s) => colors_ts_1.green(colors_ts_1.bold(s));
            case diff_ts_1.DiffType.removed:
                return (s) => colors_ts_1.red(colors_ts_1.bold(s));
            default:
                return colors_ts_1.white;
        }
    }
    function createSign(diffType) {
        switch (diffType) {
            case diff_ts_1.DiffType.added:
                return "+   ";
            case diff_ts_1.DiffType.removed:
                return "-   ";
            default:
                return "    ";
        }
    }
    function buildMessage(diffResult) {
        const messages = [];
        messages.push("");
        messages.push("");
        messages.push(`    ${colors_ts_1.gray(colors_ts_1.bold("[Diff]"))} ${colors_ts_1.red(colors_ts_1.bold("Actual"))} / ${colors_ts_1.green(colors_ts_1.bold("Expected"))}`);
        messages.push("");
        messages.push("");
        diffResult.forEach((result) => {
            const c = createColor(result.type);
            messages.push(c(`${createSign(result.type)}${result.value}`));
        });
        messages.push("");
        return messages;
    }
    function isKeyedCollection(x) {
        return [Symbol.iterator, "size"].every((k) => k in x);
    }
    function equal(c, d) {
        const seen = new Map();
        return (function compare(a, b) {
            // Have to render RegExp & Date for string comparison
            // unless it's mistreated as object
            if (a &&
                b &&
                ((a instanceof RegExp && b instanceof RegExp) ||
                    (a instanceof Date && b instanceof Date))) {
                return String(a) === String(b);
            }
            if (Object.is(a, b)) {
                return true;
            }
            if (a && typeof a === "object" && b && typeof b === "object") {
                if (seen.get(a) === b) {
                    return true;
                }
                if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                    return false;
                }
                if (isKeyedCollection(a) && isKeyedCollection(b)) {
                    if (a.size !== b.size) {
                        return false;
                    }
                    let unmatchedEntries = a.size;
                    for (const [aKey, aValue] of a.entries()) {
                        for (const [bKey, bValue] of b.entries()) {
                            /* Given that Map keys can be references, we need
                             * to ensure that they are also deeply equal */
                            if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                                (compare(aKey, bKey) && compare(aValue, bValue))) {
                                unmatchedEntries--;
                            }
                        }
                    }
                    return unmatchedEntries === 0;
                }
                const merged = { ...a, ...b };
                for (const key in merged) {
                    if (!compare(a && a[key], b && b[key])) {
                        return false;
                    }
                }
                seen.set(a, b);
                return true;
            }
            return false;
        })(c, d);
    }
    exports_5("equal", equal);
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
        if (!expr) {
            throw new AssertionError(msg);
        }
    }
    exports_5("assert", assert);
    /**
     * Make an assertion that `actual` and `expected` are equal, deeply. If not
     * deeply equal, then throw.
     */
    function assertEquals(actual, expected, msg) {
        if (equal(actual, expected)) {
            return;
        }
        let message = "";
        const actualString = format(actual);
        const expectedString = format(expected);
        try {
            const diffResult = diff_ts_1.default(actualString.split("\n"), expectedString.split("\n"));
            message = buildMessage(diffResult).join("\n");
        }
        catch (e) {
            message = `\n${colors_ts_1.red(CAN_NOT_DISPLAY)} + \n\n`;
        }
        if (msg) {
            message = msg;
        }
        throw new AssertionError(message);
    }
    exports_5("assertEquals", assertEquals);
    /**
     * Make an assertion that `actual` and `expected` are not equal, deeply.
     * If not then throw.
     */
    function assertNotEquals(actual, expected, msg) {
        if (!equal(actual, expected)) {
            return;
        }
        let actualString;
        let expectedString;
        try {
            actualString = String(actual);
        }
        catch (e) {
            actualString = "[Cannot display]";
        }
        try {
            expectedString = String(expected);
        }
        catch (e) {
            expectedString = "[Cannot display]";
        }
        if (!msg) {
            msg = `actual: ${actualString} expected: ${expectedString}`;
        }
        throw new AssertionError(msg);
    }
    exports_5("assertNotEquals", assertNotEquals);
    /**
     * Make an assertion that `actual` and `expected` are strictly equal.  If
     * not then throw.
     */
    function assertStrictEq(actual, expected, msg) {
        if (actual !== expected) {
            let actualString;
            let expectedString;
            try {
                actualString = String(actual);
            }
            catch (e) {
                actualString = "[Cannot display]";
            }
            try {
                expectedString = String(expected);
            }
            catch (e) {
                expectedString = "[Cannot display]";
            }
            if (!msg) {
                msg = `actual: ${actualString} expected: ${expectedString}`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_5("assertStrictEq", assertStrictEq);
    /**
     * Make an assertion that actual contains expected. If not
     * then thrown.
     */
    function assertStrContains(actual, expected, msg) {
        if (!actual.includes(expected)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to contains: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_5("assertStrContains", assertStrContains);
    /**
     * Make an assertion that `actual` contains the `expected` values
     * If not then thrown.
     */
    function assertArrayContains(actual, expected, msg) {
        const missing = [];
        for (let i = 0; i < expected.length; i++) {
            let found = false;
            for (let j = 0; j < actual.length; j++) {
                if (equal(expected[i], actual[j])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missing.push(expected[i]);
            }
        }
        if (missing.length === 0) {
            return;
        }
        if (!msg) {
            msg = `actual: "${actual}" expected to contains: "${expected}"`;
            msg += "\n";
            msg += `missing: ${missing}`;
        }
        throw new AssertionError(msg);
    }
    exports_5("assertArrayContains", assertArrayContains);
    /**
     * Make an assertion that `actual` match RegExp `expected`. If not
     * then thrown
     */
    function assertMatch(actual, expected, msg) {
        if (!expected.test(actual)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to match: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_5("assertMatch", assertMatch);
    /**
     * Forcefully throws a failed assertion
     */
    function fail(msg) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
    }
    exports_5("fail", fail);
    /** Executes a function, expecting it to throw.  If it does not, then it
     * throws.  An error class and a string that should be included in the
     * error message can also be asserted.
     */
    function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            fn();
        }
        catch (e) {
            if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
                msg = `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes && !e.message.includes(msgIncludes)) {
                msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_5("assertThrows", assertThrows);
    async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            await fn();
        }
        catch (e) {
            if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
                msg = `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes && !e.message.includes(msgIncludes)) {
                msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_5("assertThrowsAsync", assertThrowsAsync);
    /** Use this to stub out methods that will throw when invoked. */
    function unimplemented(msg) {
        throw new AssertionError(msg || "unimplemented");
    }
    exports_5("unimplemented", unimplemented);
    /** Use this to assert unreachable code. */
    function unreachable() {
        throw new AssertionError("unreachable");
    }
    exports_5("unreachable", unreachable);
    return {
        setters: [
            function (colors_ts_1_1) {
                colors_ts_1 = colors_ts_1_1;
            },
            function (diff_ts_1_1) {
                diff_ts_1 = diff_ts_1_1;
            }
        ],
        execute: function () {
            CAN_NOT_DISPLAY = "[Cannot display]";
            AssertionError = class AssertionError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "AssertionError";
                }
            };
            exports_5("AssertionError", AssertionError);
        }
    };
});
System.register("https://deno.land/std@v0.51.0/async/deferred", [], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    /** Creates a Promise with the `reject` and `resolve` functions
     * placed as methods on the promise object itself. It allows you to do:
     *
     *     const p = deferred<number>();
     *     // ...
     *     p.resolve(42);
     */
    function deferred() {
        let methods;
        const promise = new Promise((resolve, reject) => {
            methods = { resolve, reject };
        });
        return Object.assign(promise, methods);
    }
    exports_6("deferred", deferred);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@v0.51.0/async/delay", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
    /* Resolves after the given number of milliseconds. */
    function delay(ms) {
        return new Promise((res) => setTimeout(() => {
            res();
        }, ms));
    }
    exports_7("delay", delay);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@v0.51.0/async/mux_async_iterator", ["https://deno.land/std@v0.51.0/async/deferred"], function (exports_8, context_8) {
    "use strict";
    var deferred_ts_1, MuxAsyncIterator;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (deferred_ts_1_1) {
                deferred_ts_1 = deferred_ts_1_1;
            }
        ],
        execute: function () {
            /** The MuxAsyncIterator class multiplexes multiple async iterators into a
             * single stream. It currently makes a few assumptions:
             * - The iterators do not throw.
             * - The final result (the value returned and not yielded from the iterator)
             *   does not matter; if there is any, it is discarded.
             */
            MuxAsyncIterator = class MuxAsyncIterator {
                constructor() {
                    this.iteratorCount = 0;
                    this.yields = [];
                    this.signal = deferred_ts_1.deferred();
                }
                add(iterator) {
                    ++this.iteratorCount;
                    this.callIteratorNext(iterator);
                }
                async callIteratorNext(iterator) {
                    const { value, done } = await iterator.next();
                    if (done) {
                        --this.iteratorCount;
                    }
                    else {
                        this.yields.push({ iterator, value });
                    }
                    this.signal.resolve();
                }
                async *iterate() {
                    while (this.iteratorCount > 0) {
                        // Sleep until any of the wrapped iterators yields.
                        await this.signal;
                        // Note that while we're looping over `yields`, new items may be added.
                        for (let i = 0; i < this.yields.length; i++) {
                            const { iterator, value } = this.yields[i];
                            yield value;
                            this.callIteratorNext(iterator);
                        }
                        // Clear the `yields` list and reset the `signal` promise.
                        this.yields.length = 0;
                        this.signal = deferred_ts_1.deferred();
                    }
                }
                [Symbol.asyncIterator]() {
                    return this.iterate();
                }
            };
            exports_8("MuxAsyncIterator", MuxAsyncIterator);
        }
    };
});
System.register("https://deno.land/std@v0.51.0/async/mod", ["https://deno.land/std@v0.51.0/async/deferred", "https://deno.land/std@v0.51.0/async/delay", "https://deno.land/std@v0.51.0/async/mux_async_iterator"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_9(exports);
    }
    return {
        setters: [
            function (deferred_ts_2_1) {
                exportStar_1(deferred_ts_2_1);
            },
            function (delay_ts_1_1) {
                exportStar_1(delay_ts_1_1);
            },
            function (mux_async_iterator_ts_1_1) {
                exportStar_1(mux_async_iterator_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@v0.51.0/encoding/utf8", [], function (exports_10, context_10) {
    "use strict";
    var encoder, decoder;
    var __moduleName = context_10 && context_10.id;
    /** Shorthand for new TextEncoder().encode() */
    function encode(input) {
        return encoder.encode(input);
    }
    exports_10("encode", encode);
    /** Shorthand for new TextDecoder().decode() */
    function decode(input) {
        return decoder.decode(input);
    }
    exports_10("decode", decode);
    return {
        setters: [],
        execute: function () {
            /** A default TextEncoder instance */
            exports_10("encoder", encoder = new TextEncoder());
            /** A default TextDecoder instance */
            exports_10("decoder", decoder = new TextDecoder());
        }
    };
});
System.register("https://deno.land/std@v0.50.0/fmt/colors", [], function (exports_11, context_11) {
    "use strict";
    var noColor, enabled;
    var __moduleName = context_11 && context_11.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_11("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_11("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_11("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_11("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_11("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_11("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_11("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_11("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_11("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_11("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_11("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_11("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_11("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_11("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_11("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_11("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_11("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_11("white", white);
    function gray(str) {
        return run(str, code([90], 39));
    }
    exports_11("gray", gray);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_11("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_11("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_11("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_11("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_11("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_11("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_11("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_11("bgWhite", bgWhite);
    /* Special Color Sequences */
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    /** Set text color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_11("rgb8", rgb8);
    /** Set background color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_11("bgRgb8", bgRgb8);
    /** Set text color using 24bit rgb. */
    function rgb24(str, color) {
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_11("rgb24", rgb24);
    /** Set background color using 24bit rgb. */
    function bgRgb24(str, color) {
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_11("bgRgb24", bgRgb24);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            /**
             * A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
             * on npm.
             *
             * ```
             * import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
             * console.log(bgBlue(red(bold("Hello world!"))));
             * ```
             *
             * This module supports `NO_COLOR` environmental variable disabling any coloring
             * if `NO_COLOR` is set.
             */
            noColor = Deno.noColor;
            enabled = !noColor;
        }
    };
});
System.register("https://deno.land/x/bytes_formater@1.2.0/deps", ["https://deno.land/std@v0.50.0/fmt/colors"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (colors_ts_2_1) {
                exports_12({
                    "setColorEnabled": colors_ts_2_1["setColorEnabled"],
                    "green": colors_ts_2_1["green"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/bytes_formater@1.2.0/format", ["https://deno.land/x/bytes_formater@1.2.0/deps"], function (exports_13, context_13) {
    "use strict";
    var deps_ts_1;
    var __moduleName = context_13 && context_13.id;
    function format(data) {
        const bytes = new Uint8Array(data.buffer);
        let out = "";
        out += "         +-------------------------------------------------+\n";
        out += `         |${deps_ts_1.green("  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f ")}|\n`;
        out += "+--------+-------------------------------------------------+----------------+\n";
        const lineCount = Math.ceil(bytes.length / 16);
        for (let line = 0; line < lineCount; line++) {
            const start = line * 16;
            const addr = start.toString(16).padStart(8, "0");
            const lineBytes = bytes.slice(start, start + 16);
            out += `|${deps_ts_1.green(addr)}| `;
            lineBytes.forEach(byte => (out += byte.toString(16).padStart(2, "0") + " "));
            if (lineBytes.length < 16) {
                out += "   ".repeat(16 - lineBytes.length);
            }
            out += "|";
            lineBytes.forEach(function (byte) {
                return (out += byte > 31 && byte < 127 ? deps_ts_1.green(String.fromCharCode(byte)) : ".");
            });
            if (lineBytes.length < 16) {
                out += " ".repeat(16 - lineBytes.length);
            }
            out += "|\n";
        }
        out += "+--------+-------------------------------------------------+----------------+";
        return out;
    }
    exports_13("format", format);
    return {
        setters: [
            function (deps_ts_1_1) {
                deps_ts_1 = deps_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/bytes_formater@1.2.0/mod", ["https://deno.land/x/bytes_formater@1.2.0/format", "https://deno.land/x/bytes_formater@1.2.0/deps"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (format_ts_1_1) {
                exports_14({
                    "format": format_ts_1_1["format"]
                });
            },
            function (deps_ts_2_1) {
                exports_14({
                    "setColorEnabled": deps_ts_2_1["setColorEnabled"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/checksum@1.4.0/sha1", [], function (exports_15, context_15) {
    "use strict";
    var Sha1Hash;
    var __moduleName = context_15 && context_15.id;
    /*
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     */
    function binb_sha1(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (24 - (len % 32));
        x[(((len + 64) >> 9) << 4) + 15] = len;
        const w = [];
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;
        let e = -1009589776;
        for (let i = 0; i < x.length; i += 16) {
            const olda = a;
            const oldb = b;
            const oldc = c;
            const oldd = d;
            const olde = e;
            for (let j = 0; j < 80; j++) {
                if (j < 16)
                    w[j] = x[i + j];
                else
                    w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = bit_rol(b, 30);
                b = a;
                a = t;
            }
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return [a, b, c, d, e];
    }
    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function sha1_ft(t, b, c, d) {
        if (t < 20)
            return (b & c) | (~b & d);
        if (t < 40)
            return b ^ c ^ d;
        if (t < 60)
            return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }
    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function sha1_kt(t) {
        return t < 20
            ? 1518500249
            : t < 40
                ? 1859775393
                : t < 60
                    ? -1894007588
                    : -899497514;
    }
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }
    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    return {
        setters: [],
        execute: function () {
            Sha1Hash = class Sha1Hash {
                digest(bytes) {
                    let data = [];
                    for (var i = 0; i < bytes.length * 8; i += 8) {
                        data[i >> 5] |= (bytes[i / 8] & 0xff) << (24 - (i % 32));
                    }
                    data = binb_sha1(data, bytes.length * 8);
                    return this.toStrBytes(data);
                }
                /*
                 * Convert an array of big-endian words to a string
                 */
                toStrBytes(input) {
                    let pos = 0;
                    const data = new Uint8Array(input.length * 4);
                    for (let i = 0; i < input.length * 32; i += 8) {
                        data[pos++] = (input[i >> 5] >> (24 - (i % 32))) & 0xff;
                    }
                    return data;
                }
            };
            exports_15("Sha1Hash", Sha1Hash);
        }
    };
});
System.register("https://deno.land/x/checksum@1.4.0/md5", [], function (exports_16, context_16) {
    "use strict";
    var Md5Hash;
    var __moduleName = context_16 && context_16.id;
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safeAdd(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }
    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bitRotateLeft(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5cmn(q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }
    function md5ff(a, b, c, d, x, s, t) {
        return md5cmn((b & c) | (~b & d), a, b, x, s, t);
    }
    function md5gg(a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    }
    function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    function binlMD5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << len % 32;
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        let olda, oldb, oldc, oldd;
        let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
        for (let i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;
            a = md5ff(a, b, c, d, x[i], 7, -680876936);
            d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5gg(b, c, d, a, x[i], 20, -373897302);
            a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5hh(d, a, b, c, x[i], 11, -358537222);
            c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = md5ii(a, b, c, d, x[i], 6, -198630844);
            d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = safeAdd(a, olda);
            b = safeAdd(b, oldb);
            c = safeAdd(c, oldc);
            d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
    }
    function md5(bytes) {
        let data = [];
        var length8 = bytes.length * 8;
        for (let i = 0; i < length8; i += 8) {
            data[i >> 5] |= (bytes[i / 8] & 0xff) << i % 32;
        }
        return binlMD5(data, bytes.length * 8);
    }
    return {
        setters: [],
        execute: function () {
            Md5Hash = class Md5Hash {
                digest(bytes) {
                    const data = md5(bytes);
                    return this.toStrBytes(data);
                }
                toStrBytes(input) {
                    const buffer = new ArrayBuffer(16);
                    new Uint32Array(buffer).set(input);
                    return new Uint8Array(buffer);
                }
            };
            exports_16("Md5Hash", Md5Hash);
        }
    };
});
System.register("https://deno.land/x/checksum@1.4.0/hash", ["https://deno.land/x/checksum@1.4.0/sha1", "https://deno.land/x/checksum@1.4.0/md5"], function (exports_17, context_17) {
    "use strict";
    var sha1_ts_1, md5_ts_1, encoder, Hash;
    var __moduleName = context_17 && context_17.id;
    function hex(bytes) {
        return Array.prototype.map
            .call(bytes, (x) => x.toString(16).padStart(2, "0"))
            .join("");
    }
    exports_17("hex", hex);
    function encode(str) {
        return encoder.encode(str);
    }
    exports_17("encode", encode);
    return {
        setters: [
            function (sha1_ts_1_1) {
                sha1_ts_1 = sha1_ts_1_1;
            },
            function (md5_ts_1_1) {
                md5_ts_1 = md5_ts_1_1;
            }
        ],
        execute: function () {
            encoder = new TextEncoder();
            Hash = class Hash {
                constructor(algorithm) {
                    this.algorithm = algorithm;
                    const algorithms = {
                        sha1: sha1_ts_1.Sha1Hash,
                        md5: md5_ts_1.Md5Hash,
                    };
                    this.instance = new algorithms[algorithm]();
                }
                digest(bytes) {
                    bytes = this.instance.digest(bytes);
                    return {
                        data: bytes,
                        hex: () => hex(bytes),
                    };
                }
                digestString(string) {
                    return this.digest(encode(string));
                }
            };
            exports_17("Hash", Hash);
        }
    };
});
System.register("https://deno.land/x/checksum@1.4.0/mod", ["https://deno.land/x/checksum@1.4.0/hash"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (hash_ts_1_1) {
                exports_18({
                    "Hash": hash_ts_1_1["Hash"],
                    "hex": hash_ts_1_1["hex"],
                    "encode": hash_ts_1_1["encode"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/base64/base", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    function getLengths(b64) {
        const len = b64.length;
        if (len % 4 > 0) {
            throw new TypeError("Invalid string. Length must be a multiple of 4");
        }
        // Trim off extra bytes after placeholder bytes are found
        // See: https://github.com/beatgammit/base64-js/issues/42
        let validLen = b64.indexOf("=");
        if (validLen === -1) {
            validLen = len;
        }
        const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
        return [validLen, placeHoldersLen];
    }
    function init(lookup, revLookup) {
        function _byteLength(validLen, placeHoldersLen) {
            return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
        }
        function tripletToBase64(num) {
            return (lookup[(num >> 18) & 0x3f] +
                lookup[(num >> 12) & 0x3f] +
                lookup[(num >> 6) & 0x3f] +
                lookup[num & 0x3f]);
        }
        function encodeChunk(buf, start, end) {
            const out = new Array((end - start) / 3);
            for (let i = start, curTriplet = 0; i < end; i += 3) {
                out[curTriplet++] = tripletToBase64((buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]);
            }
            return out.join("");
        }
        return {
            // base64 is 4/3 + up to two characters of the original data
            byteLength(b64) {
                return _byteLength.apply(null, getLengths(b64));
            },
            toUint8Array(b64) {
                const [validLen, placeHoldersLen] = getLengths(b64);
                const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));
                // If there are placeholders, only get up to the last complete 4 chars
                const len = placeHoldersLen ? validLen - 4 : validLen;
                let tmp;
                let curByte = 0;
                let i;
                for (i = 0; i < len; i += 4) {
                    tmp =
                        (revLookup[b64.charCodeAt(i)] << 18) |
                            (revLookup[b64.charCodeAt(i + 1)] << 12) |
                            (revLookup[b64.charCodeAt(i + 2)] << 6) |
                            revLookup[b64.charCodeAt(i + 3)];
                    buf[curByte++] = (tmp >> 16) & 0xff;
                    buf[curByte++] = (tmp >> 8) & 0xff;
                    buf[curByte++] = tmp & 0xff;
                }
                if (placeHoldersLen === 2) {
                    tmp =
                        (revLookup[b64.charCodeAt(i)] << 2) |
                            (revLookup[b64.charCodeAt(i + 1)] >> 4);
                    buf[curByte++] = tmp & 0xff;
                }
                else if (placeHoldersLen === 1) {
                    tmp =
                        (revLookup[b64.charCodeAt(i)] << 10) |
                            (revLookup[b64.charCodeAt(i + 1)] << 4) |
                            (revLookup[b64.charCodeAt(i + 2)] >> 2);
                    buf[curByte++] = (tmp >> 8) & 0xff;
                    buf[curByte++] = tmp & 0xff;
                }
                return buf;
            },
            fromUint8Array(buf) {
                const maxChunkLength = 16383; // Must be multiple of 3
                const len = buf.length;
                const extraBytes = len % 3; // If we have 1 byte left, pad 2 bytes
                const len2 = len - extraBytes;
                const parts = new Array(Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0));
                let curChunk = 0;
                let chunkEnd;
                // Go through the array every three bytes, we'll deal with trailing stuff later
                for (let i = 0; i < len2; i += maxChunkLength) {
                    chunkEnd = i + maxChunkLength;
                    parts[curChunk++] = encodeChunk(buf, i, chunkEnd > len2 ? len2 : chunkEnd);
                }
                let tmp;
                // Pad the end with zeros, but make sure to not forget the extra bytes
                if (extraBytes === 1) {
                    tmp = buf[len2];
                    parts[curChunk] = lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "==";
                }
                else if (extraBytes === 2) {
                    tmp = (buf[len2] << 8) | (buf[len2 + 1] & 0xff);
                    parts[curChunk] =
                        lookup[tmp >> 10] +
                            lookup[(tmp >> 4) & 0x3f] +
                            lookup[(tmp << 2) & 0x3f] +
                            "=";
                }
                return parts.join("");
            }
        };
    }
    exports_19("init", init);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/base64/base64url", ["https://deno.land/x/base64/base"], function (exports_20, context_20) {
    "use strict";
    var base_ts_1, lookup, revLookup, code, mod, byteLength, toUint8Array, fromUint8Array;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (base_ts_1_1) {
                base_ts_1 = base_ts_1_1;
            }
        ],
        execute: function () {
            lookup = [];
            revLookup = [];
            code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
            for (let i = 0, l = code.length; i < l; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
            }
            revLookup["-".charCodeAt(0)] = 62;
            revLookup["_".charCodeAt(0)] = 63;
            mod = base_ts_1.init(lookup, revLookup);
            exports_20("byteLength", byteLength = mod.byteLength);
            exports_20("toUint8Array", toUint8Array = mod.toUint8Array);
            exports_20("fromUint8Array", fromUint8Array = mod.fromUint8Array);
        }
    };
});
System.register("https://raw.githubusercontent.com/chiefbiiko/std-encoding/v1.0.0/mod", ["https://deno.land/x/base64/base64url"], function (exports_21, context_21) {
    "use strict";
    var base64url_ts_1, decoder, encoder;
    var __moduleName = context_21 && context_21.id;
    /** Serializes a Uint8Array to a hexadecimal string. */
    function toHexString(buf) {
        return buf.reduce((hex, byte) => `${hex}${byte < 16 ? "0" : ""}${byte.toString(16)}`, "");
    }
    /** Deserializes a Uint8Array from a hexadecimal string. */
    function fromHexString(hex) {
        const len = hex.length;
        if (len % 2 || !/^[0-9a-fA-F]+$/.test(hex)) {
            throw new TypeError("Invalid hex string.");
        }
        hex = hex.toLowerCase();
        const buf = new Uint8Array(Math.floor(len / 2));
        const end = len / 2;
        for (let i = 0; i < end; ++i) {
            buf[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return buf;
    }
    /** Decodes a Uint8Array to utf8-, base64-, or hex-encoded string. */
    function decode(buf, encoding = "utf8") {
        if (/^utf-?8$/i.test(encoding)) {
            return decoder.decode(buf);
        }
        else if (/^base64$/i.test(encoding)) {
            return base64url_ts_1.fromUint8Array(buf);
        }
        else if (/^hex(?:adecimal)?$/i.test(encoding)) {
            return toHexString(buf);
        }
        else {
            throw new TypeError("Unsupported string encoding.");
        }
    }
    exports_21("decode", decode);
    function encode(str, encoding = "utf8") {
        if (/^utf-?8$/i.test(encoding)) {
            return encoder.encode(str);
        }
        else if (/^base64$/i.test(encoding)) {
            return base64url_ts_1.toUint8Array(str);
        }
        else if (/^hex(?:adecimal)?$/i.test(encoding)) {
            return fromHexString(str);
        }
        else {
            throw new TypeError("Unsupported string encoding.");
        }
    }
    exports_21("encode", encode);
    return {
        setters: [
            function (base64url_ts_1_1) {
                base64url_ts_1 = base64url_ts_1_1;
            }
        ],
        execute: function () {
            decoder = new TextDecoder();
            encoder = new TextEncoder();
        }
    };
});
System.register("https://deno.land/x/sha256@v1.0.2/deps", ["https://raw.githubusercontent.com/chiefbiiko/std-encoding/v1.0.0/mod"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (mod_ts_1_1) {
                exports_22({
                    "encode": mod_ts_1_1["encode"],
                    "decode": mod_ts_1_1["decode"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/sha256@v1.0.2/mod", ["https://deno.land/x/sha256@v1.0.2/deps"], function (exports_23, context_23) {
    "use strict";
    var deps_ts_3, BYTES, SHA256;
    var __moduleName = context_23 && context_23.id;
    /** Generates a SHA256 hash of the input data. */
    function sha256(msg, inputEncoding, outputEncoding) {
        return new SHA256().update(msg, inputEncoding).digest(outputEncoding);
    }
    exports_23("sha256", sha256);
    return {
        setters: [
            function (deps_ts_3_1) {
                deps_ts_3 = deps_ts_3_1;
            }
        ],
        execute: function () {
            /** Byte length of a SHA256 hash. */
            exports_23("BYTES", BYTES = 32);
            /** A class representation of the SHA256 algorithm. */
            SHA256 = class SHA256 {
                /** Creates a SHA256 instance. */
                constructor() {
                    this.hashSize = BYTES;
                    this._buf = new Uint8Array(64);
                    // prettier-ignore
                    this._K = new Uint32Array([
                        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
                        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
                        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
                        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
                        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
                        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
                        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
                        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
                        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
                    ]);
                    this.init();
                }
                /** Initializes a hash. */
                init() {
                    // prettier-ignore
                    this._H = new Uint32Array([
                        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
                        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
                    ]);
                    this._bufIdx = 0;
                    this._count = new Uint32Array(2);
                    this._buf.fill(0);
                    this._finalized = false;
                    return this;
                }
                /** Updates the hash with additional message data. */
                update(msg, inputEncoding) {
                    if (msg === null) {
                        throw new TypeError("msg must be a string or Uint8Array.");
                    }
                    else if (typeof msg === "string") {
                        msg = deps_ts_3.encode(msg, inputEncoding);
                    }
                    // process the msg as many times as possible, the rest is stored in the buffer
                    // message is processed in 512 bit (64 byte chunks)
                    for (let i = 0, len = msg.length; i < len; i++) {
                        this._buf[this._bufIdx++] = msg[i];
                        if (this._bufIdx === 64) {
                            this._transform();
                            this._bufIdx = 0;
                        }
                    }
                    // counter update (number of message bits)
                    const c = this._count;
                    if ((c[0] += msg.length << 3) < msg.length << 3) {
                        c[1]++;
                    }
                    c[1] += msg.length >>> 29;
                    return this;
                }
                /** Finalizes the hash with additional message data. */
                digest(outputEncoding) {
                    if (this._finalized) {
                        throw new Error("digest has already been called.");
                    }
                    this._finalized = true;
                    // append '1'
                    const b = this._buf;
                    let idx = this._bufIdx;
                    b[idx++] = 0x80;
                    // zeropad up to byte pos 56
                    while (idx !== 56) {
                        if (idx === 64) {
                            this._transform();
                            idx = 0;
                        }
                        b[idx++] = 0;
                    }
                    // append length in bits
                    const c = this._count;
                    b[56] = (c[1] >>> 24) & 0xff;
                    b[57] = (c[1] >>> 16) & 0xff;
                    b[58] = (c[1] >>> 8) & 0xff;
                    b[59] = (c[1] >>> 0) & 0xff;
                    b[60] = (c[0] >>> 24) & 0xff;
                    b[61] = (c[0] >>> 16) & 0xff;
                    b[62] = (c[0] >>> 8) & 0xff;
                    b[63] = (c[0] >>> 0) & 0xff;
                    this._transform();
                    // return the hash as byte array
                    const hash = new Uint8Array(BYTES);
                    // let i: number;
                    for (let i = 0; i < 8; i++) {
                        hash[(i << 2) + 0] = (this._H[i] >>> 24) & 0xff;
                        hash[(i << 2) + 1] = (this._H[i] >>> 16) & 0xff;
                        hash[(i << 2) + 2] = (this._H[i] >>> 8) & 0xff;
                        hash[(i << 2) + 3] = (this._H[i] >>> 0) & 0xff;
                    }
                    // clear internal states and prepare for new hash
                    this.init();
                    return outputEncoding ? deps_ts_3.decode(hash, outputEncoding) : hash;
                }
                /** Performs one transformation cycle. */
                _transform() {
                    const h = this._H;
                    let h0 = h[0];
                    let h1 = h[1];
                    let h2 = h[2];
                    let h3 = h[3];
                    let h4 = h[4];
                    let h5 = h[5];
                    let h6 = h[6];
                    let h7 = h[7];
                    // convert byte buffer into w[0..15]
                    const w = new Uint32Array(16);
                    let i;
                    for (i = 0; i < 16; i++) {
                        w[i] =
                            this._buf[(i << 2) + 3] |
                                (this._buf[(i << 2) + 2] << 8) |
                                (this._buf[(i << 2) + 1] << 16) |
                                (this._buf[i << 2] << 24);
                    }
                    for (i = 0; i < 64; i++) {
                        let tmp;
                        if (i < 16) {
                            tmp = w[i];
                        }
                        else {
                            let a = w[(i + 1) & 15];
                            let b = w[(i + 14) & 15];
                            tmp = w[i & 15] =
                                (((a >>> 7) ^ (a >>> 18) ^ (a >>> 3) ^ (a << 25) ^ (a << 14)) +
                                    ((b >>> 17) ^ (b >>> 19) ^ (b >>> 10) ^ (b << 15) ^ (b << 13)) +
                                    w[i & 15] +
                                    w[(i + 9) & 15]) |
                                    0;
                        }
                        tmp =
                            (tmp +
                                h7 +
                                ((h4 >>> 6) ^
                                    (h4 >>> 11) ^
                                    (h4 >>> 25) ^
                                    (h4 << 26) ^
                                    (h4 << 21) ^
                                    (h4 << 7)) +
                                (h6 ^ (h4 & (h5 ^ h6))) +
                                this._K[i]) |
                                0;
                        h7 = h6;
                        h6 = h5;
                        h5 = h4;
                        h4 = h3 + tmp;
                        h3 = h2;
                        h2 = h1;
                        h1 = h0;
                        h0 =
                            (tmp +
                                ((h1 & h2) ^ (h3 & (h1 ^ h2))) +
                                ((h1 >>> 2) ^
                                    (h1 >>> 13) ^
                                    (h1 >>> 22) ^
                                    (h1 << 30) ^
                                    (h1 << 19) ^
                                    (h1 << 10))) |
                                0;
                    }
                    h[0] = (h[0] + h0) | 0;
                    h[1] = (h[1] + h1) | 0;
                    h[2] = (h[2] + h2) | 0;
                    h[3] = (h[3] + h3) | 0;
                    h[4] = (h[4] + h4) | 0;
                    h[5] = (h[5] + h5) | 0;
                    h[6] = (h[6] + h6) | 0;
                    h[7] = (h[7] + h7) | 0;
                }
            };
            exports_23("SHA256", SHA256);
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.3.5/util", [], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    function replaceParams(sql, params) {
        if (!params)
            return sql;
        let paramIndex = 0;
        sql = sql.replace(/('.*')|(".*")|(\?\?)|(\?)/g, str => {
            if (paramIndex >= params.length)
                return str;
            // ignore
            if (/".*"/g.test(str) || /'.*'/g.test(str)) {
                return str;
            }
            // identifier
            if (str === "??") {
                const val = params[paramIndex++];
                if (val instanceof Array) {
                    return `(${val.map(item => replaceParams("??", [item])).join(",")})`;
                }
                else if (val === "*") {
                    return val;
                }
                else if (typeof val === "string" && val.indexOf(".") > -1) {
                    // a.b => `a`.`b`
                    const _arr = val.split(".");
                    return replaceParams(_arr.map(() => "??").join("."), _arr);
                }
                else if (typeof val === "string" &&
                    (val.toLowerCase().indexOf(" as ") > -1 ||
                        val.toLowerCase().indexOf(" AS ") > -1)) {
                    // a as b => `a` AS `b`
                    const newVal = val.replace(" as ", " AS ");
                    const _arr = newVal.split(" AS ");
                    return replaceParams(_arr.map(() => "??").join(" AS "), _arr);
                }
                else {
                    return ["`", val, "`"].join("");
                }
            }
            // value
            const val = params[paramIndex++];
            if (val === null)
                return "NULL";
            switch (typeof val) {
                case "object":
                    if (val instanceof Date)
                        return `"${formatDate(val)}"`;
                    if (val instanceof Array) {
                        return `(${val.map(item => replaceParams("?", [item])).join(",")})`;
                    }
                case "string":
                    return `"${escapeString(val)}"`;
                case "undefined":
                    return "NULL";
                case "number":
                case "boolean":
                default:
                    return val;
            }
        });
        return sql;
    }
    exports_24("replaceParams", replaceParams);
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const days = date
            .getDate()
            .toString()
            .padStart(2, "0");
        const hours = date
            .getHours()
            .toString()
            .padStart(2, "0");
        const minutes = date
            .getMinutes()
            .toString()
            .padStart(2, "0");
        const seconds = date
            .getSeconds()
            .toString()
            .padStart(2, "0");
        return `${year}-${month}-${days} ${hours}:${minutes}:${seconds}`;
    }
    function escapeString(str) {
        return str.replace(/"/g, '\\"');
    }
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/log/levels", [], function (exports_25, context_25) {
    "use strict";
    var LogLevels, LogLevelNames, byLevel;
    var __moduleName = context_25 && context_25.id;
    /** Returns the numeric log level associated with the passed,
     * stringy log level name.
     */
    function getLevelByName(name) {
        switch (name) {
            case "NOTSET":
                return LogLevels.NOTSET;
            case "DEBUG":
                return LogLevels.DEBUG;
            case "INFO":
                return LogLevels.INFO;
            case "WARNING":
                return LogLevels.WARNING;
            case "ERROR":
                return LogLevels.ERROR;
            case "CRITICAL":
                return LogLevels.CRITICAL;
            default:
                throw new Error(`no log level found for "${name}"`);
        }
    }
    exports_25("getLevelByName", getLevelByName);
    /** Returns the stringy log level name provided the numeric log level */
    function getLevelName(level) {
        const levelName = byLevel[level];
        if (levelName) {
            return levelName;
        }
        throw new Error(`no level name found for level: ${level}`);
    }
    exports_25("getLevelName", getLevelName);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            /** Get log level numeric values through enum constants
             */
            (function (LogLevels) {
                LogLevels[LogLevels["NOTSET"] = 0] = "NOTSET";
                LogLevels[LogLevels["DEBUG"] = 10] = "DEBUG";
                LogLevels[LogLevels["INFO"] = 20] = "INFO";
                LogLevels[LogLevels["WARNING"] = 30] = "WARNING";
                LogLevels[LogLevels["ERROR"] = 40] = "ERROR";
                LogLevels[LogLevels["CRITICAL"] = 50] = "CRITICAL";
            })(LogLevels || (LogLevels = {}));
            exports_25("LogLevels", LogLevels);
            /** Permitted log level names */
            exports_25("LogLevelNames", LogLevelNames = Object.keys(LogLevels).filter((key) => isNaN(Number(key))));
            byLevel = {
                [String(LogLevels.NOTSET)]: "NOTSET",
                [String(LogLevels.DEBUG)]: "DEBUG",
                [String(LogLevels.INFO)]: "INFO",
                [String(LogLevels.WARNING)]: "WARNING",
                [String(LogLevels.ERROR)]: "ERROR",
                [String(LogLevels.CRITICAL)]: "CRITICAL",
            };
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/fmt/colors", [], function (exports_26, context_26) {
    "use strict";
    var noColor, enabled;
    var __moduleName = context_26 && context_26.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_26("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_26("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_26("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_26("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_26("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_26("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_26("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_26("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_26("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_26("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_26("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_26("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_26("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_26("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_26("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_26("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_26("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_26("white", white);
    function gray(str) {
        return run(str, code([90], 39));
    }
    exports_26("gray", gray);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_26("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_26("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_26("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_26("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_26("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_26("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_26("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_26("bgWhite", bgWhite);
    /* Special Color Sequences */
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    /** Set text color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_26("rgb8", rgb8);
    /** Set background color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_26("bgRgb8", bgRgb8);
    /** Set text color using 24bit rgb. */
    function rgb24(str, color) {
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_26("rgb24", rgb24);
    /** Set background color using 24bit rgb. */
    function bgRgb24(str, color) {
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_26("bgRgb24", bgRgb24);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            /**
             * A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
             * on npm.
             *
             * ```
             * import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
             * console.log(bgBlue(red(bold("Hello world!"))));
             * ```
             *
             * This module supports `NO_COLOR` environmental variable disabling any coloring
             * if `NO_COLOR` is set.
             */
            noColor = Deno.noColor;
            enabled = !noColor;
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/fs/exists", [], function (exports_27, context_27) {
    "use strict";
    var lstat, lstatSync;
    var __moduleName = context_27 && context_27.id;
    /**
     * Test whether or not the given path exists by checking with the file system
     */
    async function exists(filePath) {
        try {
            await lstat(filePath);
            return true;
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return false;
            }
            throw err;
        }
    }
    exports_27("exists", exists);
    /**
     * Test whether or not the given path exists by checking with the file system
     */
    function existsSync(filePath) {
        try {
            lstatSync(filePath);
            return true;
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return false;
            }
            throw err;
        }
    }
    exports_27("existsSync", existsSync);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            lstat = Deno.lstat, lstatSync = Deno.lstatSync;
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/log/handlers", ["https://deno.land/x/std@v0.51.0/log/levels", "https://deno.land/x/std@v0.51.0/fmt/colors", "https://deno.land/x/std@v0.51.0/fs/exists"], function (exports_28, context_28) {
    "use strict";
    var open, openSync, close, renameSync, statSync, levels_ts_1, colors_ts_3, exists_ts_1, DEFAULT_FORMATTER, BaseHandler, ConsoleHandler, WriterHandler, FileHandler, RotatingFileHandler;
    var __moduleName = context_28 && context_28.id;
    return {
        setters: [
            function (levels_ts_1_1) {
                levels_ts_1 = levels_ts_1_1;
            },
            function (colors_ts_3_1) {
                colors_ts_3 = colors_ts_3_1;
            },
            function (exists_ts_1_1) {
                exists_ts_1 = exists_ts_1_1;
            }
        ],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            open = Deno.open, openSync = Deno.openSync, close = Deno.close, renameSync = Deno.renameSync, statSync = Deno.statSync;
            DEFAULT_FORMATTER = "{levelName} {msg}";
            BaseHandler = class BaseHandler {
                constructor(levelName, options = {}) {
                    this.level = levels_ts_1.getLevelByName(levelName);
                    this.levelName = levelName;
                    this.formatter = options.formatter || DEFAULT_FORMATTER;
                }
                handle(logRecord) {
                    if (this.level > logRecord.level)
                        return;
                    const msg = this.format(logRecord);
                    return this.log(msg);
                }
                format(logRecord) {
                    if (this.formatter instanceof Function) {
                        return this.formatter(logRecord);
                    }
                    return this.formatter.replace(/{(\S+)}/g, (match, p1) => {
                        const value = logRecord[p1];
                        // do not interpolate missing values
                        if (!value) {
                            return match;
                        }
                        return String(value);
                    });
                }
                log(_msg) { }
                async setup() { }
                async destroy() { }
            };
            exports_28("BaseHandler", BaseHandler);
            ConsoleHandler = class ConsoleHandler extends BaseHandler {
                format(logRecord) {
                    let msg = super.format(logRecord);
                    switch (logRecord.level) {
                        case levels_ts_1.LogLevels.INFO:
                            msg = colors_ts_3.blue(msg);
                            break;
                        case levels_ts_1.LogLevels.WARNING:
                            msg = colors_ts_3.yellow(msg);
                            break;
                        case levels_ts_1.LogLevels.ERROR:
                            msg = colors_ts_3.red(msg);
                            break;
                        case levels_ts_1.LogLevels.CRITICAL:
                            msg = colors_ts_3.bold(colors_ts_3.red(msg));
                            break;
                        default:
                            break;
                    }
                    return msg;
                }
                log(msg) {
                    console.log(msg);
                }
            };
            exports_28("ConsoleHandler", ConsoleHandler);
            WriterHandler = class WriterHandler extends BaseHandler {
                constructor() {
                    super(...arguments);
                    this.#encoder = new TextEncoder();
                }
                #encoder;
            };
            exports_28("WriterHandler", WriterHandler);
            FileHandler = class FileHandler extends WriterHandler {
                constructor(levelName, options) {
                    super(levelName, options);
                    this.#encoder = new TextEncoder();
                    this._filename = options.filename;
                    // default to append mode, write only
                    this._mode = options.mode ? options.mode : "a";
                    this._openOptions = {
                        createNew: this._mode === "x",
                        create: this._mode !== "x",
                        append: this._mode === "a",
                        truncate: this._mode !== "a",
                        write: true,
                    };
                }
                #encoder;
                async setup() {
                    this._file = await open(this._filename, this._openOptions);
                    this._writer = this._file;
                }
                log(msg) {
                    Deno.writeSync(this._file.rid, this.#encoder.encode(msg + "\n"));
                }
                destroy() {
                    this._file.close();
                    return Promise.resolve();
                }
            };
            exports_28("FileHandler", FileHandler);
            RotatingFileHandler = class RotatingFileHandler extends FileHandler {
                constructor(levelName, options) {
                    super(levelName, options);
                    this.#maxBytes = options.maxBytes;
                    this.#maxBackupCount = options.maxBackupCount;
                }
                #maxBytes;
                #maxBackupCount;
                async setup() {
                    if (this.#maxBytes < 1) {
                        throw new Error("maxBytes cannot be less than 1");
                    }
                    if (this.#maxBackupCount < 1) {
                        throw new Error("maxBackupCount cannot be less than 1");
                    }
                    await super.setup();
                    if (this._mode === "w") {
                        // Remove old backups too as it doesn't make sense to start with a clean
                        // log file, but old backups
                        for (let i = 1; i <= this.#maxBackupCount; i++) {
                            if (await exists_ts_1.exists(this._filename + "." + i)) {
                                await Deno.remove(this._filename + "." + i);
                            }
                        }
                    }
                    else if (this._mode === "x") {
                        // Throw if any backups also exist
                        for (let i = 1; i <= this.#maxBackupCount; i++) {
                            if (await exists_ts_1.exists(this._filename + "." + i)) {
                                Deno.close(this._file.rid);
                                throw new Deno.errors.AlreadyExists("Backup log file " + this._filename + "." + i + " already exists");
                            }
                        }
                    }
                }
                handle(logRecord) {
                    if (this.level > logRecord.level)
                        return;
                    const msg = this.format(logRecord);
                    const currentFileSize = statSync(this._filename).size;
                    if (currentFileSize + msg.length > this.#maxBytes) {
                        this.rotateLogFiles();
                    }
                    return this.log(msg);
                }
                rotateLogFiles() {
                    close(this._file.rid);
                    for (let i = this.#maxBackupCount - 1; i >= 0; i--) {
                        const source = this._filename + (i === 0 ? "" : "." + i);
                        const dest = this._filename + "." + (i + 1);
                        if (exists_ts_1.existsSync(source)) {
                            renameSync(source, dest);
                        }
                    }
                    this._file = openSync(this._filename, this._openOptions);
                    this._writer = this._file;
                }
            };
            exports_28("RotatingFileHandler", RotatingFileHandler);
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/log/logger", ["https://deno.land/x/std@v0.51.0/log/levels"], function (exports_29, context_29) {
    "use strict";
    var levels_ts_2, LogRecord, Logger;
    var __moduleName = context_29 && context_29.id;
    return {
        setters: [
            function (levels_ts_2_1) {
                levels_ts_2 = levels_ts_2_1;
            }
        ],
        execute: function () {
            LogRecord = class LogRecord {
                constructor(msg, args, level) {
                    this.msg = msg;
                    this.#args = [...args];
                    this.level = level;
                    this.#datetime = new Date();
                    this.levelName = levels_ts_2.getLevelName(level);
                }
                #args;
                #datetime;
                get args() {
                    return [...this.#args];
                }
                get datetime() {
                    return new Date(this.#datetime.getTime());
                }
            };
            exports_29("LogRecord", LogRecord);
            Logger = class Logger {
                constructor(levelName, handlers) {
                    this.level = levels_ts_2.getLevelByName(levelName);
                    this.levelName = levelName;
                    this.handlers = handlers || [];
                }
                _log(level, msg, ...args) {
                    if (this.level > level)
                        return;
                    const record = new LogRecord(msg, args, level);
                    this.handlers.forEach((handler) => {
                        handler.handle(record);
                    });
                }
                debug(msg, ...args) {
                    this._log(levels_ts_2.LogLevels.DEBUG, msg, ...args);
                }
                info(msg, ...args) {
                    this._log(levels_ts_2.LogLevels.INFO, msg, ...args);
                }
                warning(msg, ...args) {
                    this._log(levels_ts_2.LogLevels.WARNING, msg, ...args);
                }
                error(msg, ...args) {
                    this._log(levels_ts_2.LogLevels.ERROR, msg, ...args);
                }
                critical(msg, ...args) {
                    this._log(levels_ts_2.LogLevels.CRITICAL, msg, ...args);
                }
            };
            exports_29("Logger", Logger);
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/testing/diff", [], function (exports_30, context_30) {
    "use strict";
    var DiffType, REMOVED, COMMON, ADDED;
    var __moduleName = context_30 && context_30.id;
    function createCommon(A, B, reverse) {
        const common = [];
        if (A.length === 0 || B.length === 0)
            return [];
        for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
            if (A[reverse ? A.length - i - 1 : i] === B[reverse ? B.length - i - 1 : i]) {
                common.push(A[reverse ? A.length - i - 1 : i]);
            }
            else {
                return common;
            }
        }
        return common;
    }
    function diff(A, B) {
        const prefixCommon = createCommon(A, B);
        const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
        A = suffixCommon.length
            ? A.slice(prefixCommon.length, -suffixCommon.length)
            : A.slice(prefixCommon.length);
        B = suffixCommon.length
            ? B.slice(prefixCommon.length, -suffixCommon.length)
            : B.slice(prefixCommon.length);
        const swapped = B.length > A.length;
        [A, B] = swapped ? [B, A] : [A, B];
        const M = A.length;
        const N = B.length;
        if (!M && !N && !suffixCommon.length && !prefixCommon.length)
            return [];
        if (!N) {
            return [
                ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
                ...A.map((a) => ({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a,
                })),
                ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ];
        }
        const offset = N;
        const delta = M - N;
        const size = M + N + 1;
        const fp = new Array(size).fill({ y: -1 });
        /**
         * INFO:
         * This buffer is used to save memory and improve performance.
         * The first half is used to save route and last half is used to save diff
         * type.
         * This is because, when I kept new uint8array area to save type,performance
         * worsened.
         */
        const routes = new Uint32Array((M * N + size + 1) * 2);
        const diffTypesPtrOffset = routes.length / 2;
        let ptr = 0;
        let p = -1;
        function backTrace(A, B, current, swapped) {
            const M = A.length;
            const N = B.length;
            const result = [];
            let a = M - 1;
            let b = N - 1;
            let j = routes[current.id];
            let type = routes[current.id + diffTypesPtrOffset];
            while (true) {
                if (!j && !type)
                    break;
                const prev = j;
                if (type === REMOVED) {
                    result.unshift({
                        type: swapped ? DiffType.removed : DiffType.added,
                        value: B[b],
                    });
                    b -= 1;
                }
                else if (type === ADDED) {
                    result.unshift({
                        type: swapped ? DiffType.added : DiffType.removed,
                        value: A[a],
                    });
                    a -= 1;
                }
                else {
                    result.unshift({ type: DiffType.common, value: A[a] });
                    a -= 1;
                    b -= 1;
                }
                j = routes[prev];
                type = routes[prev + diffTypesPtrOffset];
            }
            return result;
        }
        function createFP(slide, down, k, M) {
            if (slide && slide.y === -1 && down && down.y === -1) {
                return { y: 0, id: 0 };
            }
            if ((down && down.y === -1) ||
                k === M ||
                (slide && slide.y) > (down && down.y) + 1) {
                const prev = slide.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = ADDED;
                return { y: slide.y, id: ptr };
            }
            else {
                const prev = down.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = REMOVED;
                return { y: down.y + 1, id: ptr };
            }
        }
        function snake(k, slide, down, _offset, A, B) {
            const M = A.length;
            const N = B.length;
            if (k < -N || M < k)
                return { y: -1, id: -1 };
            const fp = createFP(slide, down, k, M);
            while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
                const prev = fp.id;
                ptr++;
                fp.id = ptr;
                fp.y += 1;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = COMMON;
            }
            return fp;
        }
        while (fp[delta + offset].y < N) {
            p = p + 1;
            for (let k = -p; k < delta; ++k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            for (let k = delta + p; k > delta; --k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
        }
        return [
            ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ...backTrace(A, B, fp[delta + offset], swapped),
            ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
        ];
    }
    exports_30("default", diff);
    return {
        setters: [],
        execute: function () {
            (function (DiffType) {
                DiffType["removed"] = "removed";
                DiffType["common"] = "common";
                DiffType["added"] = "added";
            })(DiffType || (DiffType = {}));
            exports_30("DiffType", DiffType);
            REMOVED = 1;
            COMMON = 2;
            ADDED = 3;
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/testing/asserts", ["https://deno.land/x/std@v0.51.0/fmt/colors", "https://deno.land/x/std@v0.51.0/testing/diff"], function (exports_31, context_31) {
    "use strict";
    var colors_ts_4, diff_ts_2, CAN_NOT_DISPLAY, AssertionError;
    var __moduleName = context_31 && context_31.id;
    function format(v) {
        let string = Deno.inspect(v);
        if (typeof v == "string") {
            string = `"${string.replace(/(?=["\\])/g, "\\")}"`;
        }
        return string;
    }
    function createColor(diffType) {
        switch (diffType) {
            case diff_ts_2.DiffType.added:
                return (s) => colors_ts_4.green(colors_ts_4.bold(s));
            case diff_ts_2.DiffType.removed:
                return (s) => colors_ts_4.red(colors_ts_4.bold(s));
            default:
                return colors_ts_4.white;
        }
    }
    function createSign(diffType) {
        switch (diffType) {
            case diff_ts_2.DiffType.added:
                return "+   ";
            case diff_ts_2.DiffType.removed:
                return "-   ";
            default:
                return "    ";
        }
    }
    function buildMessage(diffResult) {
        const messages = [];
        messages.push("");
        messages.push("");
        messages.push(`    ${colors_ts_4.gray(colors_ts_4.bold("[Diff]"))} ${colors_ts_4.red(colors_ts_4.bold("Actual"))} / ${colors_ts_4.green(colors_ts_4.bold("Expected"))}`);
        messages.push("");
        messages.push("");
        diffResult.forEach((result) => {
            const c = createColor(result.type);
            messages.push(c(`${createSign(result.type)}${result.value}`));
        });
        messages.push("");
        return messages;
    }
    function isKeyedCollection(x) {
        return [Symbol.iterator, "size"].every((k) => k in x);
    }
    function equal(c, d) {
        const seen = new Map();
        return (function compare(a, b) {
            // Have to render RegExp & Date for string comparison
            // unless it's mistreated as object
            if (a &&
                b &&
                ((a instanceof RegExp && b instanceof RegExp) ||
                    (a instanceof Date && b instanceof Date))) {
                return String(a) === String(b);
            }
            if (Object.is(a, b)) {
                return true;
            }
            if (a && typeof a === "object" && b && typeof b === "object") {
                if (seen.get(a) === b) {
                    return true;
                }
                if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                    return false;
                }
                if (isKeyedCollection(a) && isKeyedCollection(b)) {
                    if (a.size !== b.size) {
                        return false;
                    }
                    let unmatchedEntries = a.size;
                    for (const [aKey, aValue] of a.entries()) {
                        for (const [bKey, bValue] of b.entries()) {
                            /* Given that Map keys can be references, we need
                             * to ensure that they are also deeply equal */
                            if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                                (compare(aKey, bKey) && compare(aValue, bValue))) {
                                unmatchedEntries--;
                            }
                        }
                    }
                    return unmatchedEntries === 0;
                }
                const merged = { ...a, ...b };
                for (const key in merged) {
                    if (!compare(a && a[key], b && b[key])) {
                        return false;
                    }
                }
                seen.set(a, b);
                return true;
            }
            return false;
        })(c, d);
    }
    exports_31("equal", equal);
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
        if (!expr) {
            throw new AssertionError(msg);
        }
    }
    exports_31("assert", assert);
    /**
     * Make an assertion that `actual` and `expected` are equal, deeply. If not
     * deeply equal, then throw.
     */
    function assertEquals(actual, expected, msg) {
        if (equal(actual, expected)) {
            return;
        }
        let message = "";
        const actualString = format(actual);
        const expectedString = format(expected);
        try {
            const diffResult = diff_ts_2.default(actualString.split("\n"), expectedString.split("\n"));
            message = buildMessage(diffResult).join("\n");
        }
        catch (e) {
            message = `\n${colors_ts_4.red(CAN_NOT_DISPLAY)} + \n\n`;
        }
        if (msg) {
            message = msg;
        }
        throw new AssertionError(message);
    }
    exports_31("assertEquals", assertEquals);
    /**
     * Make an assertion that `actual` and `expected` are not equal, deeply.
     * If not then throw.
     */
    function assertNotEquals(actual, expected, msg) {
        if (!equal(actual, expected)) {
            return;
        }
        let actualString;
        let expectedString;
        try {
            actualString = String(actual);
        }
        catch (e) {
            actualString = "[Cannot display]";
        }
        try {
            expectedString = String(expected);
        }
        catch (e) {
            expectedString = "[Cannot display]";
        }
        if (!msg) {
            msg = `actual: ${actualString} expected: ${expectedString}`;
        }
        throw new AssertionError(msg);
    }
    exports_31("assertNotEquals", assertNotEquals);
    /**
     * Make an assertion that `actual` and `expected` are strictly equal.  If
     * not then throw.
     */
    function assertStrictEq(actual, expected, msg) {
        if (actual !== expected) {
            let actualString;
            let expectedString;
            try {
                actualString = String(actual);
            }
            catch (e) {
                actualString = "[Cannot display]";
            }
            try {
                expectedString = String(expected);
            }
            catch (e) {
                expectedString = "[Cannot display]";
            }
            if (!msg) {
                msg = `actual: ${actualString} expected: ${expectedString}`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_31("assertStrictEq", assertStrictEq);
    /**
     * Make an assertion that actual contains expected. If not
     * then thrown.
     */
    function assertStrContains(actual, expected, msg) {
        if (!actual.includes(expected)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to contains: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_31("assertStrContains", assertStrContains);
    /**
     * Make an assertion that `actual` contains the `expected` values
     * If not then thrown.
     */
    function assertArrayContains(actual, expected, msg) {
        const missing = [];
        for (let i = 0; i < expected.length; i++) {
            let found = false;
            for (let j = 0; j < actual.length; j++) {
                if (equal(expected[i], actual[j])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missing.push(expected[i]);
            }
        }
        if (missing.length === 0) {
            return;
        }
        if (!msg) {
            msg = `actual: "${actual}" expected to contains: "${expected}"`;
            msg += "\n";
            msg += `missing: ${missing}`;
        }
        throw new AssertionError(msg);
    }
    exports_31("assertArrayContains", assertArrayContains);
    /**
     * Make an assertion that `actual` match RegExp `expected`. If not
     * then thrown
     */
    function assertMatch(actual, expected, msg) {
        if (!expected.test(actual)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to match: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_31("assertMatch", assertMatch);
    /**
     * Forcefully throws a failed assertion
     */
    function fail(msg) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
    }
    exports_31("fail", fail);
    /** Executes a function, expecting it to throw.  If it does not, then it
     * throws.  An error class and a string that should be included in the
     * error message can also be asserted.
     */
    function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            fn();
        }
        catch (e) {
            if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
                msg = `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes && !e.message.includes(msgIncludes)) {
                msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_31("assertThrows", assertThrows);
    async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            await fn();
        }
        catch (e) {
            if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
                msg = `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes && !e.message.includes(msgIncludes)) {
                msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_31("assertThrowsAsync", assertThrowsAsync);
    /** Use this to stub out methods that will throw when invoked. */
    function unimplemented(msg) {
        throw new AssertionError(msg || "unimplemented");
    }
    exports_31("unimplemented", unimplemented);
    /** Use this to assert unreachable code. */
    function unreachable() {
        throw new AssertionError("unreachable");
    }
    exports_31("unreachable", unreachable);
    return {
        setters: [
            function (colors_ts_4_1) {
                colors_ts_4 = colors_ts_4_1;
            },
            function (diff_ts_2_1) {
                diff_ts_2 = diff_ts_2_1;
            }
        ],
        execute: function () {
            CAN_NOT_DISPLAY = "[Cannot display]";
            AssertionError = class AssertionError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "AssertionError";
                }
            };
            exports_31("AssertionError", AssertionError);
        }
    };
});
System.register("https://deno.land/x/std@v0.51.0/log/mod", ["https://deno.land/x/std@v0.51.0/log/logger", "https://deno.land/x/std@v0.51.0/log/handlers", "https://deno.land/x/std@v0.51.0/testing/asserts", "https://deno.land/x/std@v0.51.0/log/levels"], function (exports_32, context_32) {
    "use strict";
    var logger_ts_1, handlers_ts_1, asserts_ts_1, LoggerConfig, DEFAULT_LEVEL, DEFAULT_CONFIG, state, handlers, debug, info, warning, error, critical;
    var __moduleName = context_32 && context_32.id;
    function getLogger(name) {
        if (!name) {
            const d = state.loggers.get("default");
            asserts_ts_1.assert(d != null, `"default" logger must be set for getting logger without name`);
            return d;
        }
        const result = state.loggers.get(name);
        if (!result) {
            const logger = new logger_ts_1.Logger("NOTSET", []);
            state.loggers.set(name, logger);
            return logger;
        }
        return result;
    }
    exports_32("getLogger", getLogger);
    async function setup(config) {
        state.config = {
            handlers: { ...DEFAULT_CONFIG.handlers, ...config.handlers },
            loggers: { ...DEFAULT_CONFIG.loggers, ...config.loggers },
        };
        // tear down existing handlers
        state.handlers.forEach((handler) => {
            handler.destroy();
        });
        state.handlers.clear();
        // setup handlers
        const handlers = state.config.handlers || {};
        for (const handlerName in handlers) {
            const handler = handlers[handlerName];
            await handler.setup();
            state.handlers.set(handlerName, handler);
        }
        // remove existing loggers
        state.loggers.clear();
        // setup loggers
        const loggers = state.config.loggers || {};
        for (const loggerName in loggers) {
            const loggerConfig = loggers[loggerName];
            const handlerNames = loggerConfig.handlers || [];
            const handlers = [];
            handlerNames.forEach((handlerName) => {
                const handler = state.handlers.get(handlerName);
                if (handler) {
                    handlers.push(handler);
                }
            });
            const levelName = loggerConfig.level || DEFAULT_LEVEL;
            const logger = new logger_ts_1.Logger(levelName, handlers);
            state.loggers.set(loggerName, logger);
        }
    }
    exports_32("setup", setup);
    return {
        setters: [
            function (logger_ts_1_1) {
                logger_ts_1 = logger_ts_1_1;
            },
            function (handlers_ts_1_1) {
                handlers_ts_1 = handlers_ts_1_1;
            },
            function (asserts_ts_1_1) {
                asserts_ts_1 = asserts_ts_1_1;
            },
            function (levels_ts_3_1) {
                exports_32({
                    "LogLevels": levels_ts_3_1["LogLevels"]
                });
            }
        ],
        execute: function () {
            LoggerConfig = class LoggerConfig {
            };
            exports_32("LoggerConfig", LoggerConfig);
            DEFAULT_LEVEL = "INFO";
            DEFAULT_CONFIG = {
                handlers: {
                    default: new handlers_ts_1.ConsoleHandler(DEFAULT_LEVEL),
                },
                loggers: {
                    default: {
                        level: DEFAULT_LEVEL,
                        handlers: ["default"],
                    },
                },
            };
            state = {
                handlers: new Map(),
                loggers: new Map(),
                config: DEFAULT_CONFIG,
            };
            exports_32("handlers", handlers = {
                BaseHandler: handlers_ts_1.BaseHandler,
                ConsoleHandler: handlers_ts_1.ConsoleHandler,
                WriterHandler: handlers_ts_1.WriterHandler,
                FileHandler: handlers_ts_1.FileHandler,
                RotatingFileHandler: handlers_ts_1.RotatingFileHandler,
            });
            exports_32("debug", debug = (msg, ...args) => getLogger("default").debug(msg, ...args));
            exports_32("info", info = (msg, ...args) => getLogger("default").info(msg, ...args));
            exports_32("warning", warning = (msg, ...args) => getLogger("default").warning(msg, ...args));
            exports_32("error", error = (msg, ...args) => getLogger("default").error(msg, ...args));
            exports_32("critical", critical = (msg, ...args) => getLogger("default").critical(msg, ...args));
            setup(DEFAULT_CONFIG);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/deps", ["https://deno.land/std@v0.51.0/async/mod", "https://deno.land/std@v0.51.0/encoding/utf8", "https://deno.land/std@v0.51.0/testing/asserts", "https://deno.land/x/bytes_formater@1.2.0/mod", "https://deno.land/x/checksum@1.4.0/mod", "https://deno.land/x/sha256@v1.0.2/mod", "https://deno.land/x/sql_builder@1.3.5/util", "https://deno.land/x/std@v0.51.0/log/mod"], function (exports_33, context_33) {
    "use strict";
    var __moduleName = context_33 && context_33.id;
    return {
        setters: [
            function (mod_ts_2_1) {
                exports_33({
                    "deferred": mod_ts_2_1["deferred"],
                    "delay": mod_ts_2_1["delay"]
                });
            },
            function (utf8_ts_1_1) {
                exports_33({
                    "decode": utf8_ts_1_1["decode"],
                    "encode": utf8_ts_1_1["encode"]
                });
            },
            function (asserts_ts_2_1) {
                exports_33({
                    "assertEquals": asserts_ts_2_1["assertEquals"],
                    "assertThrowsAsync": asserts_ts_2_1["assertThrowsAsync"]
                });
            },
            function (mod_ts_3_1) {
                exports_33({
                    "byteFormat": mod_ts_3_1["format"]
                });
            },
            function (mod_ts_4_1) {
                exports_33({
                    "Hash": mod_ts_4_1["Hash"]
                });
            },
            function (mod_ts_5_1) {
                exports_33({
                    "sha256": mod_ts_5_1["sha256"]
                });
            },
            function (util_ts_1_1) {
                exports_33({
                    "replaceParams": util_ts_1_1["replaceParams"]
                });
            },
            function (log_1) {
                exports_33("log", log_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/constant/errors", [], function (exports_34, context_34) {
    "use strict";
    var WriteError, ResponseTimeoutError;
    var __moduleName = context_34 && context_34.id;
    return {
        setters: [],
        execute: function () {
            WriteError = class WriteError extends Error {
                constructor(msg) {
                    super(msg);
                }
            };
            exports_34("WriteError", WriteError);
            ResponseTimeoutError = class ResponseTimeoutError extends Error {
                constructor(msg) {
                    super(msg);
                }
            };
            exports_34("ResponseTimeoutError", ResponseTimeoutError);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/logger", ["https://deno.land/x/mysql@2.1.0/deps"], function (exports_35, context_35) {
    "use strict";
    var deps_ts_4, isDebug;
    var __moduleName = context_35 && context_35.id;
    /** @ignore */
    function debug(func) {
        if (isDebug) {
            func();
        }
    }
    exports_35("debug", debug);
    /** @ignore */
    async function config(config) {
        isDebug = config.debug;
        await deps_ts_4.log.setup({
            handlers: {
                console: new deps_ts_4.log.handlers.ConsoleHandler(config.debug ? "DEBUG" : "INFO"),
                file: new deps_ts_4.log.handlers.FileHandler("WARNING", {
                    filename: config.logFile,
                    formatter: "{levelName} {msg}",
                }),
            },
            loggers: {
                default: {
                    level: "DEBUG",
                    handlers: ["console", "file"],
                },
            },
        });
    }
    exports_35("config", config);
    return {
        setters: [
            function (deps_ts_4_1) {
                deps_ts_4 = deps_ts_4_1;
            }
        ],
        execute: function () {
            exports_35("log", deps_ts_4.log);
            isDebug = false;
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/auth", ["https://deno.land/x/mysql@2.1.0/deps"], function (exports_36, context_36) {
    "use strict";
    var deps_ts_5;
    var __moduleName = context_36 && context_36.id;
    function xor(a, b) {
        return a.map((byte, index) => {
            return byte ^ b[index];
        });
    }
    function mysqlNativePassword(password, seed) {
        const hash = new deps_ts_5.Hash("sha1");
        const pwd1 = hash.digest(deps_ts_5.encode(password)).data;
        const pwd2 = hash.digest(pwd1).data;
        let seedAndPwd2 = new Uint8Array(seed.length + pwd2.length);
        seedAndPwd2.set(seed);
        seedAndPwd2.set(pwd2, seed.length);
        seedAndPwd2 = hash.digest(seedAndPwd2).data;
        return xor(seedAndPwd2, pwd1);
    }
    function cachingSha2Password(password, seed) {
        const stage1 = deps_ts_5.sha256(password, "utf8");
        const stage2 = deps_ts_5.sha256(stage1);
        const stage3 = deps_ts_5.sha256(Uint8Array.from([...stage2, ...seed]));
        return xor(stage1, stage3);
    }
    function auth(authPluginName, password, seed) {
        switch (authPluginName) {
            case "mysql_native_password":
                return mysqlNativePassword(password, seed);
            case "caching_sha2_password":
            // TODO
            // return cachingSha2Password(password, seed);
            default:
                throw new Error("Not supported");
        }
    }
    exports_36("default", auth);
    return {
        setters: [
            function (deps_ts_5_1) {
                deps_ts_5 = deps_ts_5_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/buffer", ["https://deno.land/x/mysql@2.1.0/deps"], function (exports_37, context_37) {
    "use strict";
    var deps_ts_6, BufferReader, BufferWriter;
    var __moduleName = context_37 && context_37.id;
    return {
        setters: [
            function (deps_ts_6_1) {
                deps_ts_6 = deps_ts_6_1;
            }
        ],
        execute: function () {
            /** @ignore */
            BufferReader = class BufferReader {
                constructor(buffer) {
                    this.buffer = buffer;
                    this.pos = 0;
                }
                get finished() {
                    return this.pos >= this.buffer.length;
                }
                skip(len) {
                    this.pos += len;
                    return this;
                }
                readBuffer(len) {
                    const buffer = this.buffer.slice(this.pos, this.pos + len);
                    this.pos += len;
                    return buffer;
                }
                readUints(len) {
                    let num = 0;
                    for (let n = 0; n < len; n++) {
                        num += this.buffer[this.pos++] << (8 * n);
                    }
                    return num;
                }
                readUint8() {
                    return this.buffer[this.pos++];
                }
                readUint16() {
                    return this.readUints(2);
                }
                readUint32() {
                    return this.readUints(4);
                }
                readUint64() {
                    return this.readUints(8);
                }
                readNullTerminatedString() {
                    let end = this.buffer.indexOf(0x00, this.pos);
                    if (end === -1)
                        end = this.buffer.length;
                    const buf = this.buffer.slice(this.pos, end);
                    this.pos += buf.length + 1;
                    return deps_ts_6.decode(buf);
                }
                readString(len) {
                    const str = deps_ts_6.decode(this.buffer.slice(this.pos, this.pos + len));
                    this.pos += len;
                    return str;
                }
                readEncodedLen() {
                    const first = this.readUint8();
                    if (first < 251) {
                        return first;
                    }
                    else {
                        if (first == 0xfc) {
                            return this.readUint16();
                        }
                        else if (first == 0xfd) {
                            return this.readUints(3);
                        }
                        else if (first == 0xfe) {
                            return this.readUints(8);
                        }
                    }
                    return -1;
                }
                readLenCodeString() {
                    const len = this.readEncodedLen();
                    if (len == -1)
                        return null;
                    return this.readString(len);
                }
            };
            exports_37("BufferReader", BufferReader);
            /** @ignore */
            BufferWriter = class BufferWriter {
                constructor(buffer) {
                    this.buffer = buffer;
                    this.pos = 0;
                }
                get wroteData() {
                    return this.buffer.slice(0, this.pos);
                }
                get length() {
                    return this.pos;
                }
                get capacity() {
                    return this.buffer.length - this.pos;
                }
                skip(len) {
                    this.pos += len;
                    return this;
                }
                writeBuffer(buffer) {
                    if (buffer.length > this.capacity) {
                        buffer = buffer.slice(0, this.capacity);
                    }
                    this.buffer.set(buffer, this.pos);
                    this.pos += buffer.length;
                    return this;
                }
                write(byte) {
                    this.buffer[this.pos++] = byte;
                    return this;
                }
                writeInt16LE(num) { }
                writeIntLE(num, len) {
                    const int = new Int32Array(1);
                    int[0] = 40;
                    console.log(int);
                }
                writeUint16(num) {
                    return this.writeUints(2, num);
                }
                writeUint32(num) {
                    return this.writeUints(4, num);
                }
                writeUint64(num) {
                    return this.writeUints(8, num);
                }
                writeUints(len, num) {
                    for (let n = 0; n < len; n++) {
                        this.buffer[this.pos++] = (num >> (n * 8)) & 0xff;
                    }
                    return this;
                }
                writeNullTerminatedString(str) {
                    return this.writeString(str).write(0x00);
                }
                writeString(str) {
                    const buf = deps_ts_6.encode(str);
                    this.buffer.set(buf, this.pos);
                    this.pos += buf.length;
                    return this;
                }
            };
            exports_37("BufferWriter", BufferWriter);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/constant/capabilities", [], function (exports_38, context_38) {
    "use strict";
    var ServerCapabilities;
    var __moduleName = context_38 && context_38.id;
    return {
        setters: [],
        execute: function () {
            (function (ServerCapabilities) {
                ServerCapabilities[ServerCapabilities["CLIENT_PROTOCOL_41"] = 512] = "CLIENT_PROTOCOL_41";
                ServerCapabilities[ServerCapabilities["CLIENT_CONNECT_WITH_DB"] = 8] = "CLIENT_CONNECT_WITH_DB";
                ServerCapabilities[ServerCapabilities["CLIENT_LONG_FLAG"] = 4] = "CLIENT_LONG_FLAG";
                ServerCapabilities[ServerCapabilities["CLIENT_DEPRECATE_EOF"] = 16777216] = "CLIENT_DEPRECATE_EOF";
                ServerCapabilities[ServerCapabilities["CLIENT_LONG_PASSWORD"] = 1] = "CLIENT_LONG_PASSWORD";
                ServerCapabilities[ServerCapabilities["CLIENT_TRANSACTIONS"] = 8192] = "CLIENT_TRANSACTIONS";
                ServerCapabilities[ServerCapabilities["CLIENT_MULTI_RESULTS"] = 131072] = "CLIENT_MULTI_RESULTS";
                ServerCapabilities[ServerCapabilities["CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA"] = 2097152] = "CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA";
                ServerCapabilities[ServerCapabilities["CLIENT_PLUGIN_AUTH"] = 524288] = "CLIENT_PLUGIN_AUTH";
                ServerCapabilities[ServerCapabilities["CLIENT_SECURE_CONNECTION"] = 32768] = "CLIENT_SECURE_CONNECTION";
                ServerCapabilities[ServerCapabilities["CLIENT_FOUND_ROWS"] = 2] = "CLIENT_FOUND_ROWS";
                ServerCapabilities[ServerCapabilities["CLIENT_CONNECT_ATTRS"] = 1048576] = "CLIENT_CONNECT_ATTRS";
            })(ServerCapabilities || (ServerCapabilities = {}));
            exports_38("default", ServerCapabilities);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/constant/charset", [], function (exports_39, context_39) {
    "use strict";
    var Charset;
    var __moduleName = context_39 && context_39.id;
    return {
        setters: [],
        execute: function () {
            (function (Charset) {
                Charset[Charset["BIG5_CHINESE_CI"] = 1] = "BIG5_CHINESE_CI";
                Charset[Charset["LATIN2_CZECH_CS"] = 2] = "LATIN2_CZECH_CS";
                Charset[Charset["DEC8_SWEDISH_CI"] = 3] = "DEC8_SWEDISH_CI";
                Charset[Charset["CP850_GENERAL_CI"] = 4] = "CP850_GENERAL_CI";
                Charset[Charset["LATIN1_GERMAN1_CI"] = 5] = "LATIN1_GERMAN1_CI";
                Charset[Charset["HP8_ENGLISH_CI"] = 6] = "HP8_ENGLISH_CI";
                Charset[Charset["KOI8R_GENERAL_CI"] = 7] = "KOI8R_GENERAL_CI";
                Charset[Charset["LATIN1_SWEDISH_CI"] = 8] = "LATIN1_SWEDISH_CI";
                Charset[Charset["LATIN2_GENERAL_CI"] = 9] = "LATIN2_GENERAL_CI";
                Charset[Charset["SWE7_SWEDISH_CI"] = 10] = "SWE7_SWEDISH_CI";
                Charset[Charset["ASCII_GENERAL_CI"] = 11] = "ASCII_GENERAL_CI";
                Charset[Charset["UJIS_JAPANESE_CI"] = 12] = "UJIS_JAPANESE_CI";
                Charset[Charset["SJIS_JAPANESE_CI"] = 13] = "SJIS_JAPANESE_CI";
                Charset[Charset["CP1251_BULGARIAN_CI"] = 14] = "CP1251_BULGARIAN_CI";
                Charset[Charset["LATIN1_DANISH_CI"] = 15] = "LATIN1_DANISH_CI";
                Charset[Charset["HEBREW_GENERAL_CI"] = 16] = "HEBREW_GENERAL_CI";
                Charset[Charset["TIS620_THAI_CI"] = 18] = "TIS620_THAI_CI";
                Charset[Charset["EUCKR_KOREAN_CI"] = 19] = "EUCKR_KOREAN_CI";
                Charset[Charset["LATIN7_ESTONIAN_CS"] = 20] = "LATIN7_ESTONIAN_CS";
                Charset[Charset["LATIN2_HUNGARIAN_CI"] = 21] = "LATIN2_HUNGARIAN_CI";
                Charset[Charset["KOI8U_GENERAL_CI"] = 22] = "KOI8U_GENERAL_CI";
                Charset[Charset["CP1251_UKRAINIAN_CI"] = 23] = "CP1251_UKRAINIAN_CI";
                Charset[Charset["GB2312_CHINESE_CI"] = 24] = "GB2312_CHINESE_CI";
                Charset[Charset["GREEK_GENERAL_CI"] = 25] = "GREEK_GENERAL_CI";
                Charset[Charset["CP1250_GENERAL_CI"] = 26] = "CP1250_GENERAL_CI";
                Charset[Charset["LATIN2_CROATIAN_CI"] = 27] = "LATIN2_CROATIAN_CI";
                Charset[Charset["GBK_CHINESE_CI"] = 28] = "GBK_CHINESE_CI";
                Charset[Charset["CP1257_LITHUANIAN_CI"] = 29] = "CP1257_LITHUANIAN_CI";
                Charset[Charset["LATIN5_TURKISH_CI"] = 30] = "LATIN5_TURKISH_CI";
                Charset[Charset["LATIN1_GERMAN2_CI"] = 31] = "LATIN1_GERMAN2_CI";
                Charset[Charset["ARMSCII8_GENERAL_CI"] = 32] = "ARMSCII8_GENERAL_CI";
                Charset[Charset["UTF8_GENERAL_CI"] = 33] = "UTF8_GENERAL_CI";
                Charset[Charset["CP1250_CZECH_CS"] = 34] = "CP1250_CZECH_CS";
                Charset[Charset["UCS2_GENERAL_CI"] = 35] = "UCS2_GENERAL_CI";
                Charset[Charset["CP866_GENERAL_CI"] = 36] = "CP866_GENERAL_CI";
                Charset[Charset["KEYBCS2_GENERAL_CI"] = 37] = "KEYBCS2_GENERAL_CI";
                Charset[Charset["MACCE_GENERAL_CI"] = 38] = "MACCE_GENERAL_CI";
                Charset[Charset["MACROMAN_GENERAL_CI"] = 39] = "MACROMAN_GENERAL_CI";
                Charset[Charset["CP852_GENERAL_CI"] = 40] = "CP852_GENERAL_CI";
                Charset[Charset["LATIN7_GENERAL_CI"] = 41] = "LATIN7_GENERAL_CI";
                Charset[Charset["LATIN7_GENERAL_CS"] = 42] = "LATIN7_GENERAL_CS";
                Charset[Charset["MACCE_BIN"] = 43] = "MACCE_BIN";
                Charset[Charset["CP1250_CROATIAN_CI"] = 44] = "CP1250_CROATIAN_CI";
                Charset[Charset["UTF8MB4_GENERAL_CI"] = 45] = "UTF8MB4_GENERAL_CI";
                Charset[Charset["UTF8MB4_BIN"] = 46] = "UTF8MB4_BIN";
                Charset[Charset["LATIN1_BIN"] = 47] = "LATIN1_BIN";
                Charset[Charset["LATIN1_GENERAL_CI"] = 48] = "LATIN1_GENERAL_CI";
                Charset[Charset["LATIN1_GENERAL_CS"] = 49] = "LATIN1_GENERAL_CS";
                Charset[Charset["CP1251_BIN"] = 50] = "CP1251_BIN";
                Charset[Charset["CP1251_GENERAL_CI"] = 51] = "CP1251_GENERAL_CI";
                Charset[Charset["CP1251_GENERAL_CS"] = 52] = "CP1251_GENERAL_CS";
                Charset[Charset["MACROMAN_BIN"] = 53] = "MACROMAN_BIN";
                Charset[Charset["UTF16_GENERAL_CI"] = 54] = "UTF16_GENERAL_CI";
                Charset[Charset["UTF16_BIN"] = 55] = "UTF16_BIN";
                Charset[Charset["UTF16LE_GENERAL_CI"] = 56] = "UTF16LE_GENERAL_CI";
                Charset[Charset["CP1256_GENERAL_CI"] = 57] = "CP1256_GENERAL_CI";
                Charset[Charset["CP1257_BIN"] = 58] = "CP1257_BIN";
                Charset[Charset["CP1257_GENERAL_CI"] = 59] = "CP1257_GENERAL_CI";
                Charset[Charset["UTF32_GENERAL_CI"] = 60] = "UTF32_GENERAL_CI";
                Charset[Charset["UTF32_BIN"] = 61] = "UTF32_BIN";
                Charset[Charset["UTF16LE_BIN"] = 62] = "UTF16LE_BIN";
                Charset[Charset["BINARY"] = 63] = "BINARY";
                Charset[Charset["ARMSCII8_BIN"] = 64] = "ARMSCII8_BIN";
                Charset[Charset["ASCII_BIN"] = 65] = "ASCII_BIN";
                Charset[Charset["CP1250_BIN"] = 66] = "CP1250_BIN";
                Charset[Charset["CP1256_BIN"] = 67] = "CP1256_BIN";
                Charset[Charset["CP866_BIN"] = 68] = "CP866_BIN";
                Charset[Charset["DEC8_BIN"] = 69] = "DEC8_BIN";
                Charset[Charset["GREEK_BIN"] = 70] = "GREEK_BIN";
                Charset[Charset["HEBREW_BIN"] = 71] = "HEBREW_BIN";
                Charset[Charset["HP8_BIN"] = 72] = "HP8_BIN";
                Charset[Charset["KEYBCS2_BIN"] = 73] = "KEYBCS2_BIN";
                Charset[Charset["KOI8R_BIN"] = 74] = "KOI8R_BIN";
                Charset[Charset["KOI8U_BIN"] = 75] = "KOI8U_BIN";
                Charset[Charset["LATIN2_BIN"] = 77] = "LATIN2_BIN";
                Charset[Charset["LATIN5_BIN"] = 78] = "LATIN5_BIN";
                Charset[Charset["LATIN7_BIN"] = 79] = "LATIN7_BIN";
                Charset[Charset["CP850_BIN"] = 80] = "CP850_BIN";
                Charset[Charset["CP852_BIN"] = 81] = "CP852_BIN";
                Charset[Charset["SWE7_BIN"] = 82] = "SWE7_BIN";
                Charset[Charset["UTF8_BIN"] = 83] = "UTF8_BIN";
                Charset[Charset["BIG5_BIN"] = 84] = "BIG5_BIN";
                Charset[Charset["EUCKR_BIN"] = 85] = "EUCKR_BIN";
                Charset[Charset["GB2312_BIN"] = 86] = "GB2312_BIN";
                Charset[Charset["GBK_BIN"] = 87] = "GBK_BIN";
                Charset[Charset["SJIS_BIN"] = 88] = "SJIS_BIN";
                Charset[Charset["TIS620_BIN"] = 89] = "TIS620_BIN";
                Charset[Charset["UCS2_BIN"] = 90] = "UCS2_BIN";
                Charset[Charset["UJIS_BIN"] = 91] = "UJIS_BIN";
                Charset[Charset["GEOSTD8_GENERAL_CI"] = 92] = "GEOSTD8_GENERAL_CI";
                Charset[Charset["GEOSTD8_BIN"] = 93] = "GEOSTD8_BIN";
                Charset[Charset["LATIN1_SPANISH_CI"] = 94] = "LATIN1_SPANISH_CI";
                Charset[Charset["CP932_JAPANESE_CI"] = 95] = "CP932_JAPANESE_CI";
                Charset[Charset["CP932_BIN"] = 96] = "CP932_BIN";
                Charset[Charset["EUCJPMS_JAPANESE_CI"] = 97] = "EUCJPMS_JAPANESE_CI";
                Charset[Charset["EUCJPMS_BIN"] = 98] = "EUCJPMS_BIN";
                Charset[Charset["CP1250_POLISH_CI"] = 99] = "CP1250_POLISH_CI";
                Charset[Charset["UTF16_UNICODE_CI"] = 101] = "UTF16_UNICODE_CI";
                Charset[Charset["UTF16_ICELANDIC_CI"] = 102] = "UTF16_ICELANDIC_CI";
                Charset[Charset["UTF16_LATVIAN_CI"] = 103] = "UTF16_LATVIAN_CI";
                Charset[Charset["UTF16_ROMANIAN_CI"] = 104] = "UTF16_ROMANIAN_CI";
                Charset[Charset["UTF16_SLOVENIAN_CI"] = 105] = "UTF16_SLOVENIAN_CI";
                Charset[Charset["UTF16_POLISH_CI"] = 106] = "UTF16_POLISH_CI";
                Charset[Charset["UTF16_ESTONIAN_CI"] = 107] = "UTF16_ESTONIAN_CI";
                Charset[Charset["UTF16_SPANISH_CI"] = 108] = "UTF16_SPANISH_CI";
                Charset[Charset["UTF16_SWEDISH_CI"] = 109] = "UTF16_SWEDISH_CI";
                Charset[Charset["UTF16_TURKISH_CI"] = 110] = "UTF16_TURKISH_CI";
                Charset[Charset["UTF16_CZECH_CI"] = 111] = "UTF16_CZECH_CI";
                Charset[Charset["UTF16_DANISH_CI"] = 112] = "UTF16_DANISH_CI";
                Charset[Charset["UTF16_LITHUANIAN_CI"] = 113] = "UTF16_LITHUANIAN_CI";
                Charset[Charset["UTF16_SLOVAK_CI"] = 114] = "UTF16_SLOVAK_CI";
                Charset[Charset["UTF16_SPANISH2_CI"] = 115] = "UTF16_SPANISH2_CI";
                Charset[Charset["UTF16_ROMAN_CI"] = 116] = "UTF16_ROMAN_CI";
                Charset[Charset["UTF16_PERSIAN_CI"] = 117] = "UTF16_PERSIAN_CI";
                Charset[Charset["UTF16_ESPERANTO_CI"] = 118] = "UTF16_ESPERANTO_CI";
                Charset[Charset["UTF16_HUNGARIAN_CI"] = 119] = "UTF16_HUNGARIAN_CI";
                Charset[Charset["UTF16_SINHALA_CI"] = 120] = "UTF16_SINHALA_CI";
                Charset[Charset["UTF16_GERMAN2_CI"] = 121] = "UTF16_GERMAN2_CI";
                Charset[Charset["UTF16_CROATIAN_MYSQL561_CI"] = 122] = "UTF16_CROATIAN_MYSQL561_CI";
                Charset[Charset["UTF16_UNICODE_520_CI"] = 123] = "UTF16_UNICODE_520_CI";
                Charset[Charset["UTF16_VIETNAMESE_CI"] = 124] = "UTF16_VIETNAMESE_CI";
                Charset[Charset["UCS2_UNICODE_CI"] = 128] = "UCS2_UNICODE_CI";
                Charset[Charset["UCS2_ICELANDIC_CI"] = 129] = "UCS2_ICELANDIC_CI";
                Charset[Charset["UCS2_LATVIAN_CI"] = 130] = "UCS2_LATVIAN_CI";
                Charset[Charset["UCS2_ROMANIAN_CI"] = 131] = "UCS2_ROMANIAN_CI";
                Charset[Charset["UCS2_SLOVENIAN_CI"] = 132] = "UCS2_SLOVENIAN_CI";
                Charset[Charset["UCS2_POLISH_CI"] = 133] = "UCS2_POLISH_CI";
                Charset[Charset["UCS2_ESTONIAN_CI"] = 134] = "UCS2_ESTONIAN_CI";
                Charset[Charset["UCS2_SPANISH_CI"] = 135] = "UCS2_SPANISH_CI";
                Charset[Charset["UCS2_SWEDISH_CI"] = 136] = "UCS2_SWEDISH_CI";
                Charset[Charset["UCS2_TURKISH_CI"] = 137] = "UCS2_TURKISH_CI";
                Charset[Charset["UCS2_CZECH_CI"] = 138] = "UCS2_CZECH_CI";
                Charset[Charset["UCS2_DANISH_CI"] = 139] = "UCS2_DANISH_CI";
                Charset[Charset["UCS2_LITHUANIAN_CI"] = 140] = "UCS2_LITHUANIAN_CI";
                Charset[Charset["UCS2_SLOVAK_CI"] = 141] = "UCS2_SLOVAK_CI";
                Charset[Charset["UCS2_SPANISH2_CI"] = 142] = "UCS2_SPANISH2_CI";
                Charset[Charset["UCS2_ROMAN_CI"] = 143] = "UCS2_ROMAN_CI";
                Charset[Charset["UCS2_PERSIAN_CI"] = 144] = "UCS2_PERSIAN_CI";
                Charset[Charset["UCS2_ESPERANTO_CI"] = 145] = "UCS2_ESPERANTO_CI";
                Charset[Charset["UCS2_HUNGARIAN_CI"] = 146] = "UCS2_HUNGARIAN_CI";
                Charset[Charset["UCS2_SINHALA_CI"] = 147] = "UCS2_SINHALA_CI";
                Charset[Charset["UCS2_GERMAN2_CI"] = 148] = "UCS2_GERMAN2_CI";
                Charset[Charset["UCS2_CROATIAN_MYSQL561_CI"] = 149] = "UCS2_CROATIAN_MYSQL561_CI";
                Charset[Charset["UCS2_UNICODE_520_CI"] = 150] = "UCS2_UNICODE_520_CI";
                Charset[Charset["UCS2_VIETNAMESE_CI"] = 151] = "UCS2_VIETNAMESE_CI";
                Charset[Charset["UCS2_GENERAL_MYSQL500_CI"] = 159] = "UCS2_GENERAL_MYSQL500_CI";
                Charset[Charset["UTF32_UNICODE_CI"] = 160] = "UTF32_UNICODE_CI";
                Charset[Charset["UTF32_ICELANDIC_CI"] = 161] = "UTF32_ICELANDIC_CI";
                Charset[Charset["UTF32_LATVIAN_CI"] = 162] = "UTF32_LATVIAN_CI";
                Charset[Charset["UTF32_ROMANIAN_CI"] = 163] = "UTF32_ROMANIAN_CI";
                Charset[Charset["UTF32_SLOVENIAN_CI"] = 164] = "UTF32_SLOVENIAN_CI";
                Charset[Charset["UTF32_POLISH_CI"] = 165] = "UTF32_POLISH_CI";
                Charset[Charset["UTF32_ESTONIAN_CI"] = 166] = "UTF32_ESTONIAN_CI";
                Charset[Charset["UTF32_SPANISH_CI"] = 167] = "UTF32_SPANISH_CI";
                Charset[Charset["UTF32_SWEDISH_CI"] = 168] = "UTF32_SWEDISH_CI";
                Charset[Charset["UTF32_TURKISH_CI"] = 169] = "UTF32_TURKISH_CI";
                Charset[Charset["UTF32_CZECH_CI"] = 170] = "UTF32_CZECH_CI";
                Charset[Charset["UTF32_DANISH_CI"] = 171] = "UTF32_DANISH_CI";
                Charset[Charset["UTF32_LITHUANIAN_CI"] = 172] = "UTF32_LITHUANIAN_CI";
                Charset[Charset["UTF32_SLOVAK_CI"] = 173] = "UTF32_SLOVAK_CI";
                Charset[Charset["UTF32_SPANISH2_CI"] = 174] = "UTF32_SPANISH2_CI";
                Charset[Charset["UTF32_ROMAN_CI"] = 175] = "UTF32_ROMAN_CI";
                Charset[Charset["UTF32_PERSIAN_CI"] = 176] = "UTF32_PERSIAN_CI";
                Charset[Charset["UTF32_ESPERANTO_CI"] = 177] = "UTF32_ESPERANTO_CI";
                Charset[Charset["UTF32_HUNGARIAN_CI"] = 178] = "UTF32_HUNGARIAN_CI";
                Charset[Charset["UTF32_SINHALA_CI"] = 179] = "UTF32_SINHALA_CI";
                Charset[Charset["UTF32_GERMAN2_CI"] = 180] = "UTF32_GERMAN2_CI";
                Charset[Charset["UTF32_CROATIAN_MYSQL561_CI"] = 181] = "UTF32_CROATIAN_MYSQL561_CI";
                Charset[Charset["UTF32_UNICODE_520_CI"] = 182] = "UTF32_UNICODE_520_CI";
                Charset[Charset["UTF32_VIETNAMESE_CI"] = 183] = "UTF32_VIETNAMESE_CI";
                Charset[Charset["UTF8_UNICODE_CI"] = 192] = "UTF8_UNICODE_CI";
                Charset[Charset["UTF8_ICELANDIC_CI"] = 193] = "UTF8_ICELANDIC_CI";
                Charset[Charset["UTF8_LATVIAN_CI"] = 194] = "UTF8_LATVIAN_CI";
                Charset[Charset["UTF8_ROMANIAN_CI"] = 195] = "UTF8_ROMANIAN_CI";
                Charset[Charset["UTF8_SLOVENIAN_CI"] = 196] = "UTF8_SLOVENIAN_CI";
                Charset[Charset["UTF8_POLISH_CI"] = 197] = "UTF8_POLISH_CI";
                Charset[Charset["UTF8_ESTONIAN_CI"] = 198] = "UTF8_ESTONIAN_CI";
                Charset[Charset["UTF8_SPANISH_CI"] = 199] = "UTF8_SPANISH_CI";
                Charset[Charset["UTF8_SWEDISH_CI"] = 200] = "UTF8_SWEDISH_CI";
                Charset[Charset["UTF8_TURKISH_CI"] = 201] = "UTF8_TURKISH_CI";
                Charset[Charset["UTF8_CZECH_CI"] = 202] = "UTF8_CZECH_CI";
                Charset[Charset["UTF8_DANISH_CI"] = 203] = "UTF8_DANISH_CI";
                Charset[Charset["UTF8_LITHUANIAN_CI"] = 204] = "UTF8_LITHUANIAN_CI";
                Charset[Charset["UTF8_SLOVAK_CI"] = 205] = "UTF8_SLOVAK_CI";
                Charset[Charset["UTF8_SPANISH2_CI"] = 206] = "UTF8_SPANISH2_CI";
                Charset[Charset["UTF8_ROMAN_CI"] = 207] = "UTF8_ROMAN_CI";
                Charset[Charset["UTF8_PERSIAN_CI"] = 208] = "UTF8_PERSIAN_CI";
                Charset[Charset["UTF8_ESPERANTO_CI"] = 209] = "UTF8_ESPERANTO_CI";
                Charset[Charset["UTF8_HUNGARIAN_CI"] = 210] = "UTF8_HUNGARIAN_CI";
                Charset[Charset["UTF8_SINHALA_CI"] = 211] = "UTF8_SINHALA_CI";
                Charset[Charset["UTF8_GERMAN2_CI"] = 212] = "UTF8_GERMAN2_CI";
                Charset[Charset["UTF8_CROATIAN_MYSQL561_CI"] = 213] = "UTF8_CROATIAN_MYSQL561_CI";
                Charset[Charset["UTF8_UNICODE_520_CI"] = 214] = "UTF8_UNICODE_520_CI";
                Charset[Charset["UTF8_VIETNAMESE_CI"] = 215] = "UTF8_VIETNAMESE_CI";
                Charset[Charset["UTF8_GENERAL_MYSQL500_CI"] = 223] = "UTF8_GENERAL_MYSQL500_CI";
                Charset[Charset["UTF8MB4_UNICODE_CI"] = 224] = "UTF8MB4_UNICODE_CI";
                Charset[Charset["UTF8MB4_ICELANDIC_CI"] = 225] = "UTF8MB4_ICELANDIC_CI";
                Charset[Charset["UTF8MB4_LATVIAN_CI"] = 226] = "UTF8MB4_LATVIAN_CI";
                Charset[Charset["UTF8MB4_ROMANIAN_CI"] = 227] = "UTF8MB4_ROMANIAN_CI";
                Charset[Charset["UTF8MB4_SLOVENIAN_CI"] = 228] = "UTF8MB4_SLOVENIAN_CI";
                Charset[Charset["UTF8MB4_POLISH_CI"] = 229] = "UTF8MB4_POLISH_CI";
                Charset[Charset["UTF8MB4_ESTONIAN_CI"] = 230] = "UTF8MB4_ESTONIAN_CI";
                Charset[Charset["UTF8MB4_SPANISH_CI"] = 231] = "UTF8MB4_SPANISH_CI";
                Charset[Charset["UTF8MB4_SWEDISH_CI"] = 232] = "UTF8MB4_SWEDISH_CI";
                Charset[Charset["UTF8MB4_TURKISH_CI"] = 233] = "UTF8MB4_TURKISH_CI";
                Charset[Charset["UTF8MB4_CZECH_CI"] = 234] = "UTF8MB4_CZECH_CI";
                Charset[Charset["UTF8MB4_DANISH_CI"] = 235] = "UTF8MB4_DANISH_CI";
                Charset[Charset["UTF8MB4_LITHUANIAN_CI"] = 236] = "UTF8MB4_LITHUANIAN_CI";
                Charset[Charset["UTF8MB4_SLOVAK_CI"] = 237] = "UTF8MB4_SLOVAK_CI";
                Charset[Charset["UTF8MB4_SPANISH2_CI"] = 238] = "UTF8MB4_SPANISH2_CI";
                Charset[Charset["UTF8MB4_ROMAN_CI"] = 239] = "UTF8MB4_ROMAN_CI";
                Charset[Charset["UTF8MB4_PERSIAN_CI"] = 240] = "UTF8MB4_PERSIAN_CI";
                Charset[Charset["UTF8MB4_ESPERANTO_CI"] = 241] = "UTF8MB4_ESPERANTO_CI";
                Charset[Charset["UTF8MB4_HUNGARIAN_CI"] = 242] = "UTF8MB4_HUNGARIAN_CI";
                Charset[Charset["UTF8MB4_SINHALA_CI"] = 243] = "UTF8MB4_SINHALA_CI";
                Charset[Charset["UTF8MB4_GERMAN2_CI"] = 244] = "UTF8MB4_GERMAN2_CI";
                Charset[Charset["UTF8MB4_CROATIAN_MYSQL561_CI"] = 245] = "UTF8MB4_CROATIAN_MYSQL561_CI";
                Charset[Charset["UTF8MB4_UNICODE_520_CI"] = 246] = "UTF8MB4_UNICODE_520_CI";
                Charset[Charset["UTF8MB4_VIETNAMESE_CI"] = 247] = "UTF8MB4_VIETNAMESE_CI";
                Charset[Charset["UTF8_GENERAL50_CI"] = 253] = "UTF8_GENERAL50_CI";
                Charset[Charset["ARMSCII8"] = 32] = "ARMSCII8";
                Charset[Charset["ASCII"] = 11] = "ASCII";
                Charset[Charset["BIG5"] = 1] = "BIG5";
                Charset[Charset["CP1250"] = 26] = "CP1250";
                Charset[Charset["CP1251"] = 51] = "CP1251";
                Charset[Charset["CP1256"] = 57] = "CP1256";
                Charset[Charset["CP1257"] = 59] = "CP1257";
                Charset[Charset["CP866"] = 36] = "CP866";
                Charset[Charset["CP850"] = 4] = "CP850";
                Charset[Charset["CP852"] = 40] = "CP852";
                Charset[Charset["CP932"] = 95] = "CP932";
                Charset[Charset["DEC8"] = 3] = "DEC8";
                Charset[Charset["EUCJPMS"] = 97] = "EUCJPMS";
                Charset[Charset["EUCKR"] = 19] = "EUCKR";
                Charset[Charset["GB2312"] = 24] = "GB2312";
                Charset[Charset["GBK"] = 28] = "GBK";
                Charset[Charset["GEOSTD8"] = 92] = "GEOSTD8";
                Charset[Charset["GREEK"] = 25] = "GREEK";
                Charset[Charset["HEBREW"] = 16] = "HEBREW";
                Charset[Charset["HP8"] = 6] = "HP8";
                Charset[Charset["KEYBCS2"] = 37] = "KEYBCS2";
                Charset[Charset["KOI8R"] = 7] = "KOI8R";
                Charset[Charset["KOI8U"] = 22] = "KOI8U";
                Charset[Charset["LATIN1"] = 8] = "LATIN1";
                Charset[Charset["LATIN2"] = 9] = "LATIN2";
                Charset[Charset["LATIN5"] = 30] = "LATIN5";
                Charset[Charset["LATIN7"] = 41] = "LATIN7";
                Charset[Charset["MACCE"] = 38] = "MACCE";
                Charset[Charset["MACROMAN"] = 39] = "MACROMAN";
                Charset[Charset["SJIS"] = 13] = "SJIS";
                Charset[Charset["SWE7"] = 10] = "SWE7";
                Charset[Charset["TIS620"] = 18] = "TIS620";
                Charset[Charset["UCS2"] = 35] = "UCS2";
                Charset[Charset["UJIS"] = 12] = "UJIS";
                Charset[Charset["UTF16"] = 54] = "UTF16";
                Charset[Charset["UTF16LE"] = 56] = "UTF16LE";
                Charset[Charset["UTF8"] = 33] = "UTF8";
                Charset[Charset["UTF8MB4"] = 45] = "UTF8MB4";
                Charset[Charset["UTF32"] = 60] = "UTF32";
            })(Charset || (Charset = {}));
            exports_39("Charset", Charset);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/packets/parsers/handshake", ["https://deno.land/x/mysql@2.1.0/src/buffer", "https://deno.land/x/mysql@2.1.0/src/constant/capabilities"], function (exports_40, context_40) {
    "use strict";
    var buffer_ts_1, capabilities_ts_1;
    var __moduleName = context_40 && context_40.id;
    /** @ignore */
    function parseHandshake(reader) {
        const protocolVersion = reader.readUint8();
        const serverVersion = reader.readNullTerminatedString();
        const threadId = reader.readUint32();
        const seedWriter = new buffer_ts_1.BufferWriter(new Uint8Array(20));
        seedWriter.writeBuffer(reader.readBuffer(8));
        reader.skip(1);
        let serverCapabilities = reader.readUint16();
        let characterSet = 0, statusFlags = 0, authPluginDataLength = 0, authPluginName = "";
        if (!reader.finished) {
            characterSet = reader.readUint8();
            statusFlags = reader.readUint16();
            serverCapabilities |= reader.readUint16() << 16;
            if ((serverCapabilities & capabilities_ts_1.default.CLIENT_PLUGIN_AUTH) != 0) {
                authPluginDataLength = reader.readUint8();
            }
            else {
                reader.skip(1);
            }
            reader.skip(10);
            if ((serverCapabilities & capabilities_ts_1.default.CLIENT_SECURE_CONNECTION) !=
                0) {
                seedWriter.writeBuffer(reader.readBuffer(Math.max(13, authPluginDataLength - 8)));
            }
            if ((serverCapabilities & capabilities_ts_1.default.CLIENT_PLUGIN_AUTH) != 0) {
                authPluginName = reader.readNullTerminatedString();
            }
        }
        return {
            protocolVersion,
            serverVersion,
            threadId,
            seed: seedWriter.buffer,
            serverCapabilities,
            characterSet,
            statusFlags,
            authPluginName,
        };
    }
    exports_40("parseHandshake", parseHandshake);
    return {
        setters: [
            function (buffer_ts_1_1) {
                buffer_ts_1 = buffer_ts_1_1;
            },
            function (capabilities_ts_1_1) {
                capabilities_ts_1 = capabilities_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/packets/builders/auth", ["https://deno.land/x/mysql@2.1.0/src/auth", "https://deno.land/x/mysql@2.1.0/src/buffer", "https://deno.land/x/mysql@2.1.0/src/constant/capabilities", "https://deno.land/x/mysql@2.1.0/src/constant/charset"], function (exports_41, context_41) {
    "use strict";
    var auth_ts_1, buffer_ts_2, capabilities_ts_2, charset_ts_1;
    var __moduleName = context_41 && context_41.id;
    /** @ignore */
    function buildAuth(packet, params) {
        let clientParam = (params.db ? capabilities_ts_2.default.CLIENT_CONNECT_WITH_DB : 0) |
            capabilities_ts_2.default.CLIENT_PLUGIN_AUTH |
            capabilities_ts_2.default.CLIENT_LONG_PASSWORD |
            capabilities_ts_2.default.CLIENT_PROTOCOL_41 |
            capabilities_ts_2.default.CLIENT_TRANSACTIONS |
            capabilities_ts_2.default.CLIENT_MULTI_RESULTS |
            capabilities_ts_2.default.CLIENT_SECURE_CONNECTION;
        if (packet.serverCapabilities & capabilities_ts_2.default.CLIENT_LONG_FLAG) {
            clientParam |= capabilities_ts_2.default.CLIENT_LONG_FLAG;
        }
        if (packet.serverCapabilities &
            capabilities_ts_2.default.CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA) {
            clientParam |= capabilities_ts_2.default.CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA;
        }
        if (packet.serverCapabilities & capabilities_ts_2.default.CLIENT_DEPRECATE_EOF) {
            clientParam |= capabilities_ts_2.default.CLIENT_DEPRECATE_EOF;
        }
        if (packet.serverCapabilities & capabilities_ts_2.default.CLIENT_PLUGIN_AUTH) {
            const writer = new buffer_ts_2.BufferWriter(new Uint8Array(1000));
            writer
                .writeUint32(clientParam)
                .writeUint32(2 ** 24 - 1)
                .write(charset_ts_1.Charset.UTF8_GENERAL_CI)
                .skip(23)
                .writeNullTerminatedString(params.username);
            if (params.password) {
                const authData = auth_ts_1.default(packet.authPluginName, params.password, packet.seed);
                if (clientParam &
                    capabilities_ts_2.default.CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA ||
                    clientParam & capabilities_ts_2.default.CLIENT_SECURE_CONNECTION) {
                    // request lenenc-int length of auth-response and string[n] auth-response
                    writer.write(authData.length);
                    writer.writeBuffer(authData);
                }
                else {
                    writer.writeBuffer(authData);
                    writer.write(0);
                }
            }
            else {
                writer.write(0);
            }
            if (clientParam & capabilities_ts_2.default.CLIENT_CONNECT_WITH_DB && params.db) {
                writer.writeNullTerminatedString(params.db);
            }
            if (clientParam & capabilities_ts_2.default.CLIENT_PLUGIN_AUTH) {
                writer.writeNullTerminatedString(packet.authPluginName);
            }
            return writer.wroteData;
        }
        return Uint8Array.from([]);
    }
    exports_41("buildAuth", buildAuth);
    return {
        setters: [
            function (auth_ts_1_1) {
                auth_ts_1 = auth_ts_1_1;
            },
            function (buffer_ts_2_1) {
                buffer_ts_2 = buffer_ts_2_1;
            },
            function (capabilities_ts_2_1) {
                capabilities_ts_2 = capabilities_ts_2_1;
            },
            function (charset_ts_1_1) {
                charset_ts_1 = charset_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/packets/builders/query", ["https://deno.land/x/mysql@2.1.0/deps", "https://deno.land/x/mysql@2.1.0/src/buffer"], function (exports_42, context_42) {
    "use strict";
    var deps_ts_7, buffer_ts_3;
    var __moduleName = context_42 && context_42.id;
    /** @ignore */
    function buildQuery(sql, params = []) {
        const data = deps_ts_7.encode(deps_ts_7.replaceParams(sql, params));
        const writer = new buffer_ts_3.BufferWriter(new Uint8Array(data.length + 1));
        writer.write(0x03);
        writer.writeBuffer(data);
        return writer.buffer;
    }
    exports_42("buildQuery", buildQuery);
    return {
        setters: [
            function (deps_ts_7_1) {
                deps_ts_7 = deps_ts_7_1;
            },
            function (buffer_ts_3_1) {
                buffer_ts_3 = buffer_ts_3_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/packets/packet", ["https://deno.land/x/mysql@2.1.0/deps", "https://deno.land/x/mysql@2.1.0/src/buffer", "https://deno.land/x/mysql@2.1.0/src/constant/errors", "https://deno.land/x/mysql@2.1.0/src/logger"], function (exports_43, context_43) {
    "use strict";
    var deps_ts_8, buffer_ts_4, errors_ts_1, logger_ts_2, SendPacket, ReceivePacket;
    var __moduleName = context_43 && context_43.id;
    return {
        setters: [
            function (deps_ts_8_1) {
                deps_ts_8 = deps_ts_8_1;
            },
            function (buffer_ts_4_1) {
                buffer_ts_4 = buffer_ts_4_1;
            },
            function (errors_ts_1_1) {
                errors_ts_1 = errors_ts_1_1;
            },
            function (logger_ts_2_1) {
                logger_ts_2 = logger_ts_2_1;
            }
        ],
        execute: function () {
            /** @ignore */
            SendPacket = class SendPacket {
                constructor(body, no) {
                    this.body = body;
                    this.header = { size: body.length, no };
                }
                async send(conn) {
                    const body = this.body;
                    const data = new buffer_ts_4.BufferWriter(new Uint8Array(4 + body.length));
                    data.writeUints(3, this.header.size);
                    data.write(this.header.no);
                    data.writeBuffer(body);
                    logger_ts_2.log.debug(`send: ${data.length}B \n${deps_ts_8.byteFormat(data.buffer)}\n`);
                    try {
                        await conn.write(data.buffer);
                    }
                    catch (error) {
                        throw new errors_ts_1.WriteError(error.message);
                    }
                }
            };
            exports_43("SendPacket", SendPacket);
            /** @ignore */
            ReceivePacket = class ReceivePacket {
                async parse(reader) {
                    const header = new buffer_ts_4.BufferReader(new Uint8Array(4));
                    let readCount = 0;
                    let nread = await reader.read(header.buffer);
                    if (nread === null)
                        return null;
                    readCount = nread;
                    this.header = {
                        size: header.readUints(3),
                        no: header.readUint8(),
                    };
                    this.body = new buffer_ts_4.BufferReader(new Uint8Array(this.header.size));
                    nread = await reader.read(this.body.buffer);
                    if (nread === null)
                        return null;
                    readCount += nread;
                    switch (this.body.buffer[0]) {
                        case 0x00:
                            this.type = "OK";
                            break;
                        case 0xff:
                            this.type = "ERR";
                            break;
                        case 0xfe:
                            this.type = "EOF";
                            break;
                        default:
                            this.type = "RESULT";
                            break;
                    }
                    logger_ts_2.debug(() => {
                        const data = new Uint8Array(readCount);
                        data.set(header.buffer);
                        data.set(this.body.buffer, 4);
                        logger_ts_2.log.debug(`receive: ${readCount}B, size = ${this.header.size}, no = ${this.header.no} \n${deps_ts_8.byteFormat(data)}\n`);
                    });
                    return this;
                }
            };
            exports_43("ReceivePacket", ReceivePacket);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/packets/parsers/err", ["https://deno.land/x/mysql@2.1.0/src/constant/capabilities"], function (exports_44, context_44) {
    "use strict";
    var capabilities_ts_3;
    var __moduleName = context_44 && context_44.id;
    /** @ignore */
    function parseError(reader, conn) {
        const code = reader.readUint16();
        const packet = {
            code,
            message: "",
        };
        if (conn.capabilities & capabilities_ts_3.default.CLIENT_PROTOCOL_41) {
            packet.sqlStateMarker = reader.readUint8();
            packet.sqlState = reader.readUints(5);
        }
        packet.message = reader.readNullTerminatedString();
        return packet;
    }
    exports_44("parseError", parseError);
    return {
        setters: [
            function (capabilities_ts_3_1) {
                capabilities_ts_3 = capabilities_ts_3_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/constant/mysql_types", [], function (exports_45, context_45) {
    "use strict";
    var MYSQL_TYPE_DECIMAL, MYSQL_TYPE_TINY, MYSQL_TYPE_SHORT, MYSQL_TYPE_LONG, MYSQL_TYPE_FLOAT, MYSQL_TYPE_DOUBLE, MYSQL_TYPE_NULL, MYSQL_TYPE_TIMESTAMP, MYSQL_TYPE_LONGLONG, MYSQL_TYPE_INT24, MYSQL_TYPE_DATE, MYSQL_TYPE_TIME, MYSQL_TYPE_DATETIME, MYSQL_TYPE_YEAR, MYSQL_TYPE_NEWDATE, MYSQL_TYPE_VARCHAR, MYSQL_TYPE_BIT, MYSQL_TYPE_TIMESTAMP2, MYSQL_TYPE_DATETIME2, MYSQL_TYPE_TIME2, MYSQL_TYPE_NEWDECIMAL, MYSQL_TYPE_ENUM, MYSQL_TYPE_SET, MYSQL_TYPE_TINY_BLOB, MYSQL_TYPE_MEDIUM_BLOB, MYSQL_TYPE_LONG_BLOB, MYSQL_TYPE_BLOB, MYSQL_TYPE_VAR_STRING, MYSQL_TYPE_STRING, MYSQL_TYPE_GEOMETRY;
    var __moduleName = context_45 && context_45.id;
    return {
        setters: [],
        execute: function () {
            /** @ignore */
            exports_45("MYSQL_TYPE_DECIMAL", MYSQL_TYPE_DECIMAL = 0x00);
            /** @ignore */
            exports_45("MYSQL_TYPE_TINY", MYSQL_TYPE_TINY = 0x01);
            /** @ignore */
            exports_45("MYSQL_TYPE_SHORT", MYSQL_TYPE_SHORT = 0x02);
            /** @ignore */
            exports_45("MYSQL_TYPE_LONG", MYSQL_TYPE_LONG = 0x03);
            /** @ignore */
            exports_45("MYSQL_TYPE_FLOAT", MYSQL_TYPE_FLOAT = 0x04);
            /** @ignore */
            exports_45("MYSQL_TYPE_DOUBLE", MYSQL_TYPE_DOUBLE = 0x05);
            /** @ignore */
            exports_45("MYSQL_TYPE_NULL", MYSQL_TYPE_NULL = 0x06);
            /** @ignore */
            exports_45("MYSQL_TYPE_TIMESTAMP", MYSQL_TYPE_TIMESTAMP = 0x07);
            /** @ignore */
            exports_45("MYSQL_TYPE_LONGLONG", MYSQL_TYPE_LONGLONG = 0x08);
            /** @ignore */
            exports_45("MYSQL_TYPE_INT24", MYSQL_TYPE_INT24 = 0x09);
            /** @ignore */
            exports_45("MYSQL_TYPE_DATE", MYSQL_TYPE_DATE = 0x0a);
            /** @ignore */
            exports_45("MYSQL_TYPE_TIME", MYSQL_TYPE_TIME = 0x0b);
            /** @ignore */
            exports_45("MYSQL_TYPE_DATETIME", MYSQL_TYPE_DATETIME = 0x0c);
            /** @ignore */
            exports_45("MYSQL_TYPE_YEAR", MYSQL_TYPE_YEAR = 0x0d);
            /** @ignore */
            exports_45("MYSQL_TYPE_NEWDATE", MYSQL_TYPE_NEWDATE = 0x0e);
            /** @ignore */
            exports_45("MYSQL_TYPE_VARCHAR", MYSQL_TYPE_VARCHAR = 0x0f);
            /** @ignore */
            exports_45("MYSQL_TYPE_BIT", MYSQL_TYPE_BIT = 0x10);
            /** @ignore */
            exports_45("MYSQL_TYPE_TIMESTAMP2", MYSQL_TYPE_TIMESTAMP2 = 0x11);
            /** @ignore */
            exports_45("MYSQL_TYPE_DATETIME2", MYSQL_TYPE_DATETIME2 = 0x12);
            /** @ignore */
            exports_45("MYSQL_TYPE_TIME2", MYSQL_TYPE_TIME2 = 0x13);
            /** @ignore */
            exports_45("MYSQL_TYPE_NEWDECIMAL", MYSQL_TYPE_NEWDECIMAL = 0xf6);
            /** @ignore */
            exports_45("MYSQL_TYPE_ENUM", MYSQL_TYPE_ENUM = 0xf7);
            /** @ignore */
            exports_45("MYSQL_TYPE_SET", MYSQL_TYPE_SET = 0xf8);
            /** @ignore */
            exports_45("MYSQL_TYPE_TINY_BLOB", MYSQL_TYPE_TINY_BLOB = 0xf9);
            /** @ignore */
            exports_45("MYSQL_TYPE_MEDIUM_BLOB", MYSQL_TYPE_MEDIUM_BLOB = 0xfa);
            /** @ignore */
            exports_45("MYSQL_TYPE_LONG_BLOB", MYSQL_TYPE_LONG_BLOB = 0xfb);
            /** @ignore */
            exports_45("MYSQL_TYPE_BLOB", MYSQL_TYPE_BLOB = 0xfc);
            /** @ignore */
            exports_45("MYSQL_TYPE_VAR_STRING", MYSQL_TYPE_VAR_STRING = 0xfd);
            /** @ignore */
            exports_45("MYSQL_TYPE_STRING", MYSQL_TYPE_STRING = 0xfe);
            /** @ignore */
            exports_45("MYSQL_TYPE_GEOMETRY", MYSQL_TYPE_GEOMETRY = 0xff);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/packets/parsers/result", ["https://deno.land/x/mysql@2.1.0/src/constant/mysql_types"], function (exports_46, context_46) {
    "use strict";
    var mysql_types_ts_1;
    var __moduleName = context_46 && context_46.id;
    /** @ignore */
    function parseField(reader) {
        const catalog = reader.readLenCodeString();
        const schema = reader.readLenCodeString();
        const table = reader.readLenCodeString();
        const originTable = reader.readLenCodeString();
        const name = reader.readLenCodeString();
        const originName = reader.readLenCodeString();
        reader.skip(1);
        const encoding = reader.readUint16();
        const fieldLen = reader.readUint32();
        const fieldType = reader.readUint8();
        const fieldFlag = reader.readUint16();
        const decimals = reader.readUint8();
        reader.skip(1);
        const defaultVal = reader.readLenCodeString();
        return {
            catalog,
            schema,
            table,
            originName,
            fieldFlag,
            originTable,
            fieldLen,
            name,
            fieldType,
            encoding,
            decimals,
            defaultVal,
        };
    }
    exports_46("parseField", parseField);
    /** @ignore */
    function parseRow(reader, fileds) {
        const row = {};
        for (let i = 0; i < fileds.length; i++) {
            const name = fileds[i].name;
            const val = reader.readLenCodeString();
            row[name] = val === null ? null : convertType(fileds[i], val);
        }
        return row;
    }
    exports_46("parseRow", parseRow);
    /** @ignore */
    function convertType(field, val) {
        const { fieldType, fieldLen } = field;
        if (fieldType === mysql_types_ts_1.MYSQL_TYPE_TINY && fieldLen === 1) {
            return !!parseInt(val);
        }
        switch (fieldType) {
            case mysql_types_ts_1.MYSQL_TYPE_DECIMAL:
            case mysql_types_ts_1.MYSQL_TYPE_DOUBLE:
            case mysql_types_ts_1.MYSQL_TYPE_FLOAT:
            case mysql_types_ts_1.MYSQL_TYPE_DATETIME2:
            case mysql_types_ts_1.MYSQL_TYPE_NEWDECIMAL:
                return parseFloat(val);
            case mysql_types_ts_1.MYSQL_TYPE_TINY:
            case mysql_types_ts_1.MYSQL_TYPE_SHORT:
            case mysql_types_ts_1.MYSQL_TYPE_LONG:
            case mysql_types_ts_1.MYSQL_TYPE_LONGLONG:
            case mysql_types_ts_1.MYSQL_TYPE_INT24:
                return parseInt(val);
            case mysql_types_ts_1.MYSQL_TYPE_VARCHAR:
            case mysql_types_ts_1.MYSQL_TYPE_VAR_STRING:
            case mysql_types_ts_1.MYSQL_TYPE_STRING:
            case mysql_types_ts_1.MYSQL_TYPE_TIME:
            case mysql_types_ts_1.MYSQL_TYPE_TIME2:
                return val;
            case mysql_types_ts_1.MYSQL_TYPE_DATE:
            case mysql_types_ts_1.MYSQL_TYPE_TIMESTAMP:
            case mysql_types_ts_1.MYSQL_TYPE_DATETIME:
            case mysql_types_ts_1.MYSQL_TYPE_NEWDATE:
            case mysql_types_ts_1.MYSQL_TYPE_TIMESTAMP2:
            case mysql_types_ts_1.MYSQL_TYPE_DATETIME2:
                return new Date(val);
            default:
                return val;
        }
    }
    return {
        setters: [
            function (mysql_types_ts_1_1) {
                mysql_types_ts_1 = mysql_types_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/connection", ["https://deno.land/x/mysql@2.1.0/deps", "https://deno.land/x/mysql@2.1.0/src/constant/errors", "https://deno.land/x/mysql@2.1.0/src/logger", "https://deno.land/x/mysql@2.1.0/src/packets/builders/auth", "https://deno.land/x/mysql@2.1.0/src/packets/builders/query", "https://deno.land/x/mysql@2.1.0/src/packets/packet", "https://deno.land/x/mysql@2.1.0/src/packets/parsers/err", "https://deno.land/x/mysql@2.1.0/src/packets/parsers/handshake", "https://deno.land/x/mysql@2.1.0/src/packets/parsers/result"], function (exports_47, context_47) {
    "use strict";
    var deps_ts_9, errors_ts_2, logger_ts_3, auth_ts_2, query_ts_1, packet_ts_1, err_ts_1, handshake_ts_1, result_ts_1, ConnectionState, Connection;
    var __moduleName = context_47 && context_47.id;
    return {
        setters: [
            function (deps_ts_9_1) {
                deps_ts_9 = deps_ts_9_1;
            },
            function (errors_ts_2_1) {
                errors_ts_2 = errors_ts_2_1;
            },
            function (logger_ts_3_1) {
                logger_ts_3 = logger_ts_3_1;
            },
            function (auth_ts_2_1) {
                auth_ts_2 = auth_ts_2_1;
            },
            function (query_ts_1_1) {
                query_ts_1 = query_ts_1_1;
            },
            function (packet_ts_1_1) {
                packet_ts_1 = packet_ts_1_1;
            },
            function (err_ts_1_1) {
                err_ts_1 = err_ts_1_1;
            },
            function (handshake_ts_1_1) {
                handshake_ts_1 = handshake_ts_1_1;
            },
            function (result_ts_1_1) {
                result_ts_1 = result_ts_1_1;
            }
        ],
        execute: function () {
            /**
             * Connection state
             */
            (function (ConnectionState) {
                ConnectionState[ConnectionState["CONNECTING"] = 0] = "CONNECTING";
                ConnectionState[ConnectionState["CONNECTED"] = 1] = "CONNECTED";
                ConnectionState[ConnectionState["COLSING"] = 2] = "COLSING";
                ConnectionState[ConnectionState["CLOSED"] = 3] = "CLOSED";
            })(ConnectionState || (ConnectionState = {}));
            exports_47("ConnectionState", ConnectionState);
            /** Connection for mysql */
            Connection = class Connection {
                constructor(client) {
                    this.client = client;
                    this.state = ConnectionState.CONNECTING;
                    this.capabilities = 0;
                    this.serverVersion = "";
                }
                async _connect() {
                    const { hostname, port = 3306 } = this.client.config;
                    logger_ts_3.log.info(`connecting ${hostname}:${port}`);
                    this.conn = await Deno.connect({
                        hostname,
                        port,
                        transport: "tcp",
                    });
                    let receive = await this.nextPacket();
                    const handshakePacket = handshake_ts_1.parseHandshake(receive.body);
                    const data = auth_ts_2.buildAuth(handshakePacket, {
                        username: this.client.config.username ?? "",
                        password: this.client.config.password,
                        db: this.client.config.db,
                    });
                    await new packet_ts_1.SendPacket(data, 0x1).send(this.conn);
                    this.state = ConnectionState.CONNECTING;
                    this.serverVersion = handshakePacket.serverVersion;
                    this.capabilities = handshakePacket.serverCapabilities;
                    receive = await this.nextPacket();
                    const header = receive.body.readUint8();
                    if (header === 0xff) {
                        const error = err_ts_1.parseError(receive.body, this);
                        logger_ts_3.log.error(`connect error(${error.code}): ${error.message}`);
                        this.close();
                        throw new Error(error.message);
                    }
                    else {
                        logger_ts_3.log.info(`connected to ${this.client.config.hostname}`);
                        this.state = ConnectionState.CONNECTED;
                    }
                    if (this.client.config.charset) {
                        await this.execute(`SET NAMES ${this.client.config.charset}`);
                    }
                }
                /** Connect to database */
                async connect() {
                    await this._connect();
                }
                async nextPacket() {
                    let eofCount = 0;
                    const timeout = this.client.config.timeout || 1000;
                    while (this.conn) {
                        const packet = await new packet_ts_1.ReceivePacket().parse(this.conn);
                        if (packet) {
                            if (packet.type === "ERR") {
                                packet.body.skip(1);
                                const error = err_ts_1.parseError(packet.body, this);
                                throw new Error(error.message);
                            }
                            return packet;
                        }
                        else {
                            await deps_ts_9.delay(100);
                            if (eofCount++ * 100 >= timeout) {
                                throw new errors_ts_2.ResponseTimeoutError("Read packet timeout");
                            }
                        }
                    }
                    throw new Error("Not connected");
                }
                /**
                 * Check if database server version is less than 5.7.0
                 *
                 * MySQL version is "x.y.z"
                 *   eg "5.5.62"
                 *
                 * MariaDB version is "5.5.5-x.y.z-MariaDB[-build-infos]" for versions after 5 (10.0 etc)
                 *   eg "5.5.5-10.4.10-MariaDB-1:10.4.10+maria~bionic"
                 * and "x.y.z-MariaDB-[build-infos]" for 5.x versions
                 *   eg "5.5.64-MariaDB-1~trusty"
                 */
                lessThan57() {
                    const version = this.serverVersion;
                    if (!version.includes("MariaDB"))
                        return version < "5.7.0";
                    const segments = version.split("-");
                    // MariaDB v5.x
                    if (segments[1] === "MariaDB")
                        return segments[0] < "5.7.0";
                    // MariaDB v10+
                    return false;
                }
                /** Close database connection */
                close() {
                    logger_ts_3.log.info("close connection");
                    this.state = ConnectionState.COLSING;
                    this.conn && this.conn.close();
                    this.state = ConnectionState.CLOSED;
                }
                /**
                 * excute query sql
                 * @param sql query sql string
                 * @param params query params
                 */
                async query(sql, params) {
                    const result = await this.execute(sql, params);
                    if (result && result.rows) {
                        return result.rows;
                    }
                    else {
                        return result;
                    }
                }
                /**
                 * excute sql
                 * @param sql sql string
                 * @param params query params
                 */
                async execute(sql, params) {
                    if (!this.conn) {
                        throw new Error("Must be connected first");
                    }
                    const data = query_ts_1.buildQuery(sql, params);
                    await new packet_ts_1.SendPacket(data, 0).send(this.conn);
                    let receive = await this.nextPacket();
                    if (receive.type === "OK") {
                        receive.body.skip(1);
                        return {
                            affectedRows: receive.body.readEncodedLen(),
                            lastInsertId: receive.body.readEncodedLen(),
                        };
                    }
                    let fieldCount = receive.body.readEncodedLen();
                    const fields = [];
                    while (fieldCount--) {
                        const packet = await this.nextPacket();
                        if (packet) {
                            const field = result_ts_1.parseField(packet.body);
                            fields.push(field);
                        }
                    }
                    const rows = [];
                    if (this.lessThan57()) {
                        // EOF(less than 5.7)
                        receive = await this.nextPacket();
                    }
                    while (true) {
                        receive = await this.nextPacket();
                        if (receive.type === "EOF") {
                            break;
                        }
                        else {
                            const row = result_ts_1.parseRow(receive.body, fields);
                            rows.push(row);
                        }
                    }
                    return { rows, fields };
                }
            };
            exports_47("Connection", Connection);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/deferred", ["https://deno.land/x/mysql@2.1.0/deps"], function (exports_48, context_48) {
    "use strict";
    var deps_ts_10, DeferredStack;
    var __moduleName = context_48 && context_48.id;
    return {
        setters: [
            function (deps_ts_10_1) {
                deps_ts_10 = deps_ts_10_1;
            }
        ],
        execute: function () {
            /** @ignore */
            DeferredStack = class DeferredStack {
                constructor(_maxSize, _array = [], creator) {
                    this._maxSize = _maxSize;
                    this._array = _array;
                    this.creator = creator;
                    this._queue = [];
                    this._size = 0;
                    this._size = _array.length;
                }
                get size() {
                    return this._size;
                }
                get maxSize() {
                    return this._maxSize;
                }
                get available() {
                    return this._array.length;
                }
                async pop() {
                    if (this._array.length) {
                        return this._array.pop();
                    }
                    else if (this._size < this._maxSize) {
                        this._size++;
                        const item = await this.creator();
                        return item;
                    }
                    const defer = deps_ts_10.deferred();
                    this._queue.push(defer);
                    await defer;
                    return this._array.pop();
                }
                async push(item) {
                    this._array.push(item);
                    if (this._queue.length) {
                        this._queue.shift().resolve();
                    }
                }
                reduceSize() {
                    this._size--;
                }
            };
            exports_48("DeferredStack", DeferredStack);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/src/client", ["https://deno.land/x/mysql@2.1.0/src/connection", "https://deno.land/x/mysql@2.1.0/src/constant/errors", "https://deno.land/x/mysql@2.1.0/src/deferred", "https://deno.land/x/mysql@2.1.0/src/logger"], function (exports_49, context_49) {
    "use strict";
    var connection_ts_1, errors_ts_3, deferred_ts_3, logger_ts_4, Client;
    var __moduleName = context_49 && context_49.id;
    return {
        setters: [
            function (connection_ts_1_1) {
                connection_ts_1 = connection_ts_1_1;
            },
            function (errors_ts_3_1) {
                errors_ts_3 = errors_ts_3_1;
            },
            function (deferred_ts_3_1) {
                deferred_ts_3 = deferred_ts_3_1;
            },
            function (logger_ts_4_1) {
                logger_ts_4 = logger_ts_4_1;
            }
        ],
        execute: function () {
            /**
             * MySQL client
             */
            Client = class Client {
                constructor() {
                    this.config = {};
                    this._connections = [];
                }
                async createConnection() {
                    let connection = new connection_ts_1.Connection(this);
                    await connection.connect();
                    return connection;
                }
                /** get pool info */
                get pool() {
                    if (this._pool) {
                        return {
                            size: this._pool.size,
                            maxSize: this._pool.maxSize,
                            available: this._pool.available,
                        };
                    }
                }
                /**
                 * connect to database
                 * @param config config for client
                 * @returns Clinet instance
                 */
                async connect(config) {
                    this.config = {
                        hostname: "127.0.0.1",
                        username: "root",
                        port: 3306,
                        poolSize: 1,
                        ...config,
                    };
                    Object.freeze(this.config);
                    this._connections = [];
                    this._pool = new deferred_ts_3.DeferredStack(this.config.poolSize || 10, this._connections, this.createConnection.bind(this));
                    return this;
                }
                /**
                 * excute query sql
                 * @param sql query sql string
                 * @param params query params
                 */
                async query(sql, params) {
                    return await this.useConnection(async (connection) => {
                        return await connection.query(sql, params);
                    });
                }
                /**
                 * excute sql
                 * @param sql sql string
                 * @param params query params
                 */
                async execute(sql, params) {
                    return await this.useConnection(async (connection) => {
                        return await connection.execute(sql, params);
                    });
                }
                async useConnection(fn) {
                    if (!this._pool) {
                        throw new Error("Unconnected");
                    }
                    const connection = await this._pool.pop();
                    try {
                        const result = await fn(connection);
                        this._pool.push(connection);
                        return result;
                    }
                    catch (error) {
                        if (error instanceof errors_ts_3.WriteError ||
                            error instanceof errors_ts_3.ResponseTimeoutError) {
                            this._pool.reduceSize();
                        }
                        else {
                            this._pool.push(connection);
                        }
                        throw error;
                    }
                }
                /**
                 * Execute a transaction process, and the transaction successfully
                 * returns the return value of the transaction process
                 * @param processor transation processor
                 */
                async transaction(processor) {
                    return await this.useConnection(async (connection) => {
                        try {
                            await connection.execute("BEGIN");
                            const result = await processor(connection);
                            await connection.execute("COMMIT");
                            return result;
                        }
                        catch (error) {
                            logger_ts_4.log.info(`ROLLBACK: ${error.message}`);
                            await connection.execute("ROLLBACK");
                            throw error;
                        }
                    });
                }
                /**
                 * close connection
                 */
                async close() {
                    await Promise.all(this._connections.map((conn) => conn.close()));
                }
            };
            exports_49("Client", Client);
        }
    };
});
System.register("https://deno.land/x/mysql@2.1.0/mod", ["https://deno.land/x/mysql@2.1.0/src/client", "https://deno.land/x/mysql@2.1.0/src/connection"], function (exports_50, context_50) {
    "use strict";
    var __moduleName = context_50 && context_50.id;
    return {
        setters: [
            function (client_ts_1_1) {
                exports_50({
                    "Client": client_ts_1_1["Client"]
                });
            },
            function (connection_ts_2_1) {
                exports_50({
                    "Connection": connection_ts_2_1["Connection"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/util", [], function (exports_51, context_51) {
    "use strict";
    var __moduleName = context_51 && context_51.id;
    function replaceParams(sql, params) {
        if (!params)
            return sql;
        let paramIndex = 0;
        sql = sql.replace(/('.*')|(".*")|(\?\?)|(\?)/g, (str) => {
            if (paramIndex >= params.length)
                return str;
            // ignore
            if (/".*"/g.test(str) || /'.*'/g.test(str)) {
                return str;
            }
            // identifier
            if (str === "??") {
                const val = params[paramIndex++];
                if (val instanceof Array) {
                    return `(${val.map((item) => replaceParams("??", [item])).join(",")})`;
                }
                else if (val === "*") {
                    return val;
                }
                else if (typeof val === "string" && val.indexOf(".") > -1) {
                    // a.b => `a`.`b`
                    const _arr = val.split(".");
                    return replaceParams(_arr.map(() => "??").join("."), _arr);
                }
                else if (typeof val === "string" &&
                    (val.toLowerCase().indexOf(" as ") > -1 ||
                        val.toLowerCase().indexOf(" AS ") > -1)) {
                    // a as b => `a` AS `b`
                    const newVal = val.replace(" as ", " AS ");
                    const _arr = newVal.split(" AS ");
                    return replaceParams(_arr.map(() => "??").join(" AS "), _arr);
                }
                else {
                    return ["`", val, "`"].join("");
                }
            }
            // value
            const val = params[paramIndex++];
            if (val === null)
                return "NULL";
            switch (typeof val) {
                case "object":
                    if (val instanceof Date)
                        return `"${formatDate(val)}"`;
                    if (val instanceof Array) {
                        return `(${val.map((item) => replaceParams("?", [item])).join(",")})`;
                    }
                case "string":
                    return `"${escapeString(val)}"`;
                case "undefined":
                    return "NULL";
                case "number":
                case "boolean":
                default:
                    return val;
            }
        });
        return sql;
    }
    exports_51("replaceParams", replaceParams);
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const days = date
            .getDate()
            .toString()
            .padStart(2, "0");
        const hours = date
            .getHours()
            .toString()
            .padStart(2, "0");
        const minutes = date
            .getMinutes()
            .toString()
            .padStart(2, "0");
        const seconds = date
            .getSeconds()
            .toString()
            .padStart(2, "0");
        return `${year}-${month}-${days} ${hours}:${minutes}:${seconds}`;
    }
    function escapeString(str) {
        return str.replace(/"/g, '\\"');
    }
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/join", ["https://deno.land/x/sql_builder@1.5.0/util"], function (exports_52, context_52) {
    "use strict";
    var util_ts_2, Join;
    var __moduleName = context_52 && context_52.id;
    return {
        setters: [
            function (util_ts_2_1) {
                util_ts_2 = util_ts_2_1;
            }
        ],
        execute: function () {
            Join = class Join {
                constructor(type, table, alias) {
                    this.table = table;
                    this.alias = alias;
                    this.value = "";
                    const name = alias ? "?? ??" : "??";
                    this.value = util_ts_2.replaceParams(`${type} ${name}`, [table, alias]);
                }
                static inner(table, alias) {
                    return new Join("INNER JOIN", table, alias);
                }
                static full(table, alias) {
                    return new Join("FULL OUTER JOIN", table, alias);
                }
                static left(table, alias) {
                    return new Join("LEFT OUTER JOIN", table, alias);
                }
                static right(table, alias) {
                    return new Join("RIGHT OUTER JOIN", table, alias);
                }
                on(a, b) {
                    this.value += util_ts_2.replaceParams(` ON ?? = ??`, [a, b]);
                    return this;
                }
            };
            exports_52("Join", Join);
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/order", ["https://deno.land/x/sql_builder@1.5.0/util"], function (exports_53, context_53) {
    "use strict";
    var util_ts_3, Order;
    var __moduleName = context_53 && context_53.id;
    return {
        setters: [
            function (util_ts_3_1) {
                util_ts_3 = util_ts_3_1;
            }
        ],
        execute: function () {
            Order = class Order {
                constructor() {
                    this.value = "";
                }
                static by(field) {
                    const order = new Order();
                    return {
                        get desc() {
                            order.value = util_ts_3.replaceParams("?? DESC", [field]);
                            return order;
                        },
                        get asc() {
                            order.value = util_ts_3.replaceParams("?? ASC", [field]);
                            return order;
                        },
                    };
                }
            };
            exports_53("Order", Order);
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/deps", ["https://deno.land/std@v0.51.0/testing/asserts", "https://deno.land/x/sql_builder@1.5.0/util"], function (exports_54, context_54) {
    "use strict";
    var __moduleName = context_54 && context_54.id;
    return {
        setters: [
            function (asserts_ts_3_1) {
                exports_54({
                    "assert": asserts_ts_3_1["assert"],
                    "assertEquals": asserts_ts_3_1["assertEquals"]
                });
            },
            function (util_ts_4_1) {
                exports_54({
                    "replaceParams": util_ts_4_1["replaceParams"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/where", ["https://deno.land/x/sql_builder@1.5.0/util"], function (exports_55, context_55) {
    "use strict";
    var util_ts_5, Where;
    var __moduleName = context_55 && context_55.id;
    return {
        setters: [
            function (util_ts_5_1) {
                util_ts_5 = util_ts_5_1;
            }
        ],
        execute: function () {
            /**
             * Where sub sql builder
             */
            Where = class Where {
                constructor(expr, params) {
                    this.expr = expr;
                    this.params = params;
                }
                get value() {
                    return this.toString();
                }
                toString() {
                    return util_ts_5.replaceParams(this.expr, this.params);
                }
                static expr(expr, ...params) {
                    return new Where(expr, params);
                }
                static eq(field, value) {
                    return this.expr("?? = ?", field, value);
                }
                /**
                 * eq from object
                 * @param data
                 */
                static from(data) {
                    const conditions = Object.keys(data).map((key) => this.eq(key, data[key]));
                    return this.and(...conditions);
                }
                static gt(field, value) {
                    return this.expr("?? > ?", field, value);
                }
                static gte(field, value) {
                    return this.expr("?? >= ?", field, value);
                }
                static lt(field, value) {
                    return this.expr("?? < ?", field, value);
                }
                static lte(field, value) {
                    return this.expr("?? <= ?", field, value);
                }
                static ne(field, value) {
                    return this.expr("?? != ?", field, value);
                }
                static isNull(field) {
                    return this.expr("?? IS NULL", field);
                }
                static notNull(field) {
                    return this.expr("?? NOT NULL", field);
                }
                static in(field, ...values) {
                    const params = values.length > 1 ? values : values[0];
                    return this.expr("?? IN ?", field, params);
                }
                static notIn(field, ...values) {
                    const params = values.length > 1 ? values : values[0];
                    return this.expr("?? NOT IN ?", field, params);
                }
                static like(field, value) {
                    return this.expr("?? LIKE ?", field, value);
                }
                static between(field, startValue, endValue) {
                    return this.expr("?? BETWEEN ? AND ?", field, startValue, endValue);
                }
                static field(name) {
                    return {
                        gt: (value) => this.gt(name, value),
                        gte: (value) => this.gte(name, value),
                        lt: (value) => this.lt(name, value),
                        lte: (value) => this.lte(name, value),
                        ne: (value) => this.ne(name, value),
                        eq: (value) => this.eq(name, value),
                        isNull: () => this.isNull(name),
                        notNull: () => this.notNull(name),
                        in: (...values) => this.in(name, ...values),
                        notIn: (...values) => this.notIn(name, ...values),
                        like: (value) => this.like(name, value),
                        between: (start, end) => this.between(name, start, end),
                    };
                }
                static and(...expr) {
                    const sql = `(${expr
                        .filter((e) => e)
                        .map((e) => e.value)
                        .join(" AND ")})`;
                    return new Where(sql, []);
                }
                static or(...expr) {
                    const sql = `(${expr
                        .filter((e) => e)
                        .map((e) => e.value)
                        .join(" OR ")})`;
                    return new Where(sql, []);
                }
            };
            exports_55("Where", Where);
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/query", ["https://deno.land/x/sql_builder@1.5.0/deps"], function (exports_56, context_56) {
    "use strict";
    var deps_ts_11, Query;
    var __moduleName = context_56 && context_56.id;
    return {
        setters: [
            function (deps_ts_11_1) {
                deps_ts_11 = deps_ts_11_1;
            }
        ],
        execute: function () {
            Query = class Query {
                constructor() {
                    this._where = [];
                    this._joins = [];
                    this._orders = [];
                    this._fields = [];
                    this._groupBy = [];
                    this._having = [];
                    this._insertValues = [];
                }
                get orderSQL() {
                    if (this._orders && this._orders.length) {
                        return `ORDER BY ` + this._orders.map((order) => order.value).join(", ");
                    }
                }
                get whereSQL() {
                    if (this._where && this._where.length) {
                        return `WHERE ` + this._where.join(" AND ");
                    }
                }
                get havingSQL() {
                    if (this._having && this._having.length) {
                        return `HAVING ` + this._having.join(" AND ");
                    }
                }
                get joinSQL() {
                    if (this._joins && this._joins.length) {
                        return this._joins.join(" ");
                    }
                }
                get groupSQL() {
                    if (this._groupBy && this._groupBy.length) {
                        return ("GROUP BY " +
                            this._groupBy.map((f) => deps_ts_11.replaceParams("??", [f])).join(", "));
                    }
                }
                get limitSQL() {
                    if (this._limit) {
                        return `LIMIT ${this._limit.start}, ${this._limit.size}`;
                    }
                }
                get selectSQL() {
                    return [
                        "SELECT",
                        this._fields.join(", "),
                        "FROM",
                        deps_ts_11.replaceParams("??", [this._table]),
                        this.joinSQL,
                        this.whereSQL,
                        this.groupSQL,
                        this.havingSQL,
                        this.orderSQL,
                        this.limitSQL,
                    ]
                        .filter((str) => str)
                        .join(" ");
                }
                get insertSQL() {
                    const len = this._insertValues.length;
                    const fields = Object.keys(this._insertValues[0]);
                    const values = this._insertValues.map((row) => {
                        return fields.map((key) => row[key]);
                    });
                    return deps_ts_11.replaceParams(`INSERT INTO ?? ?? VALUES ${"? ".repeat(len)}`, [
                        this._table,
                        fields,
                        ...values,
                    ]);
                }
                get updateSQL() {
                    deps_ts_11.assert(!!this._updateValue);
                    const set = Object.keys(this._updateValue)
                        .map((key) => {
                        return deps_ts_11.replaceParams(`?? = ?`, [key, this._updateValue[key]]);
                    })
                        .join(", ");
                    return [
                        deps_ts_11.replaceParams(`UPDATE ?? SET ${set}`, [this._table]),
                        this.whereSQL,
                    ].join(" ");
                }
                get deleteSQL() {
                    return [deps_ts_11.replaceParams(`DELETE FROM ??`, [this._table]), this.whereSQL].join(" ");
                }
                table(name) {
                    this._table = name;
                    return this;
                }
                order(...orders) {
                    this._orders = this._orders.concat(orders);
                    return this;
                }
                groupBy(...fields) {
                    this._groupBy = fields;
                    return this;
                }
                where(where) {
                    if (typeof where === "string") {
                        this._where.push(where);
                    }
                    else {
                        this._where.push(where.value);
                    }
                    return this;
                }
                having(where) {
                    if (typeof where === "string") {
                        this._having.push(where);
                    }
                    else {
                        this._having.push(where.value);
                    }
                    return this;
                }
                limit(start, size) {
                    this._limit = { start, size };
                    return this;
                }
                join(join) {
                    if (typeof join === "string") {
                        this._joins.push(join);
                    }
                    else {
                        this._joins.push(join.value);
                    }
                    return this;
                }
                select(...fields) {
                    this._type = "select";
                    deps_ts_11.assert(fields.length > 0);
                    this._fields = this._fields.concat(fields.map((field) => {
                        if (field.toLocaleLowerCase().indexOf(" as ") > -1) {
                            return field;
                        }
                        else if (field.split(".").length > 1) {
                            return deps_ts_11.replaceParams("??.??", field.split("."));
                        }
                        else {
                            return deps_ts_11.replaceParams("??", [field]);
                        }
                    }));
                    return this;
                }
                insert(data) {
                    this._type = "insert";
                    if (!(data instanceof Array)) {
                        data = [data];
                    }
                    this._insertValues = data;
                    return this;
                }
                update(data) {
                    this._type = "update";
                    this._updateValue = data;
                    return this;
                }
                delete(table) {
                    if (table)
                        this._table = table;
                    this._type = "delete";
                    return this;
                }
                build() {
                    deps_ts_11.assert(!!this._table);
                    switch (this._type) {
                        case "select":
                            return this.selectSQL;
                        case "insert":
                            return this.insertSQL;
                        case "update":
                            return this.updateSQL;
                        case "delete":
                            return this.deleteSQL;
                        default:
                            return "";
                    }
                }
            };
            exports_56("Query", Query);
        }
    };
});
System.register("https://deno.land/x/sql_builder@1.5.0/mod", ["https://deno.land/x/sql_builder@1.5.0/join", "https://deno.land/x/sql_builder@1.5.0/order", "https://deno.land/x/sql_builder@1.5.0/query", "https://deno.land/x/sql_builder@1.5.0/util", "https://deno.land/x/sql_builder@1.5.0/where"], function (exports_57, context_57) {
    "use strict";
    var __moduleName = context_57 && context_57.id;
    return {
        setters: [
            function (join_ts_1_1) {
                exports_57({
                    "Join": join_ts_1_1["Join"]
                });
            },
            function (order_ts_1_1) {
                exports_57({
                    "Order": order_ts_1_1["Order"]
                });
            },
            function (query_ts_2_1) {
                exports_57({
                    "Query": query_ts_2_1["Query"]
                });
            },
            function (util_ts_6_1) {
                exports_57({
                    "replaceParams": util_ts_6_1["replaceParams"]
                });
            },
            function (where_ts_1_1) {
                exports_57({
                    "Where": where_ts_1_1["Where"]
                });
            }
        ],
        execute: function () {
        }
    };
});
// @ts-nocheck
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
// @ts-nocheck
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var self;
        const root = typeof global === "object"
            ? global
            : typeof self === "object"
                ? self
                : typeof this === "object"
                    ? this
                    : Function("return this;")();
        let exporter = makeExporter(Reflect);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        else {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter);
        function makeExporter(target, previous) {
            return (key, value) => {
                if (typeof target[key] !== "function") {
                    Object.defineProperty(target, key, {
                        configurable: true,
                        writable: true,
                        value,
                    });
                }
                if (previous)
                    previous(key, value);
            };
        }
    })(function (exporter) {
        const hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        const supportsSymbol = typeof Symbol === "function";
        const toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined"
            ? Symbol.toPrimitive
            : "@@toPrimitive";
        const iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined"
            ? Symbol.iterator
            : "@@iterator";
        const supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        const supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        const downLevel = !supportsCreate && !supportsProto;
        const HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? () => MakeDictionary(Object.create(null))
                : supportsProto
                    ? () => MakeDictionary({ __proto__: null })
                    : () => MakeDictionary({}),
            has: downLevel
                ? (map, key) => hasOwn.call(map, key)
                : (map, key) => key in map,
            get: downLevel
                ? (map, key) => hasOwn.call(map, key) ? map[key] : undefined
                : (map, key) => map[key],
        };
        // Load global or shim versions of Map, Set, and WeakMap
        const functionPrototype = Object.getPrototypeOf(Function);
        const usePolyfill = typeof process === "object" &&
            process.env &&
            process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
        const _Map = !usePolyfill &&
            typeof Map === "function" &&
            typeof Map.prototype.entries === "function"
            ? Map
            : CreateMapPolyfill();
        const _Set = !usePolyfill &&
            typeof Set === "function" &&
            typeof Set.prototype.entries === "function"
            ? Set
            : CreateSetPolyfill();
        const _WeakMap = !usePolyfill && typeof WeakMap === "function"
            ? WeakMap
            : CreateWeakMapPolyfill();
        // [[Metadata]] internal slot
        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
        const Metadata = new _WeakMap();
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) &&
                    !IsUndefined(attributes) &&
                    !IsNull(attributes)) {
                    throw new TypeError();
                }
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) {
                    throw new TypeError();
                }
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            const metadataMap = GetOrCreateMetadataMap(target, propertyKey, 
            /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            if (!metadataMap.delete(metadataKey))
                return false;
            if (metadataMap.size > 0)
                return true;
            const targetMetadata = Metadata.get(target);
            targetMetadata.delete(propertyKey);
            if (targetMetadata.size > 0)
                return true;
            Metadata.delete(target);
            return true;
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (let i = decorators.length - 1; i >= 0; --i) {
                const decorator = decorators[i];
                const decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (let i = decorators.length - 1; i >= 0; --i) {
                const decorator = decorators[i];
                const decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        function GetOrCreateMetadataMap(O, P, Create) {
            let targetMetadata = Metadata.get(O);
            if (IsUndefined(targetMetadata)) {
                if (!Create)
                    return undefined;
                targetMetadata = new _Map();
                Metadata.set(O, targetMetadata);
            }
            let metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
                if (!Create)
                    return undefined;
                metadataMap = new _Map();
                targetMetadata.set(P, metadataMap);
            }
            return metadataMap;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            const parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            const metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            return ToBoolean(metadataMap.has(MetadataKey));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            const parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            const metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return undefined;
            return metadataMap.get(MetadataKey);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            const metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
            metadataMap.set(MetadataKey, MetadataValue);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            const ownKeys = OrdinaryOwnMetadataKeys(O, P);
            const parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            const parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            const set = new _Set();
            const keys = [];
            for (const key of ownKeys) {
                const hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (const key of parentKeys) {
                const hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            const keys = [];
            const metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return keys;
            const keysObj = metadataMap.keys();
            const iterator = GetIterator(keysObj);
            let k = 0;
            while (true) {
                const next = IteratorStep(iterator);
                if (!next) {
                    keys.length = k;
                    return keys;
                }
                const nextValue = IteratorValue(next);
                try {
                    keys[k] = nextValue;
                }
                catch (e) {
                    try {
                        IteratorClose(iterator);
                    }
                    finally {
                        throw e;
                    }
                }
                k++;
            }
        }
        // 6 ECMAScript Data Typ0es and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined":
                    return 0 /* Undefined */;
                case "boolean":
                    return 2 /* Boolean */;
                case "string":
                    return 3 /* String */;
                case "symbol":
                    return 4 /* Symbol */;
                case "number":
                    return 5 /* Number */;
                case "object":
                    return x === null ? 1 /* Null */ : 6 /* Object */;
                default:
                    return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */:
                    return input;
                case 1 /* Null */:
                    return input;
                case 2 /* Boolean */:
                    return input;
                case 3 /* String */:
                    return input;
                case 4 /* Symbol */:
                    return input;
                case 5 /* Number */:
                    return input;
            }
            const hint = PreferredType === 3 /* String */
                ? "string"
                : PreferredType === 5 /* Number */
                    ? "number"
                    : "default";
            const exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                const result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                const toString = O.toString;
                if (IsCallable(toString)) {
                    const result = toString.call(O);
                    if (!IsObject(result))
                        return result;
                }
                const valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    const result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                const valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    const result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                const toString = O.toString;
                if (IsCallable(toString)) {
                    const result = toString.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            const key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */:
                    return true;
                case 4 /* Symbol */:
                    return true;
                default:
                    return false;
            }
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            const func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            const method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            const iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            const result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            const f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            const proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            const prototype = O.prototype;
            const prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype) {
                return proto;
            }
            // If the constructor was not a function, then we cannot determine the heritage.
            const constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            const cacheSentinel = {};
            const arraySentinel = [];
            class MapIterator {
                constructor(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                "@@iterator"() {
                    return this;
                }
                [iteratorSymbol]() {
                    return this;
                }
                next() {
                    const index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        const result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                }
                throw(error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                }
                return(value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                }
            }
            return class Map {
                constructor() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                get size() {
                    return this._keys.length;
                }
                has(key) {
                    return this._find(key, /*insert*/ false) >= 0;
                }
                get(key) {
                    const index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                }
                set(key, value) {
                    const index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                }
                delete(key) {
                    const index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        const size = this._keys.length;
                        for (let i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (key === this._cacheKey) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                }
                clear() {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                keys() {
                    return new MapIterator(this._keys, this._values, getKey);
                }
                values() {
                    return new MapIterator(this._keys, this._values, getValue);
                }
                entries() {
                    return new MapIterator(this._keys, this._values, getEntry);
                }
                "@@iterator"() {
                    return this.entries();
                }
                [iteratorSymbol]() {
                    return this.entries();
                }
                _find(key, insert) {
                    if (this._cacheKey !== key) {
                        this._cacheIndex = this._keys.indexOf((this._cacheKey = key));
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                }
            };
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            return class Set {
                constructor() {
                    this._map = new _Map();
                }
                get size() {
                    return this._map.size;
                }
                has(value) {
                    return this._map.has(value);
                }
                add(value) {
                    return this._map.set(value, value), this;
                }
                delete(value) {
                    return this._map.delete(value);
                }
                clear() {
                    this._map.clear();
                }
                keys() {
                    return this._map.keys();
                }
                values() {
                    return this._map.values();
                }
                entries() {
                    return this._map.entries();
                }
                "@@iterator"() {
                    return this.keys();
                }
                [iteratorSymbol]() {
                    return this.keys();
                }
            };
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            const UUID_SIZE = 16;
            const keys = HashMap.create();
            const rootKey = CreateUniqueKey();
            return class WeakMap {
                constructor() {
                    this._key = CreateUniqueKey();
                }
                has(target) {
                    const table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                }
                get(target) {
                    const table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined
                        ? HashMap.get(table, this._key)
                        : undefined;
                }
                set(target, value) {
                    const table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                }
                delete(target) {
                    const table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                }
                clear() {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                }
            };
            function CreateUniqueKey() {
                let key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, {
                        value: HashMap.create(),
                    });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (let i = 0; i < size; ++i)
                    buffer[i] = (Math.random() * 0xff) | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    if (typeof crypto !== "undefined") {
                        return crypto.getRandomValues(new Uint8Array(size));
                    }
                    if (typeof msCrypto !== "undefined") {
                        return msCrypto.getRandomValues(new Uint8Array(size));
                    }
                    return FillRandomBytes(new Uint8Array(size), size);
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                const data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = (data[6] & 0x4f) | 0x40;
                data[8] = (data[8] & 0xbf) | 0x80;
                let result = "";
                for (let offset = 0; offset < UUID_SIZE; ++offset) {
                    const byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));
System.register("https://deno.land/x/dso@v1.0.0/deps", ["https://deno.land/std@v0.51.0/testing/asserts", "https://deno.land/x/mysql@2.1.0/mod", "https://deno.land/x/sql_builder@1.5.0/mod", "./src/Reflect.ts"], function (exports_58, context_58) {
    "use strict";
    var __moduleName = context_58 && context_58.id;
    return {
        setters: [
            function (asserts_ts_4_1) {
                exports_58({
                    "assert": asserts_ts_4_1["assert"],
                    "assertEquals": asserts_ts_4_1["assertEquals"],
                    "assertThrowsAsync": asserts_ts_4_1["assertThrowsAsync"]
                });
            },
            function (mod_ts_6_1) {
                exports_58({
                    "Client": mod_ts_6_1["Client"],
                    "Connection": mod_ts_6_1["Connection"]
                });
            },
            function (mod_ts_7_1) {
                exports_58({
                    "Join": mod_ts_7_1["Join"],
                    "Order": mod_ts_7_1["Order"],
                    "Query": mod_ts_7_1["Query"],
                    "replaceParams": mod_ts_7_1["replaceParams"],
                    "Where": mod_ts_7_1["Where"]
                });
            },
            function (_1) {
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/src/util", [], function (exports_59, context_59) {
    "use strict";
    var __moduleName = context_59 && context_59.id;
    // 驼峰转下划线
    function camel2line(key) {
        return key.replace(/([A-Z])/g, "_$1").toLowerCase();
    }
    exports_59("camel2line", camel2line);
    // 下划线转驼峰
    function line2camel(key) {
        return key.replace(/_(\w)/g, function (_, letter) {
            return letter.toUpperCase();
        });
    }
    exports_59("line2camel", line2camel);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/src/field", ["https://deno.land/x/dso@v1.0.0/src/util"], function (exports_60, context_60) {
    "use strict";
    var util_ts_7, Defaults, FieldType;
    var __moduleName = context_60 && context_60.id;
    /** Field Decorator */
    function Field(options) {
        return (target, property) => {
            const fields = target.modelFields;
            const name = util_ts_7.camel2line(property);
            fields.push({ ...options, property, name });
            Reflect.defineMetadata("model:fields", fields, target);
        };
    }
    exports_60("Field", Field);
    return {
        setters: [
            function (util_ts_7_1) {
                util_ts_7 = util_ts_7_1;
            }
        ],
        execute: function () {
            (function (Defaults) {
                Defaults["CURRENT_TIMESTAMP"] = "CURRENT_TIMESTAMP";
                Defaults["NULL"] = "NULL";
            })(Defaults || (Defaults = {}));
            exports_60("Defaults", Defaults);
            /** Field type */
            (function (FieldType) {
                FieldType[FieldType["DATE"] = 0] = "DATE";
                FieldType[FieldType["INT"] = 1] = "INT";
                FieldType[FieldType["STRING"] = 2] = "STRING";
                FieldType[FieldType["TEXT"] = 3] = "TEXT";
                FieldType[FieldType["BOOLEAN"] = 4] = "BOOLEAN";
                FieldType[FieldType["LONGTEXT"] = 5] = "LONGTEXT";
                FieldType[FieldType["GeoPOINT"] = 6] = "GeoPOINT";
            })(FieldType || (FieldType = {}));
            exports_60("FieldType", FieldType);
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/src/model", ["https://deno.land/x/dso@v1.0.0/deps", "https://deno.land/x/dso@v1.0.0/src/dso", "https://deno.land/x/dso@v1.0.0/src/field"], function (exports_61, context_61) {
    "use strict";
    var deps_ts_12, dso_ts_1, field_ts_1, BaseModel;
    var __moduleName = context_61 && context_61.id;
    /** Model Decorator */
    function Model(name) {
        return (target) => {
            Reflect.defineMetadata("model:name", name, target.prototype);
        };
    }
    exports_61("Model", Model);
    return {
        setters: [
            function (deps_ts_12_1) {
                deps_ts_12 = deps_ts_12_1;
            },
            function (dso_ts_1_1) {
                dso_ts_1 = dso_ts_1_1;
            },
            function (field_ts_1_1) {
                field_ts_1 = field_ts_1_1;
            }
        ],
        execute: function () {
            /** Model base class */
            BaseModel = class BaseModel {
                constructor(connection) {
                    this.connection = connection;
                }
                /** get model name */
                get modelName() {
                    return Reflect.getMetadata("model:name", this);
                }
                /** get primary key */
                get primaryKey() {
                    return this.modelFields.find((field) => field.primary);
                }
                /** get defined fields list */
                get modelFields() {
                    return (Reflect.getMetadata("model:fields", this) || [
                        {
                            type: field_ts_1.FieldType.DATE,
                            default: field_ts_1.Defaults.CURRENT_TIMESTAMP,
                            autoUpdate: true,
                            name: "updated_at",
                            property: "updated_at",
                        },
                        {
                            type: field_ts_1.FieldType.DATE,
                            default: field_ts_1.Defaults.CURRENT_TIMESTAMP,
                            name: "created_at",
                            property: "created_at",
                        },
                    ]);
                }
                /** return a new Query instance with table name */
                builder() {
                    const builder = new deps_ts_12.Query();
                    return builder.table(this.modelName);
                }
                /**
                 * Convert data object to model
                 * @param data
                 */
                convertModel(data) {
                    if (!data)
                        return;
                    const model = {};
                    const fieldsMapping = {};
                    this.modelFields.map((field) => (fieldsMapping[field.name] = field.property));
                    Object.keys(data).forEach((key) => {
                        const propertyName = fieldsMapping[key];
                        model[propertyName || key] = data[key];
                    });
                    return model;
                }
                /**
                 * Convert model object to db object
                 * @param model
                 */
                convertObject(model) {
                    const data = {};
                    const fieldsMapping = {};
                    this.modelFields.map((field) => (fieldsMapping[field.property] = field.name));
                    Object.keys(model).forEach((key) => {
                        const name = fieldsMapping[key];
                        data[name || key] = model[key];
                    });
                    return data;
                }
                optionsToQuery(options) {
                    const query = this.builder();
                    if (options.fields) {
                        query.select(...options.fields);
                    }
                    else {
                        query.select(`${this.modelName}.*`);
                    }
                    if (options.where)
                        query.where(options.where);
                    if (options.group)
                        query.groupBy(...options.group);
                    if (options.having)
                        query.having(options.having);
                    if (options.join) {
                        options.join.forEach((join) => query.join(join));
                    }
                    if (options.limit)
                        query.limit(...options.limit);
                    if (options.order)
                        options.order.forEach((order) => query.order(order));
                    return query;
                }
                /**
                 * find one record
                 * @param where conditions
                 */
                async findOne(options) {
                    if (options instanceof deps_ts_12.Where) {
                        options = {
                            where: options,
                        };
                    }
                    const result = await this.query(this.optionsToQuery(options).limit(0, 1));
                    return this.convertModel(result[0]);
                }
                /**
                 * delete by conditions
                 * @param where
                 */
                async delete(where) {
                    const result = await this.execute(this.builder()
                        .delete()
                        .where(where));
                    return result.affectedRows ?? 0;
                }
                /** find all records by given conditions */
                async findAll(options) {
                    if (options instanceof deps_ts_12.Where) {
                        options = {
                            where: options,
                        };
                    }
                    const result = await this.query(this.optionsToQuery(options));
                    return result.map((record) => this.convertModel(record));
                }
                /** find one record by primary key */
                async findById(id) {
                    deps_ts_12.assert(!!this.primaryKey);
                    return await this.findOne(deps_ts_12.Where.field(this.primaryKey.name).eq(id));
                }
                /** insert record */
                async insert(fields) {
                    const query = this.builder().insert(this.convertObject(fields));
                    const result = await this.execute(query);
                    return result.lastInsertId;
                }
                /** update records by given conditions */
                async update(data, where) {
                    if (!where &&
                        this.primaryKey &&
                        data[this.primaryKey.property]) {
                        where = deps_ts_12.Where.field(this.primaryKey.name).eq(data[this.primaryKey.property]);
                    }
                    const query = this.builder()
                        .update(this.convertObject(data))
                        .where(where ?? "");
                    const result = await this.execute(query);
                    return result.affectedRows;
                }
                /**
                 * query custom
                 * @param query
                 */
                async query(query) {
                    const sql = query.build();
                    dso_ts_1.dso.showQueryLog && console.log(`\n[ DSO:QUERY ]\nSQL:\t ${sql}\n`);
                    const result = this.connection
                        ? await this.connection.query(sql)
                        : await dso_ts_1.dso.client.query(sql);
                    dso_ts_1.dso.showQueryLog && console.log(`REUSLT:\t`, result, `\n`);
                    return result;
                }
                /**
                 * excute custom
                 * @param query
                 */
                async execute(query) {
                    const sql = query.build();
                    dso_ts_1.dso.showQueryLog && console.log(`\n[ DSO:EXECUTE ]\nSQL:\t ${sql}\n`);
                    const result = this.connection
                        ? await this.connection.execute(sql)
                        : await dso_ts_1.dso.client.execute(sql);
                    dso_ts_1.dso.showQueryLog && console.log(`REUSLT:\t`, result, `\n`);
                    return result;
                }
            };
            exports_61("BaseModel", BaseModel);
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/src/sync", ["https://deno.land/x/dso@v1.0.0/deps", "https://deno.land/x/dso@v1.0.0/mod", "https://deno.land/x/dso@v1.0.0/src/field"], function (exports_62, context_62) {
    "use strict";
    var deps_ts_13, mod_ts_8, field_ts_2;
    var __moduleName = context_62 && context_62.id;
    async function sync(client, model, force) {
        if (force) {
            await client.execute(`DROP TABLE IF EXISTS ${model.modelName}`);
        }
        let defs = model.modelFields
            .map((field) => {
            let def = field.name;
            let type = "";
            switch (field.type) {
                case field_ts_2.FieldType.STRING:
                    type = `VARCHAR(${field.length || 255})`;
                    break;
                case field_ts_2.FieldType.INT:
                    type = `INT(${field.length || 11})`;
                    break;
                case field_ts_2.FieldType.DATE:
                    type = `TIMESTAMP`;
                    break;
                case field_ts_2.FieldType.BOOLEAN:
                    type = `TINYINT(1)`;
                    break;
                case field_ts_2.FieldType.TEXT:
                    type = `TEXT(${field.length})`;
                    break;
                case field_ts_2.FieldType.LONGTEXT: {
                    type = `LONGTEXT`;
                    break;
                }
                case field_ts_2.FieldType.GeoPOINT: {
                    type = `POINT`;
                    break;
                }
            }
            def += ` ${type}`;
            if (field.notNull)
                def += " NOT NULL";
            if (field.default != null) {
                if (field.default === field_ts_2.Defaults.NULL) {
                    def += ` NULL DEFAULT NULL`;
                }
                else {
                    def += ` DEFAULT ${field.default}`;
                }
            }
            if (field.autoIncrement)
                def += " AUTO_INCREMENT";
            if (field.autoUpdate) {
                deps_ts_13.assert(field.type === field_ts_2.FieldType.DATE, "AutoUpdate only support Date field");
                def += ` ON UPDATE CURRENT_TIMESTAMP()`;
            }
            return def;
        })
            .join(", ");
        if (model.primaryKey) {
            defs += `, PRIMARY KEY (${model.primaryKey.name})`;
        }
        const sql = [
            "CREATE TABLE IF NOT EXISTS",
            model.modelName,
            "(",
            defs,
            ")",
            "ENGINE=InnoDB DEFAULT CHARSET=utf8;",
        ].join(" ");
        mod_ts_8.dso.showQueryLog && console.log(`\n[ DSO:SYNC ]\nSQL:\t ${sql}\n`);
        const result = await client.execute(sql);
        mod_ts_8.dso.showQueryLog && console.log(`REUSLT:\t`, result, `\n`);
    }
    exports_62("sync", sync);
    return {
        setters: [
            function (deps_ts_13_1) {
                deps_ts_13 = deps_ts_13_1;
            },
            function (mod_ts_8_1) {
                mod_ts_8 = mod_ts_8_1;
            },
            function (field_ts_2_1) {
                field_ts_2 = field_ts_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/src/transaction", ["https://deno.land/x/dso@v1.0.0/src/dso"], function (exports_63, context_63) {
    "use strict";
    var dso_ts_2, Transaction;
    var __moduleName = context_63 && context_63.id;
    return {
        setters: [
            function (dso_ts_2_1) {
                dso_ts_2 = dso_ts_2_1;
            }
        ],
        execute: function () {
            Transaction = class Transaction {
                constructor(_conn) {
                    this._conn = _conn;
                }
                getModel(Model) {
                    const model = new Model(this._conn);
                    return model;
                }
                static async transaction(processor) {
                    return (await dso_ts_2.dso.client.transaction(async (conn) => {
                        const trans = new Transaction(conn);
                        return await processor(trans);
                    }));
                }
            };
            exports_63("Transaction", Transaction);
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/src/dso", ["https://deno.land/x/dso@v1.0.0/deps", "https://deno.land/x/dso@v1.0.0/src/sync", "https://deno.land/x/dso@v1.0.0/src/transaction"], function (exports_64, context_64) {
    "use strict";
    var deps_ts_14, sync_ts_1, transaction_ts_1, _client, _models, dso;
    var __moduleName = context_64 && context_64.id;
    return {
        setters: [
            function (deps_ts_14_1) {
                deps_ts_14 = deps_ts_14_1;
            },
            function (sync_ts_1_1) {
                sync_ts_1 = sync_ts_1_1;
            },
            function (transaction_ts_1_1) {
                transaction_ts_1 = transaction_ts_1_1;
            }
        ],
        execute: function () {
            /** @ignore */
            _models = [];
            /**
             * Global dso instance
             */
            exports_64("dso", dso = {
                /**
                 * set true will show exucte/query sql
                 */
                showQueryLog: false,
                /**
                 * Sync model to database table
                 * @param force set true, will drop table before create table
                 */
                async sync(force = false) {
                    for (const model of _models) {
                        await sync_ts_1.sync(_client, model, force);
                    }
                },
                /**
                 * Database client
                 */
                get client() {
                    return _client;
                },
                /**
                 * all models
                 */
                get models() {
                    return _models;
                },
                /**
                 * add model
                 * @param model
                 */
                define(ModelClass) {
                    const model = new ModelClass();
                    _models.push(model);
                    return model;
                },
                transaction: transaction_ts_1.Transaction.transaction,
                /**
                 * connect to database
                 * @param config client config
                 */
                async connect(config) {
                    if (config instanceof deps_ts_14.Client) {
                        _client = config;
                    }
                    else {
                        _client = new deps_ts_14.Client();
                        await _client.connect(config);
                    }
                    return _client;
                },
                close() {
                    _client.close();
                },
            });
        }
    };
});
System.register("https://deno.land/x/dso@v1.0.0/mod", ["https://deno.land/x/dso@v1.0.0/deps", "https://deno.land/x/dso@v1.0.0/src/dso", "https://deno.land/x/dso@v1.0.0/src/field", "https://deno.land/x/dso@v1.0.0/src/model", "https://deno.land/x/dso@v1.0.0/src/util"], function (exports_65, context_65) {
    "use strict";
    var __moduleName = context_65 && context_65.id;
    var exportedNames_1 = {
        "Client": true,
        "Join": true,
        "Order": true,
        "Query": true,
        "replaceParams": true,
        "Where": true,
        "dso": true
    };
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_65(exports);
    }
    return {
        setters: [
            function (deps_ts_15_1) {
                exports_65({
                    "Client": deps_ts_15_1["Client"],
                    "Join": deps_ts_15_1["Join"],
                    "Order": deps_ts_15_1["Order"],
                    "Query": deps_ts_15_1["Query"],
                    "replaceParams": deps_ts_15_1["replaceParams"],
                    "Where": deps_ts_15_1["Where"]
                });
            },
            function (dso_ts_3_1) {
                exports_65({
                    "dso": dso_ts_3_1["dso"]
                });
            },
            function (field_ts_3_1) {
                exportStar_2(field_ts_3_1);
            },
            function (model_ts_1_1) {
                exportStar_2(model_ts_1_1);
            },
            function (util_ts_8_1) {
                exportStar_2(util_ts_8_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/ask/src/core/prompt", [], function (exports_66, context_66) {
    "use strict";
    var Prompt;
    var __moduleName = context_66 && context_66.id;
    return {
        setters: [],
        execute: function () {
            Prompt = class Prompt {
                constructor(opts) {
                    if (!opts.name || opts.name.trim().length === 0) {
                        throw new Error('Please provide the name of the prompt.');
                    }
                    this.name = opts.name;
                    this.type = opts.type || 'text';
                    this.message = opts.message || opts.name;
                    this.prefix = opts.prefix || '\x1b[32m?\x1b[39m';
                    this.suffix = opts.suffix || (!opts.message && opts.suffix == null ? ':' : '');
                    this.default = opts.default;
                    this.input = opts.input || Deno.stdin;
                    this.output = opts.output || Deno.stdout;
                    this.validate = opts.validate || (() => true);
                }
                format(str) {
                    return '\x1b[1m' + str + '\x1b[22m' + (this.default ? ` (${this.default})` : '') + this.suffix;
                }
                getPrompt() {
                    const components = [];
                    if (this.prefix?.length) {
                        components.push(this.prefix);
                    }
                    components.push(this.format(this.message));
                    return components.join(' ') + ' ';
                }
            };
            exports_66("default", Prompt);
        }
    };
});
System.register("https://deno.land/x/ask/src/core/result", [], function (exports_67, context_67) {
    "use strict";
    var __moduleName = context_67 && context_67.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.51.0/path/interface", [], function (exports_68, context_68) {
    "use strict";
    var __moduleName = context_68 && context_68.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
System.register("https://deno.land/std@0.51.0/path/_constants", [], function (exports_69, context_69) {
    "use strict";
    var build, CHAR_UPPERCASE_A, CHAR_LOWERCASE_A, CHAR_UPPERCASE_Z, CHAR_LOWERCASE_Z, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH, CHAR_VERTICAL_LINE, CHAR_COLON, CHAR_QUESTION_MARK, CHAR_UNDERSCORE, CHAR_LINE_FEED, CHAR_CARRIAGE_RETURN, CHAR_TAB, CHAR_FORM_FEED, CHAR_EXCLAMATION_MARK, CHAR_HASH, CHAR_SPACE, CHAR_NO_BREAK_SPACE, CHAR_ZERO_WIDTH_NOBREAK_SPACE, CHAR_LEFT_SQUARE_BRACKET, CHAR_RIGHT_SQUARE_BRACKET, CHAR_LEFT_ANGLE_BRACKET, CHAR_RIGHT_ANGLE_BRACKET, CHAR_LEFT_CURLY_BRACKET, CHAR_RIGHT_CURLY_BRACKET, CHAR_HYPHEN_MINUS, CHAR_PLUS, CHAR_DOUBLE_QUOTE, CHAR_SINGLE_QUOTE, CHAR_PERCENT, CHAR_SEMICOLON, CHAR_CIRCUMFLEX_ACCENT, CHAR_GRAVE_ACCENT, CHAR_AT, CHAR_AMPERSAND, CHAR_EQUAL, CHAR_0, CHAR_9, isWindows, SEP, SEP_PATTERN;
    var __moduleName = context_69 && context_69.id;
    return {
        setters: [],
        execute: function () {
            build = Deno.build;
            // Alphabet chars.
            exports_69("CHAR_UPPERCASE_A", CHAR_UPPERCASE_A = 65); /* A */
            exports_69("CHAR_LOWERCASE_A", CHAR_LOWERCASE_A = 97); /* a */
            exports_69("CHAR_UPPERCASE_Z", CHAR_UPPERCASE_Z = 90); /* Z */
            exports_69("CHAR_LOWERCASE_Z", CHAR_LOWERCASE_Z = 122); /* z */
            // Non-alphabetic chars.
            exports_69("CHAR_DOT", CHAR_DOT = 46); /* . */
            exports_69("CHAR_FORWARD_SLASH", CHAR_FORWARD_SLASH = 47); /* / */
            exports_69("CHAR_BACKWARD_SLASH", CHAR_BACKWARD_SLASH = 92); /* \ */
            exports_69("CHAR_VERTICAL_LINE", CHAR_VERTICAL_LINE = 124); /* | */
            exports_69("CHAR_COLON", CHAR_COLON = 58); /* : */
            exports_69("CHAR_QUESTION_MARK", CHAR_QUESTION_MARK = 63); /* ? */
            exports_69("CHAR_UNDERSCORE", CHAR_UNDERSCORE = 95); /* _ */
            exports_69("CHAR_LINE_FEED", CHAR_LINE_FEED = 10); /* \n */
            exports_69("CHAR_CARRIAGE_RETURN", CHAR_CARRIAGE_RETURN = 13); /* \r */
            exports_69("CHAR_TAB", CHAR_TAB = 9); /* \t */
            exports_69("CHAR_FORM_FEED", CHAR_FORM_FEED = 12); /* \f */
            exports_69("CHAR_EXCLAMATION_MARK", CHAR_EXCLAMATION_MARK = 33); /* ! */
            exports_69("CHAR_HASH", CHAR_HASH = 35); /* # */
            exports_69("CHAR_SPACE", CHAR_SPACE = 32); /*   */
            exports_69("CHAR_NO_BREAK_SPACE", CHAR_NO_BREAK_SPACE = 160); /* \u00A0 */
            exports_69("CHAR_ZERO_WIDTH_NOBREAK_SPACE", CHAR_ZERO_WIDTH_NOBREAK_SPACE = 65279); /* \uFEFF */
            exports_69("CHAR_LEFT_SQUARE_BRACKET", CHAR_LEFT_SQUARE_BRACKET = 91); /* [ */
            exports_69("CHAR_RIGHT_SQUARE_BRACKET", CHAR_RIGHT_SQUARE_BRACKET = 93); /* ] */
            exports_69("CHAR_LEFT_ANGLE_BRACKET", CHAR_LEFT_ANGLE_BRACKET = 60); /* < */
            exports_69("CHAR_RIGHT_ANGLE_BRACKET", CHAR_RIGHT_ANGLE_BRACKET = 62); /* > */
            exports_69("CHAR_LEFT_CURLY_BRACKET", CHAR_LEFT_CURLY_BRACKET = 123); /* { */
            exports_69("CHAR_RIGHT_CURLY_BRACKET", CHAR_RIGHT_CURLY_BRACKET = 125); /* } */
            exports_69("CHAR_HYPHEN_MINUS", CHAR_HYPHEN_MINUS = 45); /* - */
            exports_69("CHAR_PLUS", CHAR_PLUS = 43); /* + */
            exports_69("CHAR_DOUBLE_QUOTE", CHAR_DOUBLE_QUOTE = 34); /* " */
            exports_69("CHAR_SINGLE_QUOTE", CHAR_SINGLE_QUOTE = 39); /* ' */
            exports_69("CHAR_PERCENT", CHAR_PERCENT = 37); /* % */
            exports_69("CHAR_SEMICOLON", CHAR_SEMICOLON = 59); /* ; */
            exports_69("CHAR_CIRCUMFLEX_ACCENT", CHAR_CIRCUMFLEX_ACCENT = 94); /* ^ */
            exports_69("CHAR_GRAVE_ACCENT", CHAR_GRAVE_ACCENT = 96); /* ` */
            exports_69("CHAR_AT", CHAR_AT = 64); /* @ */
            exports_69("CHAR_AMPERSAND", CHAR_AMPERSAND = 38); /* & */
            exports_69("CHAR_EQUAL", CHAR_EQUAL = 61); /* = */
            // Digits
            exports_69("CHAR_0", CHAR_0 = 48); /* 0 */
            exports_69("CHAR_9", CHAR_9 = 57); /* 9 */
            isWindows = build.os == "windows";
            exports_69("SEP", SEP = isWindows ? "\\" : "/");
            exports_69("SEP_PATTERN", SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/);
        }
    };
});
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
System.register("https://deno.land/std@0.51.0/path/_util", ["https://deno.land/std@0.51.0/path/_constants"], function (exports_70, context_70) {
    "use strict";
    var _constants_ts_1;
    var __moduleName = context_70 && context_70.id;
    function assertPath(path) {
        if (typeof path !== "string") {
            throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
        }
    }
    exports_70("assertPath", assertPath);
    function isPosixPathSeparator(code) {
        return code === _constants_ts_1.CHAR_FORWARD_SLASH;
    }
    exports_70("isPosixPathSeparator", isPosixPathSeparator);
    function isPathSeparator(code) {
        return isPosixPathSeparator(code) || code === _constants_ts_1.CHAR_BACKWARD_SLASH;
    }
    exports_70("isPathSeparator", isPathSeparator);
    function isWindowsDeviceRoot(code) {
        return ((code >= _constants_ts_1.CHAR_LOWERCASE_A && code <= _constants_ts_1.CHAR_LOWERCASE_Z) ||
            (code >= _constants_ts_1.CHAR_UPPERCASE_A && code <= _constants_ts_1.CHAR_UPPERCASE_Z));
    }
    exports_70("isWindowsDeviceRoot", isWindowsDeviceRoot);
    // Resolves . and .. elements in a path with directory names
    function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
        let res = "";
        let lastSegmentLength = 0;
        let lastSlash = -1;
        let dots = 0;
        let code;
        for (let i = 0, len = path.length; i <= len; ++i) {
            if (i < len)
                code = path.charCodeAt(i);
            else if (isPathSeparator(code))
                break;
            else
                code = _constants_ts_1.CHAR_FORWARD_SLASH;
            if (isPathSeparator(code)) {
                if (lastSlash === i - 1 || dots === 1) {
                    // NOOP
                }
                else if (lastSlash !== i - 1 && dots === 2) {
                    if (res.length < 2 ||
                        lastSegmentLength !== 2 ||
                        res.charCodeAt(res.length - 1) !== _constants_ts_1.CHAR_DOT ||
                        res.charCodeAt(res.length - 2) !== _constants_ts_1.CHAR_DOT) {
                        if (res.length > 2) {
                            const lastSlashIndex = res.lastIndexOf(separator);
                            if (lastSlashIndex === -1) {
                                res = "";
                                lastSegmentLength = 0;
                            }
                            else {
                                res = res.slice(0, lastSlashIndex);
                                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                            }
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                        else if (res.length === 2 || res.length === 1) {
                            res = "";
                            lastSegmentLength = 0;
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    if (allowAboveRoot) {
                        if (res.length > 0)
                            res += `${separator}..`;
                        else
                            res = "..";
                        lastSegmentLength = 2;
                    }
                }
                else {
                    if (res.length > 0)
                        res += separator + path.slice(lastSlash + 1, i);
                    else
                        res = path.slice(lastSlash + 1, i);
                    lastSegmentLength = i - lastSlash - 1;
                }
                lastSlash = i;
                dots = 0;
            }
            else if (code === _constants_ts_1.CHAR_DOT && dots !== -1) {
                ++dots;
            }
            else {
                dots = -1;
            }
        }
        return res;
    }
    exports_70("normalizeString", normalizeString);
    function _format(sep, pathObject) {
        const dir = pathObject.dir || pathObject.root;
        const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
        if (!dir)
            return base;
        if (dir === pathObject.root)
            return dir + base;
        return dir + sep + base;
    }
    exports_70("_format", _format);
    return {
        setters: [
            function (_constants_ts_1_1) {
                _constants_ts_1 = _constants_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.51.0/fmt/colors", [], function (exports_71, context_71) {
    "use strict";
    var noColor, enabled;
    var __moduleName = context_71 && context_71.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_71("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_71("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_71("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_71("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_71("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_71("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_71("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_71("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_71("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_71("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_71("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_71("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_71("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_71("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_71("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_71("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_71("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_71("white", white);
    function gray(str) {
        return run(str, code([90], 39));
    }
    exports_71("gray", gray);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_71("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_71("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_71("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_71("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_71("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_71("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_71("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_71("bgWhite", bgWhite);
    /* Special Color Sequences */
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    /** Set text color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_71("rgb8", rgb8);
    /** Set background color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_71("bgRgb8", bgRgb8);
    /** Set text color using 24bit rgb. */
    function rgb24(str, color) {
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_71("rgb24", rgb24);
    /** Set background color using 24bit rgb. */
    function bgRgb24(str, color) {
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_71("bgRgb24", bgRgb24);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            /**
             * A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
             * on npm.
             *
             * ```
             * import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
             * console.log(bgBlue(red(bold("Hello world!"))));
             * ```
             *
             * This module supports `NO_COLOR` environmental variable disabling any coloring
             * if `NO_COLOR` is set.
             */
            noColor = Deno.noColor;
            enabled = !noColor;
        }
    };
});
System.register("https://deno.land/std@0.51.0/testing/diff", [], function (exports_72, context_72) {
    "use strict";
    var DiffType, REMOVED, COMMON, ADDED;
    var __moduleName = context_72 && context_72.id;
    function createCommon(A, B, reverse) {
        const common = [];
        if (A.length === 0 || B.length === 0)
            return [];
        for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
            if (A[reverse ? A.length - i - 1 : i] === B[reverse ? B.length - i - 1 : i]) {
                common.push(A[reverse ? A.length - i - 1 : i]);
            }
            else {
                return common;
            }
        }
        return common;
    }
    function diff(A, B) {
        const prefixCommon = createCommon(A, B);
        const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
        A = suffixCommon.length
            ? A.slice(prefixCommon.length, -suffixCommon.length)
            : A.slice(prefixCommon.length);
        B = suffixCommon.length
            ? B.slice(prefixCommon.length, -suffixCommon.length)
            : B.slice(prefixCommon.length);
        const swapped = B.length > A.length;
        [A, B] = swapped ? [B, A] : [A, B];
        const M = A.length;
        const N = B.length;
        if (!M && !N && !suffixCommon.length && !prefixCommon.length)
            return [];
        if (!N) {
            return [
                ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
                ...A.map((a) => ({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a,
                })),
                ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ];
        }
        const offset = N;
        const delta = M - N;
        const size = M + N + 1;
        const fp = new Array(size).fill({ y: -1 });
        /**
         * INFO:
         * This buffer is used to save memory and improve performance.
         * The first half is used to save route and last half is used to save diff
         * type.
         * This is because, when I kept new uint8array area to save type,performance
         * worsened.
         */
        const routes = new Uint32Array((M * N + size + 1) * 2);
        const diffTypesPtrOffset = routes.length / 2;
        let ptr = 0;
        let p = -1;
        function backTrace(A, B, current, swapped) {
            const M = A.length;
            const N = B.length;
            const result = [];
            let a = M - 1;
            let b = N - 1;
            let j = routes[current.id];
            let type = routes[current.id + diffTypesPtrOffset];
            while (true) {
                if (!j && !type)
                    break;
                const prev = j;
                if (type === REMOVED) {
                    result.unshift({
                        type: swapped ? DiffType.removed : DiffType.added,
                        value: B[b],
                    });
                    b -= 1;
                }
                else if (type === ADDED) {
                    result.unshift({
                        type: swapped ? DiffType.added : DiffType.removed,
                        value: A[a],
                    });
                    a -= 1;
                }
                else {
                    result.unshift({ type: DiffType.common, value: A[a] });
                    a -= 1;
                    b -= 1;
                }
                j = routes[prev];
                type = routes[prev + diffTypesPtrOffset];
            }
            return result;
        }
        function createFP(slide, down, k, M) {
            if (slide && slide.y === -1 && down && down.y === -1) {
                return { y: 0, id: 0 };
            }
            if ((down && down.y === -1) ||
                k === M ||
                (slide && slide.y) > (down && down.y) + 1) {
                const prev = slide.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = ADDED;
                return { y: slide.y, id: ptr };
            }
            else {
                const prev = down.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = REMOVED;
                return { y: down.y + 1, id: ptr };
            }
        }
        function snake(k, slide, down, _offset, A, B) {
            const M = A.length;
            const N = B.length;
            if (k < -N || M < k)
                return { y: -1, id: -1 };
            const fp = createFP(slide, down, k, M);
            while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
                const prev = fp.id;
                ptr++;
                fp.id = ptr;
                fp.y += 1;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = COMMON;
            }
            return fp;
        }
        while (fp[delta + offset].y < N) {
            p = p + 1;
            for (let k = -p; k < delta; ++k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            for (let k = delta + p; k > delta; --k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
        }
        return [
            ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ...backTrace(A, B, fp[delta + offset], swapped),
            ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
        ];
    }
    exports_72("default", diff);
    return {
        setters: [],
        execute: function () {
            (function (DiffType) {
                DiffType["removed"] = "removed";
                DiffType["common"] = "common";
                DiffType["added"] = "added";
            })(DiffType || (DiffType = {}));
            exports_72("DiffType", DiffType);
            REMOVED = 1;
            COMMON = 2;
            ADDED = 3;
        }
    };
});
System.register("https://deno.land/std@0.51.0/testing/asserts", ["https://deno.land/std@0.51.0/fmt/colors", "https://deno.land/std@0.51.0/testing/diff"], function (exports_73, context_73) {
    "use strict";
    var colors_ts_5, diff_ts_3, CAN_NOT_DISPLAY, AssertionError;
    var __moduleName = context_73 && context_73.id;
    function format(v) {
        let string = Deno.inspect(v);
        if (typeof v == "string") {
            string = `"${string.replace(/(?=["\\])/g, "\\")}"`;
        }
        return string;
    }
    function createColor(diffType) {
        switch (diffType) {
            case diff_ts_3.DiffType.added:
                return (s) => colors_ts_5.green(colors_ts_5.bold(s));
            case diff_ts_3.DiffType.removed:
                return (s) => colors_ts_5.red(colors_ts_5.bold(s));
            default:
                return colors_ts_5.white;
        }
    }
    function createSign(diffType) {
        switch (diffType) {
            case diff_ts_3.DiffType.added:
                return "+   ";
            case diff_ts_3.DiffType.removed:
                return "-   ";
            default:
                return "    ";
        }
    }
    function buildMessage(diffResult) {
        const messages = [];
        messages.push("");
        messages.push("");
        messages.push(`    ${colors_ts_5.gray(colors_ts_5.bold("[Diff]"))} ${colors_ts_5.red(colors_ts_5.bold("Actual"))} / ${colors_ts_5.green(colors_ts_5.bold("Expected"))}`);
        messages.push("");
        messages.push("");
        diffResult.forEach((result) => {
            const c = createColor(result.type);
            messages.push(c(`${createSign(result.type)}${result.value}`));
        });
        messages.push("");
        return messages;
    }
    function isKeyedCollection(x) {
        return [Symbol.iterator, "size"].every((k) => k in x);
    }
    function equal(c, d) {
        const seen = new Map();
        return (function compare(a, b) {
            // Have to render RegExp & Date for string comparison
            // unless it's mistreated as object
            if (a &&
                b &&
                ((a instanceof RegExp && b instanceof RegExp) ||
                    (a instanceof Date && b instanceof Date))) {
                return String(a) === String(b);
            }
            if (Object.is(a, b)) {
                return true;
            }
            if (a && typeof a === "object" && b && typeof b === "object") {
                if (seen.get(a) === b) {
                    return true;
                }
                if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                    return false;
                }
                if (isKeyedCollection(a) && isKeyedCollection(b)) {
                    if (a.size !== b.size) {
                        return false;
                    }
                    let unmatchedEntries = a.size;
                    for (const [aKey, aValue] of a.entries()) {
                        for (const [bKey, bValue] of b.entries()) {
                            /* Given that Map keys can be references, we need
                             * to ensure that they are also deeply equal */
                            if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                                (compare(aKey, bKey) && compare(aValue, bValue))) {
                                unmatchedEntries--;
                            }
                        }
                    }
                    return unmatchedEntries === 0;
                }
                const merged = { ...a, ...b };
                for (const key in merged) {
                    if (!compare(a && a[key], b && b[key])) {
                        return false;
                    }
                }
                seen.set(a, b);
                return true;
            }
            return false;
        })(c, d);
    }
    exports_73("equal", equal);
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
        if (!expr) {
            throw new AssertionError(msg);
        }
    }
    exports_73("assert", assert);
    /**
     * Make an assertion that `actual` and `expected` are equal, deeply. If not
     * deeply equal, then throw.
     */
    function assertEquals(actual, expected, msg) {
        if (equal(actual, expected)) {
            return;
        }
        let message = "";
        const actualString = format(actual);
        const expectedString = format(expected);
        try {
            const diffResult = diff_ts_3.default(actualString.split("\n"), expectedString.split("\n"));
            message = buildMessage(diffResult).join("\n");
        }
        catch (e) {
            message = `\n${colors_ts_5.red(CAN_NOT_DISPLAY)} + \n\n`;
        }
        if (msg) {
            message = msg;
        }
        throw new AssertionError(message);
    }
    exports_73("assertEquals", assertEquals);
    /**
     * Make an assertion that `actual` and `expected` are not equal, deeply.
     * If not then throw.
     */
    function assertNotEquals(actual, expected, msg) {
        if (!equal(actual, expected)) {
            return;
        }
        let actualString;
        let expectedString;
        try {
            actualString = String(actual);
        }
        catch (e) {
            actualString = "[Cannot display]";
        }
        try {
            expectedString = String(expected);
        }
        catch (e) {
            expectedString = "[Cannot display]";
        }
        if (!msg) {
            msg = `actual: ${actualString} expected: ${expectedString}`;
        }
        throw new AssertionError(msg);
    }
    exports_73("assertNotEquals", assertNotEquals);
    /**
     * Make an assertion that `actual` and `expected` are strictly equal.  If
     * not then throw.
     */
    function assertStrictEq(actual, expected, msg) {
        if (actual !== expected) {
            let actualString;
            let expectedString;
            try {
                actualString = String(actual);
            }
            catch (e) {
                actualString = "[Cannot display]";
            }
            try {
                expectedString = String(expected);
            }
            catch (e) {
                expectedString = "[Cannot display]";
            }
            if (!msg) {
                msg = `actual: ${actualString} expected: ${expectedString}`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_73("assertStrictEq", assertStrictEq);
    /**
     * Make an assertion that actual contains expected. If not
     * then thrown.
     */
    function assertStrContains(actual, expected, msg) {
        if (!actual.includes(expected)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to contains: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_73("assertStrContains", assertStrContains);
    /**
     * Make an assertion that `actual` contains the `expected` values
     * If not then thrown.
     */
    function assertArrayContains(actual, expected, msg) {
        const missing = [];
        for (let i = 0; i < expected.length; i++) {
            let found = false;
            for (let j = 0; j < actual.length; j++) {
                if (equal(expected[i], actual[j])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missing.push(expected[i]);
            }
        }
        if (missing.length === 0) {
            return;
        }
        if (!msg) {
            msg = `actual: "${actual}" expected to contains: "${expected}"`;
            msg += "\n";
            msg += `missing: ${missing}`;
        }
        throw new AssertionError(msg);
    }
    exports_73("assertArrayContains", assertArrayContains);
    /**
     * Make an assertion that `actual` match RegExp `expected`. If not
     * then thrown
     */
    function assertMatch(actual, expected, msg) {
        if (!expected.test(actual)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to match: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_73("assertMatch", assertMatch);
    /**
     * Forcefully throws a failed assertion
     */
    function fail(msg) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
    }
    exports_73("fail", fail);
    /** Executes a function, expecting it to throw.  If it does not, then it
     * throws.  An error class and a string that should be included in the
     * error message can also be asserted.
     */
    function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            fn();
        }
        catch (e) {
            if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
                msg = `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes && !e.message.includes(msgIncludes)) {
                msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_73("assertThrows", assertThrows);
    async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            await fn();
        }
        catch (e) {
            if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
                msg = `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes && !e.message.includes(msgIncludes)) {
                msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_73("assertThrowsAsync", assertThrowsAsync);
    /** Use this to stub out methods that will throw when invoked. */
    function unimplemented(msg) {
        throw new AssertionError(msg || "unimplemented");
    }
    exports_73("unimplemented", unimplemented);
    /** Use this to assert unreachable code. */
    function unreachable() {
        throw new AssertionError("unreachable");
    }
    exports_73("unreachable", unreachable);
    return {
        setters: [
            function (colors_ts_5_1) {
                colors_ts_5 = colors_ts_5_1;
            },
            function (diff_ts_3_1) {
                diff_ts_3 = diff_ts_3_1;
            }
        ],
        execute: function () {
            CAN_NOT_DISPLAY = "[Cannot display]";
            AssertionError = class AssertionError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "AssertionError";
                }
            };
            exports_73("AssertionError", AssertionError);
        }
    };
});
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
System.register("https://deno.land/std@0.51.0/path/win32", ["https://deno.land/std@0.51.0/path/_constants", "https://deno.land/std@0.51.0/path/_util", "https://deno.land/std@0.51.0/testing/asserts"], function (exports_74, context_74) {
    "use strict";
    var cwd, env, _constants_ts_2, _util_ts_1, asserts_ts_5, sep, delimiter;
    var __moduleName = context_74 && context_74.id;
    function resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
            let path;
            if (i >= 0) {
                path = pathSegments[i];
            }
            else if (!resolvedDevice) {
                path = cwd();
            }
            else {
                // Windows has the concept of drive-specific current working
                // directories. If we've resolved a drive letter but not yet an
                // absolute path, get cwd for that drive, or the process cwd if
                // the drive cwd is not available. We're sure the device is not
                // a UNC path at this points, because UNC paths are always absolute.
                path = env.get(`=${resolvedDevice}`) || cwd();
                // Verify that a cwd was found and that it actually points
                // to our drive. If not, default to the drive's root.
                if (path === undefined ||
                    path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                    path = `${resolvedDevice}\\`;
                }
            }
            _util_ts_1.assertPath(path);
            const len = path.length;
            // Skip empty entries
            if (len === 0)
                continue;
            let rootEnd = 0;
            let device = "";
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            // Try to match a root
            if (len > 1) {
                if (_util_ts_1.isPathSeparator(code)) {
                    // Possible UNC root
                    // If we started with a separator, we know we at least have an
                    // absolute path of some kind (UNC or otherwise)
                    isAbsolute = true;
                    if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                        // Matched double path separator at beginning
                        let j = 2;
                        let last = j;
                        // Match 1 or more non-path separators
                        for (; j < len; ++j) {
                            if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            const firstPart = path.slice(last, j);
                            // Matched!
                            last = j;
                            // Match 1 or more path separators
                            for (; j < len; ++j) {
                                if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j < len && j !== last) {
                                // Matched!
                                last = j;
                                // Match 1 or more non-path separators
                                for (; j < len; ++j) {
                                    if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                        break;
                                }
                                if (j === len) {
                                    // We matched a UNC root only
                                    device = `\\\\${firstPart}\\${path.slice(last)}`;
                                    rootEnd = j;
                                }
                                else if (j !== last) {
                                    // We matched a UNC root with leftovers
                                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                    rootEnd = j;
                                }
                            }
                        }
                    }
                    else {
                        rootEnd = 1;
                    }
                }
                else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                    // Possible device root
                    if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                        device = path.slice(0, 2);
                        rootEnd = 2;
                        if (len > 2) {
                            if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                                // Treat separator following drive name as an absolute path
                                // indicator
                                isAbsolute = true;
                                rootEnd = 3;
                            }
                        }
                    }
                }
            }
            else if (_util_ts_1.isPathSeparator(code)) {
                // `path` contains just a path separator
                rootEnd = 1;
                isAbsolute = true;
            }
            if (device.length > 0 &&
                resolvedDevice.length > 0 &&
                device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                // This path points to another device so it is not applicable
                continue;
            }
            if (resolvedDevice.length === 0 && device.length > 0) {
                resolvedDevice = device;
            }
            if (!resolvedAbsolute) {
                resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                resolvedAbsolute = isAbsolute;
            }
            if (resolvedAbsolute && resolvedDevice.length > 0)
                break;
        }
        // At this point the path should be resolved to a full absolute path,
        // but handle relative paths to be safe (might happen when process.cwd()
        // fails)
        // Normalize the tail path
        resolvedTail = _util_ts_1.normalizeString(resolvedTail, !resolvedAbsolute, "\\", _util_ts_1.isPathSeparator);
        return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
    }
    exports_74("resolve", resolve);
    function normalize(path) {
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0)
            return ".";
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        // Try to match a root
        if (len > 1) {
            if (_util_ts_1.isPathSeparator(code)) {
                // Possible UNC root
                // If we started with a separator, we know we at least have an absolute
                // path of some kind (UNC or otherwise)
                isAbsolute = true;
                if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    for (; j < len; ++j) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                            break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        for (; j < len; ++j) {
                            if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            for (; j < len; ++j) {
                                if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                // Return the normalized version of the UNC root since there
                                // is nothing left to process
                                return `\\\\${firstPart}\\${path.slice(last)}\\`;
                            }
                            else if (j !== last) {
                                // We matched a UNC root with leftovers
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                }
                else {
                    rootEnd = 1;
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                // Possible device root
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                            // Treat separator following drive name as an absolute path
                            // indicator
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        }
        else if (_util_ts_1.isPathSeparator(code)) {
            // `path` contains just a path separator, exit early to avoid unnecessary
            // work
            return "\\";
        }
        let tail;
        if (rootEnd < len) {
            tail = _util_ts_1.normalizeString(path.slice(rootEnd), !isAbsolute, "\\", _util_ts_1.isPathSeparator);
        }
        else {
            tail = "";
        }
        if (tail.length === 0 && !isAbsolute)
            tail = ".";
        if (tail.length > 0 && _util_ts_1.isPathSeparator(path.charCodeAt(len - 1))) {
            tail += "\\";
        }
        if (device === undefined) {
            if (isAbsolute) {
                if (tail.length > 0)
                    return `\\${tail}`;
                else
                    return "\\";
            }
            else if (tail.length > 0) {
                return tail;
            }
            else {
                return "";
            }
        }
        else if (isAbsolute) {
            if (tail.length > 0)
                return `${device}\\${tail}`;
            else
                return `${device}\\`;
        }
        else if (tail.length > 0) {
            return device + tail;
        }
        else {
            return device;
        }
    }
    exports_74("normalize", normalize);
    function isAbsolute(path) {
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0)
            return false;
        const code = path.charCodeAt(0);
        if (_util_ts_1.isPathSeparator(code)) {
            return true;
        }
        else if (_util_ts_1.isWindowsDeviceRoot(code)) {
            // Possible device root
            if (len > 2 && path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                if (_util_ts_1.isPathSeparator(path.charCodeAt(2)))
                    return true;
            }
        }
        return false;
    }
    exports_74("isAbsolute", isAbsolute);
    function join(...paths) {
        const pathsCount = paths.length;
        if (pathsCount === 0)
            return ".";
        let joined;
        let firstPart = null;
        for (let i = 0; i < pathsCount; ++i) {
            const path = paths[i];
            _util_ts_1.assertPath(path);
            if (path.length > 0) {
                if (joined === undefined)
                    joined = firstPart = path;
                else
                    joined += `\\${path}`;
            }
        }
        if (joined === undefined)
            return ".";
        // Make sure that the joined path doesn't start with two slashes, because
        // normalize() will mistake it for an UNC path then.
        //
        // This step is skipped when it is very clear that the user actually
        // intended to point at an UNC path. This is assumed when the first
        // non-empty string arguments starts with exactly two slashes followed by
        // at least one more non-slash character.
        //
        // Note that for normalize() to treat a path as an UNC path it needs to
        // have at least 2 components, so we don't filter for that here.
        // This means that the user can use join to construct UNC paths from
        // a server name and a share name; for example:
        //   path.join('//server', 'share') -> '\\\\server\\share\\')
        let needsReplace = true;
        let slashCount = 0;
        asserts_ts_5.assert(firstPart != null);
        if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(0))) {
            ++slashCount;
            const firstLen = firstPart.length;
            if (firstLen > 1) {
                if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(1))) {
                    ++slashCount;
                    if (firstLen > 2) {
                        if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(2)))
                            ++slashCount;
                        else {
                            // We matched a UNC path in the first part
                            needsReplace = false;
                        }
                    }
                }
            }
        }
        if (needsReplace) {
            // Find any more consecutive slashes we need to replace
            for (; slashCount < joined.length; ++slashCount) {
                if (!_util_ts_1.isPathSeparator(joined.charCodeAt(slashCount)))
                    break;
            }
            // Replace the slashes if needed
            if (slashCount >= 2)
                joined = `\\${joined.slice(slashCount)}`;
        }
        return normalize(joined);
    }
    exports_74("join", join);
    // It will solve the relative path from `from` to `to`, for instance:
    //  from = 'C:\\orandea\\test\\aaa'
    //  to = 'C:\\orandea\\impl\\bbb'
    // The output of the function should be: '..\\..\\impl\\bbb'
    function relative(from, to) {
        _util_ts_1.assertPath(from);
        _util_ts_1.assertPath(to);
        if (from === to)
            return "";
        const fromOrig = resolve(from);
        const toOrig = resolve(to);
        if (fromOrig === toOrig)
            return "";
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to)
            return "";
        // Trim any leading backslashes
        let fromStart = 0;
        let fromEnd = from.length;
        for (; fromStart < fromEnd; ++fromStart) {
            if (from.charCodeAt(fromStart) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        // Trim trailing backslashes (applicable to UNC paths only)
        for (; fromEnd - 1 > fromStart; --fromEnd) {
            if (from.charCodeAt(fromEnd - 1) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        const fromLen = fromEnd - fromStart;
        // Trim any leading backslashes
        let toStart = 0;
        let toEnd = to.length;
        for (; toStart < toEnd; ++toStart) {
            if (to.charCodeAt(toStart) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        // Trim trailing backslashes (applicable to UNC paths only)
        for (; toEnd - 1 > toStart; --toEnd) {
            if (to.charCodeAt(toEnd - 1) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        const toLen = toEnd - toStart;
        // Compare paths to find the longest common path from root
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
                        return toOrig.slice(toStart + i + 1);
                    }
                    else if (i === 2) {
                        // We get here if `from` is the device root.
                        // For example: from='C:\\'; to='C:\\foo'
                        return toOrig.slice(toStart + i);
                    }
                }
                if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from='C:\\foo\\bar'; to='C:\\foo'
                        lastCommonSep = i;
                    }
                    else if (i === 2) {
                        // We get here if `to` is the device root.
                        // For example: from='C:\\foo\\bar'; to='C:\\'
                        lastCommonSep = 3;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === _constants_ts_2.CHAR_BACKWARD_SLASH)
                lastCommonSep = i;
        }
        // We found a mismatch before the first common path separator was seen, so
        // return the original `to`.
        if (i !== length && lastCommonSep === -1) {
            return toOrig;
        }
        let out = "";
        if (lastCommonSep === -1)
            lastCommonSep = 0;
        // Generate the relative path based on the path difference between `to` and
        // `from`
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                if (out.length === 0)
                    out += "..";
                else
                    out += "\\..";
            }
        }
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts
        if (out.length > 0) {
            return out + toOrig.slice(toStart + lastCommonSep, toEnd);
        }
        else {
            toStart += lastCommonSep;
            if (toOrig.charCodeAt(toStart) === _constants_ts_2.CHAR_BACKWARD_SLASH)
                ++toStart;
            return toOrig.slice(toStart, toEnd);
        }
    }
    exports_74("relative", relative);
    function toNamespacedPath(path) {
        // Note: this will *probably* throw somewhere.
        if (typeof path !== "string")
            return path;
        if (path.length === 0)
            return "";
        const resolvedPath = resolve(path);
        if (resolvedPath.length >= 3) {
            if (resolvedPath.charCodeAt(0) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                // Possible UNC root
                if (resolvedPath.charCodeAt(1) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                    const code = resolvedPath.charCodeAt(2);
                    if (code !== _constants_ts_2.CHAR_QUESTION_MARK && code !== _constants_ts_2.CHAR_DOT) {
                        // Matched non-long UNC root, convert the path to a long UNC path
                        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                    }
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
                // Possible device root
                if (resolvedPath.charCodeAt(1) === _constants_ts_2.CHAR_COLON &&
                    resolvedPath.charCodeAt(2) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                    // Matched device root, convert the path to a long UNC path
                    return `\\\\?\\${resolvedPath}`;
                }
            }
        }
        return path;
    }
    exports_74("toNamespacedPath", toNamespacedPath);
    function dirname(path) {
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0)
            return ".";
        let rootEnd = -1;
        let end = -1;
        let matchedSlash = true;
        let offset = 0;
        const code = path.charCodeAt(0);
        // Try to match a root
        if (len > 1) {
            if (_util_ts_1.isPathSeparator(code)) {
                // Possible UNC root
                rootEnd = offset = 1;
                if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    for (; j < len; ++j) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                            break;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        for (; j < len; ++j) {
                            if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            for (; j < len; ++j) {
                                if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                return path;
                            }
                            if (j !== last) {
                                // We matched a UNC root with leftovers
                                // Offset by 1 to include the separator after the UNC root to
                                // treat it as a "normal root" on top of a (UNC) root
                                rootEnd = offset = j + 1;
                            }
                        }
                    }
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                // Possible device root
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                    rootEnd = offset = 2;
                    if (len > 2) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(2)))
                            rootEnd = offset = 3;
                    }
                }
            }
        }
        else if (_util_ts_1.isPathSeparator(code)) {
            // `path` contains just a path separator, exit early to avoid
            // unnecessary work
            return path;
        }
        for (let i = len - 1; i >= offset; --i) {
            if (_util_ts_1.isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            }
            else {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }
        if (end === -1) {
            if (rootEnd === -1)
                return ".";
            else
                end = rootEnd;
        }
        return path.slice(0, end);
    }
    exports_74("dirname", dirname);
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        _util_ts_1.assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        // Check for a drive letter prefix so as not to mistake the following
        // path separator as an extra separator at the end of the path that can be
        // disregarded
        if (path.length >= 2) {
            const drive = path.charCodeAt(0);
            if (_util_ts_1.isWindowsDeviceRoot(drive)) {
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON)
                    start = 2;
            }
        }
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path)
                return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= start; --i) {
                const code = path.charCodeAt(i);
                if (_util_ts_1.isPathSeparator(code)) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end)
                end = firstNonSlashEnd;
            else if (end === -1)
                end = path.length;
            return path.slice(start, end);
        }
        else {
            for (i = path.length - 1; i >= start; --i) {
                if (_util_ts_1.isPathSeparator(path.charCodeAt(i))) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // path component
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1)
                return "";
            return path.slice(start, end);
        }
    }
    exports_74("basename", basename);
    function extname(path) {
        _util_ts_1.assertPath(path);
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        // Check for a drive letter prefix so as not to mistake the following
        // path separator as an extra separator at the end of the path that can be
        // disregarded
        if (path.length >= 2 &&
            path.charCodeAt(1) === _constants_ts_2.CHAR_COLON &&
            _util_ts_1.isWindowsDeviceRoot(path.charCodeAt(0))) {
            start = startPart = 2;
        }
        for (let i = path.length - 1; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (_util_ts_1.isPathSeparator(code)) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_2.CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            return "";
        }
        return path.slice(startDot, end);
    }
    exports_74("extname", extname);
    function format(pathObject) {
        /* eslint-disable max-len */
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _util_ts_1._format("\\", pathObject);
    }
    exports_74("format", format);
    function parse(path) {
        _util_ts_1.assertPath(path);
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        const len = path.length;
        if (len === 0)
            return ret;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        // Try to match a root
        if (len > 1) {
            if (_util_ts_1.isPathSeparator(code)) {
                // Possible UNC root
                rootEnd = 1;
                if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    for (; j < len; ++j) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                            break;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        for (; j < len; ++j) {
                            if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            for (; j < len; ++j) {
                                if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                rootEnd = j;
                            }
                            else if (j !== last) {
                                // We matched a UNC root with leftovers
                                rootEnd = j + 1;
                            }
                        }
                    }
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                // Possible device root
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                    rootEnd = 2;
                    if (len > 2) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                            if (len === 3) {
                                // `path` contains just a drive root, exit early to avoid
                                // unnecessary work
                                ret.root = ret.dir = path;
                                return ret;
                            }
                            rootEnd = 3;
                        }
                    }
                    else {
                        // `path` contains just a drive root, exit early to avoid
                        // unnecessary work
                        ret.root = ret.dir = path;
                        return ret;
                    }
                }
            }
        }
        else if (_util_ts_1.isPathSeparator(code)) {
            // `path` contains just a path separator, exit early to avoid
            // unnecessary work
            ret.root = ret.dir = path;
            return ret;
        }
        if (rootEnd > 0)
            ret.root = path.slice(0, rootEnd);
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        // Get non-dir info
        for (; i >= rootEnd; --i) {
            code = path.charCodeAt(i);
            if (_util_ts_1.isPathSeparator(code)) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_2.CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            if (end !== -1) {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
        else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
        }
        // If the directory is the root, use the entire root as the `dir` including
        // the trailing slash if any (`C:\abc` -> `C:\`). Otherwise, strip out the
        // trailing slash (`C:\abc\def` -> `C:\abc`).
        if (startPart > 0 && startPart !== rootEnd) {
            ret.dir = path.slice(0, startPart - 1);
        }
        else
            ret.dir = ret.root;
        return ret;
    }
    exports_74("parse", parse);
    /** Converts a file URL to a path string.
     *
     *      fromFileUrl("file:///C:/Users/foo"); // "C:\\Users\\foo"
     *      fromFileUrl("file:///home/foo"); // "\\home\\foo"
     *
     * Note that non-file URLs are treated as file URLs and irrelevant components
     * are ignored.
     */
    function fromFileUrl(url) {
        return new URL(url).pathname
            .replace(/^\/*([A-Za-z]:)(\/|$)/, "$1/")
            .replace(/\//g, "\\");
    }
    exports_74("fromFileUrl", fromFileUrl);
    return {
        setters: [
            function (_constants_ts_2_1) {
                _constants_ts_2 = _constants_ts_2_1;
            },
            function (_util_ts_1_1) {
                _util_ts_1 = _util_ts_1_1;
            },
            function (asserts_ts_5_1) {
                asserts_ts_5 = asserts_ts_5_1;
            }
        ],
        execute: function () {
            cwd = Deno.cwd, env = Deno.env;
            exports_74("sep", sep = "\\");
            exports_74("delimiter", delimiter = ";");
        }
    };
});
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
System.register("https://deno.land/std@0.51.0/path/posix", ["https://deno.land/std@0.51.0/path/_constants", "https://deno.land/std@0.51.0/path/_util"], function (exports_75, context_75) {
    "use strict";
    var cwd, _constants_ts_3, _util_ts_2, sep, delimiter;
    var __moduleName = context_75 && context_75.id;
    // path.resolve([from ...], to)
    function resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            let path;
            if (i >= 0)
                path = pathSegments[i];
            else
                path = cwd();
            _util_ts_2.assertPath(path);
            // Skip empty entries
            if (path.length === 0) {
                continue;
            }
            resolvedPath = `${path}/${resolvedPath}`;
            resolvedAbsolute = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        // Normalize the path
        resolvedPath = _util_ts_2.normalizeString(resolvedPath, !resolvedAbsolute, "/", _util_ts_2.isPosixPathSeparator);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0)
                return `/${resolvedPath}`;
            else
                return "/";
        }
        else if (resolvedPath.length > 0)
            return resolvedPath;
        else
            return ".";
    }
    exports_75("resolve", resolve);
    function normalize(path) {
        _util_ts_2.assertPath(path);
        if (path.length === 0)
            return ".";
        const isAbsolute = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        const trailingSeparator = path.charCodeAt(path.length - 1) === _constants_ts_3.CHAR_FORWARD_SLASH;
        // Normalize the path
        path = _util_ts_2.normalizeString(path, !isAbsolute, "/", _util_ts_2.isPosixPathSeparator);
        if (path.length === 0 && !isAbsolute)
            path = ".";
        if (path.length > 0 && trailingSeparator)
            path += "/";
        if (isAbsolute)
            return `/${path}`;
        return path;
    }
    exports_75("normalize", normalize);
    function isAbsolute(path) {
        _util_ts_2.assertPath(path);
        return path.length > 0 && path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
    }
    exports_75("isAbsolute", isAbsolute);
    function join(...paths) {
        if (paths.length === 0)
            return ".";
        let joined;
        for (let i = 0, len = paths.length; i < len; ++i) {
            const path = paths[i];
            _util_ts_2.assertPath(path);
            if (path.length > 0) {
                if (!joined)
                    joined = path;
                else
                    joined += `/${path}`;
            }
        }
        if (!joined)
            return ".";
        return normalize(joined);
    }
    exports_75("join", join);
    function relative(from, to) {
        _util_ts_2.assertPath(from);
        _util_ts_2.assertPath(to);
        if (from === to)
            return "";
        from = resolve(from);
        to = resolve(to);
        if (from === to)
            return "";
        // Trim any leading backslashes
        let fromStart = 1;
        const fromEnd = from.length;
        for (; fromStart < fromEnd; ++fromStart) {
            if (from.charCodeAt(fromStart) !== _constants_ts_3.CHAR_FORWARD_SLASH)
                break;
        }
        const fromLen = fromEnd - fromStart;
        // Trim any leading backslashes
        let toStart = 1;
        const toEnd = to.length;
        for (; toStart < toEnd; ++toStart) {
            if (to.charCodeAt(toStart) !== _constants_ts_3.CHAR_FORWARD_SLASH)
                break;
        }
        const toLen = toEnd - toStart;
        // Compare paths to find the longest common path from root
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from='/foo/bar'; to='/foo/bar/baz'
                        return to.slice(toStart + i + 1);
                    }
                    else if (i === 0) {
                        // We get here if `from` is the root
                        // For example: from='/'; to='/foo'
                        return to.slice(toStart + i);
                    }
                }
                else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from='/foo/bar/baz'; to='/foo/bar'
                        lastCommonSep = i;
                    }
                    else if (i === 0) {
                        // We get here if `to` is the root.
                        // For example: from='/foo'; to='/'
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === _constants_ts_3.CHAR_FORWARD_SLASH)
                lastCommonSep = i;
        }
        let out = "";
        // Generate the relative path based on the path difference between `to`
        // and `from`
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                if (out.length === 0)
                    out += "..";
                else
                    out += "/..";
            }
        }
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts
        if (out.length > 0)
            return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === _constants_ts_3.CHAR_FORWARD_SLASH)
                ++toStart;
            return to.slice(toStart);
        }
    }
    exports_75("relative", relative);
    function toNamespacedPath(path) {
        // Non-op on posix systems
        return path;
    }
    exports_75("toNamespacedPath", toNamespacedPath);
    function dirname(path) {
        _util_ts_2.assertPath(path);
        if (path.length === 0)
            return ".";
        const hasRoot = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        let end = -1;
        let matchedSlash = true;
        for (let i = path.length - 1; i >= 1; --i) {
            if (path.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            }
            else {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }
        if (end === -1)
            return hasRoot ? "/" : ".";
        if (hasRoot && end === 1)
            return "//";
        return path.slice(0, end);
    }
    exports_75("dirname", dirname);
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        _util_ts_2.assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path)
                return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= 0; --i) {
                const code = path.charCodeAt(i);
                if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end)
                end = firstNonSlashEnd;
            else if (end === -1)
                end = path.length;
            return path.slice(start, end);
        }
        else {
            for (i = path.length - 1; i >= 0; --i) {
                if (path.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // path component
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1)
                return "";
            return path.slice(start, end);
        }
    }
    exports_75("basename", basename);
    function extname(path) {
        _util_ts_2.assertPath(path);
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        for (let i = path.length - 1; i >= 0; --i) {
            const code = path.charCodeAt(i);
            if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_3.CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            return "";
        }
        return path.slice(startDot, end);
    }
    exports_75("extname", extname);
    function format(pathObject) {
        /* eslint-disable max-len */
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _util_ts_2._format("/", pathObject);
    }
    exports_75("format", format);
    function parse(path) {
        _util_ts_2.assertPath(path);
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path.length === 0)
            return ret;
        const isAbsolute = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute) {
            ret.root = "/";
            start = 1;
        }
        else {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        // Get non-dir info
        for (; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_3.CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute) {
                    ret.base = ret.name = path.slice(1, end);
                }
                else {
                    ret.base = ret.name = path.slice(startPart, end);
                }
            }
        }
        else {
            if (startPart === 0 && isAbsolute) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            }
            else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0)
            ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute)
            ret.dir = "/";
        return ret;
    }
    exports_75("parse", parse);
    /** Converts a file URL to a path string.
     *
     *      fromFileUrl("file:///home/foo"); // "/home/foo"
     *
     * Note that non-file URLs are treated as file URLs and irrelevant components
     * are ignored.
     */
    function fromFileUrl(url) {
        return new URL(url).pathname;
    }
    exports_75("fromFileUrl", fromFileUrl);
    return {
        setters: [
            function (_constants_ts_3_1) {
                _constants_ts_3 = _constants_ts_3_1;
            },
            function (_util_ts_2_1) {
                _util_ts_2 = _util_ts_2_1;
            }
        ],
        execute: function () {
            cwd = Deno.cwd;
            exports_75("sep", sep = "/");
            exports_75("delimiter", delimiter = ":");
        }
    };
});
System.register("https://deno.land/std@0.51.0/path/separator", [], function (exports_76, context_76) {
    "use strict";
    var isWindows, SEP, SEP_PATTERN;
    var __moduleName = context_76 && context_76.id;
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            isWindows = Deno.build.os == "windows";
            exports_76("SEP", SEP = isWindows ? "\\" : "/");
            exports_76("SEP_PATTERN", SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/);
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std@0.51.0/path/common", ["https://deno.land/std@0.51.0/path/separator"], function (exports_77, context_77) {
    "use strict";
    var separator_ts_1;
    var __moduleName = context_77 && context_77.id;
    /** Determines the common path from a set of paths, using an optional separator,
     * which defaults to the OS default separator.
     *
     *       import { common } from "https://deno.land/std/path/mod.ts";
     *       const p = common([
     *         "./deno/std/path/mod.ts",
     *         "./deno/std/fs/mod.ts",
     *       ]);
     *       console.log(p); // "./deno/std/"
     *
     */
    function common(paths, sep = separator_ts_1.SEP) {
        const [first = "", ...remaining] = paths;
        if (first === "" || remaining.length === 0) {
            return first.substring(0, first.lastIndexOf(sep) + 1);
        }
        const parts = first.split(sep);
        let endOfPrefix = parts.length;
        for (const path of remaining) {
            const compare = path.split(sep);
            for (let i = 0; i < endOfPrefix; i++) {
                if (compare[i] !== parts[i]) {
                    endOfPrefix = i;
                }
            }
            if (endOfPrefix === 0) {
                return "";
            }
        }
        const prefix = parts.slice(0, endOfPrefix).join(sep);
        return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
    }
    exports_77("common", common);
    return {
        setters: [
            function (separator_ts_1_1) {
                separator_ts_1 = separator_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
// This file is ported from globrex@0.1.2
// MIT License
// Copyright (c) 2018 Terkel Gjervig Nielsen
System.register("https://deno.land/std@0.51.0/path/_globrex", [], function (exports_78, context_78) {
    "use strict";
    var isWin, SEP, SEP_ESC, SEP_RAW, GLOBSTAR, WILDCARD, GLOBSTAR_SEGMENT, WILDCARD_SEGMENT;
    var __moduleName = context_78 && context_78.id;
    /**
     * Convert any glob pattern to a JavaScript Regexp object
     * @param glob Glob pattern to convert
     * @param opts Configuration object
     * @returns Converted object with string, segments and RegExp object
     */
    function globrex(glob, { extended = false, globstar = false, strict = false, filepath = false, flags = "", } = {}) {
        const sepPattern = new RegExp(`^${SEP}${strict ? "" : "+"}$`);
        let regex = "";
        let segment = "";
        let pathRegexStr = "";
        const pathSegments = [];
        // If we are doing extended matching, this boolean is true when we are inside
        // a group (eg {*.html,*.js}), and false otherwise.
        let inGroup = false;
        let inRange = false;
        // extglob stack. Keep track of scope
        const ext = [];
        // Helper function to build string and segments
        function add(str, options = { split: false, last: false, only: "" }) {
            const { split, last, only } = options;
            if (only !== "path")
                regex += str;
            if (filepath && only !== "regex") {
                pathRegexStr += str.match(sepPattern) ? SEP : str;
                if (split) {
                    if (last)
                        segment += str;
                    if (segment !== "") {
                        // change it 'includes'
                        if (!flags.includes("g"))
                            segment = `^${segment}$`;
                        pathSegments.push(new RegExp(segment, flags));
                    }
                    segment = "";
                }
                else {
                    segment += str;
                }
            }
        }
        let c, n;
        for (let i = 0; i < glob.length; i++) {
            c = glob[i];
            n = glob[i + 1];
            if (["\\", "$", "^", ".", "="].includes(c)) {
                add(`\\${c}`);
                continue;
            }
            if (c.match(sepPattern)) {
                add(SEP, { split: true });
                if (n != null && n.match(sepPattern) && !strict)
                    regex += "?";
                continue;
            }
            if (c === "(") {
                if (ext.length) {
                    add(`${c}?:`);
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === ")") {
                if (ext.length) {
                    add(c);
                    const type = ext.pop();
                    if (type === "@") {
                        add("{1}");
                    }
                    else if (type === "!") {
                        add(WILDCARD);
                    }
                    else {
                        add(type);
                    }
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "|") {
                if (ext.length) {
                    add(c);
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "+") {
                if (n === "(" && extended) {
                    ext.push(c);
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "@" && extended) {
                if (n === "(") {
                    ext.push(c);
                    continue;
                }
            }
            if (c === "!") {
                if (extended) {
                    if (inRange) {
                        add("^");
                        continue;
                    }
                    if (n === "(") {
                        ext.push(c);
                        add("(?!");
                        i++;
                        continue;
                    }
                    add(`\\${c}`);
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "?") {
                if (extended) {
                    if (n === "(") {
                        ext.push(c);
                    }
                    else {
                        add(".");
                    }
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "[") {
                if (inRange && n === ":") {
                    i++; // skip [
                    let value = "";
                    while (glob[++i] !== ":")
                        value += glob[i];
                    if (value === "alnum")
                        add("(?:\\w|\\d)");
                    else if (value === "space")
                        add("\\s");
                    else if (value === "digit")
                        add("\\d");
                    i++; // skip last ]
                    continue;
                }
                if (extended) {
                    inRange = true;
                    add(c);
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "]") {
                if (extended) {
                    inRange = false;
                    add(c);
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "{") {
                if (extended) {
                    inGroup = true;
                    add("(?:");
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "}") {
                if (extended) {
                    inGroup = false;
                    add(")");
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === ",") {
                if (inGroup) {
                    add("|");
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            if (c === "*") {
                if (n === "(" && extended) {
                    ext.push(c);
                    continue;
                }
                // Move over all consecutive "*"'s.
                // Also store the previous and next characters
                const prevChar = glob[i - 1];
                let starCount = 1;
                while (glob[i + 1] === "*") {
                    starCount++;
                    i++;
                }
                const nextChar = glob[i + 1];
                if (!globstar) {
                    // globstar is disabled, so treat any number of "*" as one
                    add(".*");
                }
                else {
                    // globstar is enabled, so determine if this is a globstar segment
                    const isGlobstar = starCount > 1 && // multiple "*"'s
                        // from the start of the segment
                        [SEP_RAW, "/", undefined].includes(prevChar) &&
                        // to the end of the segment
                        [SEP_RAW, "/", undefined].includes(nextChar);
                    if (isGlobstar) {
                        // it's a globstar, so match zero or more path segments
                        add(GLOBSTAR, { only: "regex" });
                        add(GLOBSTAR_SEGMENT, { only: "path", last: true, split: true });
                        i++; // move over the "/"
                    }
                    else {
                        // it's not a globstar, so only match one path segment
                        add(WILDCARD, { only: "regex" });
                        add(WILDCARD_SEGMENT, { only: "path" });
                    }
                }
                continue;
            }
            add(c);
        }
        // When regexp 'g' flag is specified don't
        // constrain the regular expression with ^ & $
        if (!flags.includes("g")) {
            regex = `^${regex}$`;
            segment = `^${segment}$`;
            if (filepath)
                pathRegexStr = `^${pathRegexStr}$`;
        }
        const result = { regex: new RegExp(regex, flags) };
        // Push the last segment
        if (filepath) {
            pathSegments.push(new RegExp(segment, flags));
            result.path = {
                regex: new RegExp(pathRegexStr, flags),
                segments: pathSegments,
                globstar: new RegExp(!flags.includes("g") ? `^${GLOBSTAR_SEGMENT}$` : GLOBSTAR_SEGMENT, flags),
            };
        }
        return result;
    }
    exports_78("globrex", globrex);
    return {
        setters: [],
        execute: function () {
            isWin = Deno.build.os === "windows";
            SEP = isWin ? `(?:\\\\|\\/)` : `\\/`;
            SEP_ESC = isWin ? `\\\\` : `/`;
            SEP_RAW = isWin ? `\\` : `/`;
            GLOBSTAR = `(?:(?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
            WILDCARD = `(?:[^${SEP_ESC}/]*)`;
            GLOBSTAR_SEGMENT = `((?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
            WILDCARD_SEGMENT = `(?:[^${SEP_ESC}/]*)`;
        }
    };
});
System.register("https://deno.land/std@0.51.0/path/glob", ["https://deno.land/std@0.51.0/path/separator", "https://deno.land/std@0.51.0/path/_globrex", "https://deno.land/std@0.51.0/path/mod", "https://deno.land/std@0.51.0/testing/asserts"], function (exports_79, context_79) {
    "use strict";
    var separator_ts_2, _globrex_ts_1, mod_ts_9, asserts_ts_6;
    var __moduleName = context_79 && context_79.id;
    /**
     * Generate a regex based on glob pattern and options
     * This was meant to be using the the `fs.walk` function
     * but can be used anywhere else.
     * Examples:
     *
     *     Looking for all the `ts` files:
     *     walkSync(".", {
     *       match: [globToRegExp("*.ts")]
     *     })
     *
     *     Looking for all the `.json` files in any subfolder:
     *     walkSync(".", {
     *       match: [globToRegExp(join("a", "**", "*.json"),{
     *         flags: "g",
     *         extended: true,
     *         globstar: true
     *       })]
     *     })
     *
     * @param glob - Glob pattern to be used
     * @param options - Specific options for the glob pattern
     * @returns A RegExp for the glob pattern
     */
    function globToRegExp(glob, { extended = false, globstar = true } = {}) {
        const result = _globrex_ts_1.globrex(glob, {
            extended,
            globstar,
            strict: false,
            filepath: true,
        });
        asserts_ts_6.assert(result.path != null);
        return result.path.regex;
    }
    exports_79("globToRegExp", globToRegExp);
    /** Test whether the given string is a glob */
    function isGlob(str) {
        const chars = { "{": "}", "(": ")", "[": "]" };
        /* eslint-disable-next-line max-len */
        const regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
        if (str === "") {
            return false;
        }
        let match;
        while ((match = regex.exec(str))) {
            if (match[2])
                return true;
            let idx = match.index + match[0].length;
            // if an open bracket/brace/paren is escaped,
            // set the index to the next closing character
            const open = match[1];
            const close = open ? chars[open] : null;
            if (open && close) {
                const n = str.indexOf(close, idx);
                if (n !== -1) {
                    idx = n + 1;
                }
            }
            str = str.slice(idx);
        }
        return false;
    }
    exports_79("isGlob", isGlob);
    /** Like normalize(), but doesn't collapse "**\/.." when `globstar` is true. */
    function normalizeGlob(glob, { globstar = false } = {}) {
        if (!!glob.match(/\0/g)) {
            throw new Error(`Glob contains invalid characters: "${glob}"`);
        }
        if (!globstar) {
            return mod_ts_9.normalize(glob);
        }
        const s = separator_ts_2.SEP_PATTERN.source;
        const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
        return mod_ts_9.normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
    }
    exports_79("normalizeGlob", normalizeGlob);
    /** Like join(), but doesn't collapse "**\/.." when `globstar` is true. */
    function joinGlobs(globs, { extended = false, globstar = false } = {}) {
        if (!globstar || globs.length == 0) {
            return mod_ts_9.join(...globs);
        }
        if (globs.length === 0)
            return ".";
        let joined;
        for (const glob of globs) {
            const path = glob;
            if (path.length > 0) {
                if (!joined)
                    joined = path;
                else
                    joined += `${separator_ts_2.SEP}${path}`;
            }
        }
        if (!joined)
            return ".";
        return normalizeGlob(joined, { extended, globstar });
    }
    exports_79("joinGlobs", joinGlobs);
    return {
        setters: [
            function (separator_ts_2_1) {
                separator_ts_2 = separator_ts_2_1;
            },
            function (_globrex_ts_1_1) {
                _globrex_ts_1 = _globrex_ts_1_1;
            },
            function (mod_ts_9_1) {
                mod_ts_9 = mod_ts_9_1;
            },
            function (asserts_ts_6_1) {
                asserts_ts_6 = asserts_ts_6_1;
            }
        ],
        execute: function () {
        }
    };
});
// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/
System.register("https://deno.land/std@0.51.0/path/mod", ["https://deno.land/std@0.51.0/path/win32", "https://deno.land/std@0.51.0/path/posix", "https://deno.land/std@0.51.0/path/common", "https://deno.land/std@0.51.0/path/separator", "https://deno.land/std@0.51.0/path/interface", "https://deno.land/std@0.51.0/path/glob"], function (exports_80, context_80) {
    "use strict";
    var _win32, _posix, isWindows, path, win32, posix, basename, delimiter, dirname, extname, format, fromFileUrl, isAbsolute, join, normalize, parse, relative, resolve, sep, toNamespacedPath;
    var __moduleName = context_80 && context_80.id;
    var exportedNames_2 = {
        "win32": true,
        "posix": true,
        "basename": true,
        "delimiter": true,
        "dirname": true,
        "extname": true,
        "format": true,
        "fromFileUrl": true,
        "isAbsolute": true,
        "join": true,
        "normalize": true,
        "parse": true,
        "relative": true,
        "resolve": true,
        "sep": true,
        "toNamespacedPath": true,
        "SEP": true,
        "SEP_PATTERN": true
    };
    function exportStar_3(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_2.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_80(exports);
    }
    return {
        setters: [
            function (_win32_1) {
                _win32 = _win32_1;
            },
            function (_posix_1) {
                _posix = _posix_1;
            },
            function (common_ts_1_1) {
                exportStar_3(common_ts_1_1);
            },
            function (separator_ts_3_1) {
                exports_80({
                    "SEP": separator_ts_3_1["SEP"],
                    "SEP_PATTERN": separator_ts_3_1["SEP_PATTERN"]
                });
            },
            function (interface_ts_1_1) {
                exportStar_3(interface_ts_1_1);
            },
            function (glob_ts_1_1) {
                exportStar_3(glob_ts_1_1);
            }
        ],
        execute: function () {
            isWindows = Deno.build.os == "windows";
            path = isWindows ? _win32 : _posix;
            exports_80("win32", win32 = _win32);
            exports_80("posix", posix = _posix);
            exports_80("basename", basename = path.basename), exports_80("delimiter", delimiter = path.delimiter), exports_80("dirname", dirname = path.dirname), exports_80("extname", extname = path.extname), exports_80("format", format = path.format), exports_80("fromFileUrl", fromFileUrl = path.fromFileUrl), exports_80("isAbsolute", isAbsolute = path.isAbsolute), exports_80("join", join = path.join), exports_80("normalize", normalize = path.normalize), exports_80("parse", parse = path.parse), exports_80("relative", relative = path.relative), exports_80("resolve", resolve = path.resolve), exports_80("sep", sep = path.sep), exports_80("toNamespacedPath", toNamespacedPath = path.toNamespacedPath);
        }
    };
});
System.register("https://deno.land/std@0.51.0/encoding/utf8", [], function (exports_81, context_81) {
    "use strict";
    var encoder, decoder;
    var __moduleName = context_81 && context_81.id;
    /** Shorthand for new TextEncoder().encode() */
    function encode(input) {
        return encoder.encode(input);
    }
    exports_81("encode", encode);
    /** Shorthand for new TextDecoder().decode() */
    function decode(input) {
        return decoder.decode(input);
    }
    exports_81("decode", decode);
    return {
        setters: [],
        execute: function () {
            /** A default TextEncoder instance */
            exports_81("encoder", encoder = new TextEncoder());
            /** A default TextDecoder instance */
            exports_81("decoder", decoder = new TextDecoder());
        }
    };
});
System.register("https://deno.land/std@0.51.0/io/util", ["https://deno.land/std@0.51.0/path/mod", "https://deno.land/std@0.51.0/encoding/utf8"], function (exports_82, context_82) {
    "use strict";
    var Buffer, mkdir, open, path, utf8_ts_2;
    var __moduleName = context_82 && context_82.id;
    /**
     * Copy bytes from one Uint8Array to another.  Bytes from `src` which don't fit
     * into `dst` will not be copied.
     *
     * @param src Source byte array
     * @param dst Destination byte array
     * @param off Offset into `dst` at which to begin writing values from `src`.
     * @return number of bytes copied
     */
    function copyBytes(src, dst, off = 0) {
        off = Math.max(0, Math.min(off, dst.byteLength));
        const dstBytesAvailable = dst.byteLength - off;
        if (src.byteLength > dstBytesAvailable) {
            src = src.subarray(0, dstBytesAvailable);
        }
        dst.set(src, off);
        return src.byteLength;
    }
    exports_82("copyBytes", copyBytes);
    function charCode(s) {
        return s.charCodeAt(0);
    }
    exports_82("charCode", charCode);
    function stringsReader(s) {
        return new Buffer(utf8_ts_2.encode(s).buffer);
    }
    exports_82("stringsReader", stringsReader);
    /** Create or open a temporal file at specified directory with prefix and
     *  postfix
     * */
    async function tempFile(dir, opts = { prefix: "", postfix: "" }) {
        const r = Math.floor(Math.random() * 1000000);
        const filepath = path.resolve(`${dir}/${opts.prefix || ""}${r}${opts.postfix || ""}`);
        await mkdir(path.dirname(filepath), { recursive: true });
        const file = await open(filepath, {
            create: true,
            read: true,
            write: true,
            append: true,
        });
        return { file, filepath };
    }
    exports_82("tempFile", tempFile);
    return {
        setters: [
            function (path_1) {
                path = path_1;
            },
            function (utf8_ts_2_1) {
                utf8_ts_2 = utf8_ts_2_1;
            }
        ],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            Buffer = Deno.Buffer, mkdir = Deno.mkdir, open = Deno.open;
        }
    };
});
// Based on https://github.com/golang/go/blob/891682/src/bufio/bufio.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
System.register("https://deno.land/std@0.51.0/io/bufio", ["https://deno.land/std@0.51.0/io/util", "https://deno.land/std@0.51.0/testing/asserts"], function (exports_83, context_83) {
    "use strict";
    var util_ts_9, asserts_ts_7, DEFAULT_BUF_SIZE, MIN_BUF_SIZE, MAX_CONSECUTIVE_EMPTY_READS, CR, LF, BufferFullError, PartialReadError, BufReader, AbstractBufBase, BufWriter, BufWriterSync;
    var __moduleName = context_83 && context_83.id;
    /** Generate longest proper prefix which is also suffix array. */
    function createLPS(pat) {
        const lps = new Uint8Array(pat.length);
        lps[0] = 0;
        let prefixEnd = 0;
        let i = 1;
        while (i < lps.length) {
            if (pat[i] == pat[prefixEnd]) {
                prefixEnd++;
                lps[i] = prefixEnd;
                i++;
            }
            else if (prefixEnd === 0) {
                lps[i] = 0;
                i++;
            }
            else {
                prefixEnd = pat[prefixEnd - 1];
            }
        }
        return lps;
    }
    /** Read delimited bytes from a Reader. */
    async function* readDelim(reader, delim) {
        // Avoid unicode problems
        const delimLen = delim.length;
        const delimLPS = createLPS(delim);
        let inputBuffer = new Deno.Buffer();
        const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
        // Modified KMP
        let inspectIndex = 0;
        let matchIndex = 0;
        while (true) {
            const result = await reader.read(inspectArr);
            if (result === null) {
                // Yield last chunk.
                yield inputBuffer.bytes();
                return;
            }
            if (result < 0) {
                // Discard all remaining and silently fail.
                return;
            }
            const sliceRead = inspectArr.subarray(0, result);
            await Deno.writeAll(inputBuffer, sliceRead);
            let sliceToProcess = inputBuffer.bytes();
            while (inspectIndex < sliceToProcess.length) {
                if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
                    inspectIndex++;
                    matchIndex++;
                    if (matchIndex === delimLen) {
                        // Full match
                        const matchEnd = inspectIndex - delimLen;
                        const readyBytes = sliceToProcess.subarray(0, matchEnd);
                        // Copy
                        const pendingBytes = sliceToProcess.slice(inspectIndex);
                        yield readyBytes;
                        // Reset match, different from KMP.
                        sliceToProcess = pendingBytes;
                        inspectIndex = 0;
                        matchIndex = 0;
                    }
                }
                else {
                    if (matchIndex === 0) {
                        inspectIndex++;
                    }
                    else {
                        matchIndex = delimLPS[matchIndex - 1];
                    }
                }
            }
            // Keep inspectIndex and matchIndex.
            inputBuffer = new Deno.Buffer(sliceToProcess);
        }
    }
    exports_83("readDelim", readDelim);
    /** Read delimited strings from a Reader. */
    async function* readStringDelim(reader, delim) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        for await (const chunk of readDelim(reader, encoder.encode(delim))) {
            yield decoder.decode(chunk);
        }
    }
    exports_83("readStringDelim", readStringDelim);
    /** Read strings line-by-line from a Reader. */
    // eslint-disable-next-line require-await
    async function* readLines(reader) {
        yield* readStringDelim(reader, "\n");
    }
    exports_83("readLines", readLines);
    return {
        setters: [
            function (util_ts_9_1) {
                util_ts_9 = util_ts_9_1;
            },
            function (asserts_ts_7_1) {
                asserts_ts_7 = asserts_ts_7_1;
            }
        ],
        execute: function () {
            DEFAULT_BUF_SIZE = 4096;
            MIN_BUF_SIZE = 16;
            MAX_CONSECUTIVE_EMPTY_READS = 100;
            CR = util_ts_9.charCode("\r");
            LF = util_ts_9.charCode("\n");
            BufferFullError = class BufferFullError extends Error {
                constructor(partial) {
                    super("Buffer full");
                    this.partial = partial;
                    this.name = "BufferFullError";
                }
            };
            exports_83("BufferFullError", BufferFullError);
            PartialReadError = class PartialReadError extends Deno.errors.UnexpectedEof {
                constructor() {
                    super("Encountered UnexpectedEof, data only partially read");
                    this.name = "PartialReadError";
                }
            };
            exports_83("PartialReadError", PartialReadError);
            /** BufReader implements buffering for a Reader object. */
            BufReader = class BufReader {
                constructor(rd, size = DEFAULT_BUF_SIZE) {
                    this.r = 0; // buf read position.
                    this.w = 0; // buf write position.
                    this.eof = false;
                    if (size < MIN_BUF_SIZE) {
                        size = MIN_BUF_SIZE;
                    }
                    this._reset(new Uint8Array(size), rd);
                }
                // private lastByte: number;
                // private lastCharSize: number;
                /** return new BufReader unless r is BufReader */
                static create(r, size = DEFAULT_BUF_SIZE) {
                    return r instanceof BufReader ? r : new BufReader(r, size);
                }
                /** Returns the size of the underlying buffer in bytes. */
                size() {
                    return this.buf.byteLength;
                }
                buffered() {
                    return this.w - this.r;
                }
                // Reads a new chunk into the buffer.
                async _fill() {
                    // Slide existing data to beginning.
                    if (this.r > 0) {
                        this.buf.copyWithin(0, this.r, this.w);
                        this.w -= this.r;
                        this.r = 0;
                    }
                    if (this.w >= this.buf.byteLength) {
                        throw Error("bufio: tried to fill full buffer");
                    }
                    // Read new data: try a limited number of times.
                    for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
                        const rr = await this.rd.read(this.buf.subarray(this.w));
                        if (rr === null) {
                            this.eof = true;
                            return;
                        }
                        asserts_ts_7.assert(rr >= 0, "negative read");
                        this.w += rr;
                        if (rr > 0) {
                            return;
                        }
                    }
                    throw new Error(`No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`);
                }
                /** Discards any buffered data, resets all state, and switches
                 * the buffered reader to read from r.
                 */
                reset(r) {
                    this._reset(this.buf, r);
                }
                _reset(buf, rd) {
                    this.buf = buf;
                    this.rd = rd;
                    this.eof = false;
                    // this.lastByte = -1;
                    // this.lastCharSize = -1;
                }
                /** reads data into p.
                 * It returns the number of bytes read into p.
                 * The bytes are taken from at most one Read on the underlying Reader,
                 * hence n may be less than len(p).
                 * To read exactly len(p) bytes, use io.ReadFull(b, p).
                 */
                async read(p) {
                    let rr = p.byteLength;
                    if (p.byteLength === 0)
                        return rr;
                    if (this.r === this.w) {
                        if (p.byteLength >= this.buf.byteLength) {
                            // Large read, empty buffer.
                            // Read directly into p to avoid copy.
                            const rr = await this.rd.read(p);
                            const nread = rr ?? 0;
                            asserts_ts_7.assert(nread >= 0, "negative read");
                            // if (rr.nread > 0) {
                            //   this.lastByte = p[rr.nread - 1];
                            //   this.lastCharSize = -1;
                            // }
                            return rr;
                        }
                        // One read.
                        // Do not use this.fill, which will loop.
                        this.r = 0;
                        this.w = 0;
                        rr = await this.rd.read(this.buf);
                        if (rr === 0 || rr === null)
                            return rr;
                        asserts_ts_7.assert(rr >= 0, "negative read");
                        this.w += rr;
                    }
                    // copy as much as we can
                    const copied = util_ts_9.copyBytes(this.buf.subarray(this.r, this.w), p, 0);
                    this.r += copied;
                    // this.lastByte = this.buf[this.r - 1];
                    // this.lastCharSize = -1;
                    return copied;
                }
                /** reads exactly `p.length` bytes into `p`.
                 *
                 * If successful, `p` is returned.
                 *
                 * If the end of the underlying stream has been reached, and there are no more
                 * bytes available in the buffer, `readFull()` returns `null` instead.
                 *
                 * An error is thrown if some bytes could be read, but not enough to fill `p`
                 * entirely before the underlying stream reported an error or EOF. Any error
                 * thrown will have a `partial` property that indicates the slice of the
                 * buffer that has been successfully filled with data.
                 *
                 * Ported from https://golang.org/pkg/io/#ReadFull
                 */
                async readFull(p) {
                    let bytesRead = 0;
                    while (bytesRead < p.length) {
                        try {
                            const rr = await this.read(p.subarray(bytesRead));
                            if (rr === null) {
                                if (bytesRead === 0) {
                                    return null;
                                }
                                else {
                                    throw new PartialReadError();
                                }
                            }
                            bytesRead += rr;
                        }
                        catch (err) {
                            err.partial = p.subarray(0, bytesRead);
                            throw err;
                        }
                    }
                    return p;
                }
                /** Returns the next byte [0, 255] or `null`. */
                async readByte() {
                    while (this.r === this.w) {
                        if (this.eof)
                            return null;
                        await this._fill(); // buffer is empty.
                    }
                    const c = this.buf[this.r];
                    this.r++;
                    // this.lastByte = c;
                    return c;
                }
                /** readString() reads until the first occurrence of delim in the input,
                 * returning a string containing the data up to and including the delimiter.
                 * If ReadString encounters an error before finding a delimiter,
                 * it returns the data read before the error and the error itself
                 * (often `null`).
                 * ReadString returns err != nil if and only if the returned data does not end
                 * in delim.
                 * For simple uses, a Scanner may be more convenient.
                 */
                async readString(delim) {
                    if (delim.length !== 1) {
                        throw new Error("Delimiter should be a single character");
                    }
                    const buffer = await this.readSlice(delim.charCodeAt(0));
                    if (buffer === null)
                        return null;
                    return new TextDecoder().decode(buffer);
                }
                /** `readLine()` is a low-level line-reading primitive. Most callers should
                 * use `readString('\n')` instead or use a Scanner.
                 *
                 * `readLine()` tries to return a single line, not including the end-of-line
                 * bytes. If the line was too long for the buffer then `more` is set and the
                 * beginning of the line is returned. The rest of the line will be returned
                 * from future calls. `more` will be false when returning the last fragment
                 * of the line. The returned buffer is only valid until the next call to
                 * `readLine()`.
                 *
                 * The text returned from ReadLine does not include the line end ("\r\n" or
                 * "\n").
                 *
                 * When the end of the underlying stream is reached, the final bytes in the
                 * stream are returned. No indication or error is given if the input ends
                 * without a final line end. When there are no more trailing bytes to read,
                 * `readLine()` returns `null`.
                 *
                 * Calling `unreadByte()` after `readLine()` will always unread the last byte
                 * read (possibly a character belonging to the line end) even if that byte is
                 * not part of the line returned by `readLine()`.
                 */
                async readLine() {
                    let line;
                    try {
                        line = await this.readSlice(LF);
                    }
                    catch (err) {
                        let { partial } = err;
                        asserts_ts_7.assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
                        // Don't throw if `readSlice()` failed with `BufferFullError`, instead we
                        // just return whatever is available and set the `more` flag.
                        if (!(err instanceof BufferFullError)) {
                            throw err;
                        }
                        // Handle the case where "\r\n" straddles the buffer.
                        if (!this.eof &&
                            partial.byteLength > 0 &&
                            partial[partial.byteLength - 1] === CR) {
                            // Put the '\r' back on buf and drop it from line.
                            // Let the next call to ReadLine check for "\r\n".
                            asserts_ts_7.assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                            this.r--;
                            partial = partial.subarray(0, partial.byteLength - 1);
                        }
                        return { line: partial, more: !this.eof };
                    }
                    if (line === null) {
                        return null;
                    }
                    if (line.byteLength === 0) {
                        return { line, more: false };
                    }
                    if (line[line.byteLength - 1] == LF) {
                        let drop = 1;
                        if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                            drop = 2;
                        }
                        line = line.subarray(0, line.byteLength - drop);
                    }
                    return { line, more: false };
                }
                /** `readSlice()` reads until the first occurrence of `delim` in the input,
                 * returning a slice pointing at the bytes in the buffer. The bytes stop
                 * being valid at the next read.
                 *
                 * If `readSlice()` encounters an error before finding a delimiter, or the
                 * buffer fills without finding a delimiter, it throws an error with a
                 * `partial` property that contains the entire buffer.
                 *
                 * If `readSlice()` encounters the end of the underlying stream and there are
                 * any bytes left in the buffer, the rest of the buffer is returned. In other
                 * words, EOF is always treated as a delimiter. Once the buffer is empty,
                 * it returns `null`.
                 *
                 * Because the data returned from `readSlice()` will be overwritten by the
                 * next I/O operation, most clients should use `readString()` instead.
                 */
                async readSlice(delim) {
                    let s = 0; // search start index
                    let slice;
                    while (true) {
                        // Search buffer.
                        let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
                        if (i >= 0) {
                            i += s;
                            slice = this.buf.subarray(this.r, this.r + i + 1);
                            this.r += i + 1;
                            break;
                        }
                        // EOF?
                        if (this.eof) {
                            if (this.r === this.w) {
                                return null;
                            }
                            slice = this.buf.subarray(this.r, this.w);
                            this.r = this.w;
                            break;
                        }
                        // Buffer full?
                        if (this.buffered() >= this.buf.byteLength) {
                            this.r = this.w;
                            throw new BufferFullError(this.buf);
                        }
                        s = this.w - this.r; // do not rescan area we scanned before
                        // Buffer is not full.
                        try {
                            await this._fill();
                        }
                        catch (err) {
                            err.partial = slice;
                            throw err;
                        }
                    }
                    // Handle last byte, if any.
                    // const i = slice.byteLength - 1;
                    // if (i >= 0) {
                    //   this.lastByte = slice[i];
                    //   this.lastCharSize = -1
                    // }
                    return slice;
                }
                /** `peek()` returns the next `n` bytes without advancing the reader. The
                 * bytes stop being valid at the next read call.
                 *
                 * When the end of the underlying stream is reached, but there are unread
                 * bytes left in the buffer, those bytes are returned. If there are no bytes
                 * left in the buffer, it returns `null`.
                 *
                 * If an error is encountered before `n` bytes are available, `peek()` throws
                 * an error with the `partial` property set to a slice of the buffer that
                 * contains the bytes that were available before the error occurred.
                 */
                async peek(n) {
                    if (n < 0) {
                        throw Error("negative count");
                    }
                    let avail = this.w - this.r;
                    while (avail < n && avail < this.buf.byteLength && !this.eof) {
                        try {
                            await this._fill();
                        }
                        catch (err) {
                            err.partial = this.buf.subarray(this.r, this.w);
                            throw err;
                        }
                        avail = this.w - this.r;
                    }
                    if (avail === 0 && this.eof) {
                        return null;
                    }
                    else if (avail < n && this.eof) {
                        return this.buf.subarray(this.r, this.r + avail);
                    }
                    else if (avail < n) {
                        throw new BufferFullError(this.buf.subarray(this.r, this.w));
                    }
                    return this.buf.subarray(this.r, this.r + n);
                }
            };
            exports_83("BufReader", BufReader);
            AbstractBufBase = class AbstractBufBase {
                constructor() {
                    this.usedBufferBytes = 0;
                    this.err = null;
                }
                /** Size returns the size of the underlying buffer in bytes. */
                size() {
                    return this.buf.byteLength;
                }
                /** Returns how many bytes are unused in the buffer. */
                available() {
                    return this.buf.byteLength - this.usedBufferBytes;
                }
                /** buffered returns the number of bytes that have been written into the
                 * current buffer.
                 */
                buffered() {
                    return this.usedBufferBytes;
                }
                checkBytesWritten(numBytesWritten) {
                    if (numBytesWritten < this.usedBufferBytes) {
                        if (numBytesWritten > 0) {
                            this.buf.copyWithin(0, numBytesWritten, this.usedBufferBytes);
                            this.usedBufferBytes -= numBytesWritten;
                        }
                        this.err = new Error("Short write");
                        throw this.err;
                    }
                }
            };
            /** BufWriter implements buffering for an deno.Writer object.
             * If an error occurs writing to a Writer, no more data will be
             * accepted and all subsequent writes, and flush(), will return the error.
             * After all data has been written, the client should call the
             * flush() method to guarantee all data has been forwarded to
             * the underlying deno.Writer.
             */
            BufWriter = class BufWriter extends AbstractBufBase {
                constructor(writer, size = DEFAULT_BUF_SIZE) {
                    super();
                    this.writer = writer;
                    if (size <= 0) {
                        size = DEFAULT_BUF_SIZE;
                    }
                    this.buf = new Uint8Array(size);
                }
                /** return new BufWriter unless writer is BufWriter */
                static create(writer, size = DEFAULT_BUF_SIZE) {
                    return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
                }
                /** Discards any unflushed buffered data, clears any error, and
                 * resets buffer to write its output to w.
                 */
                reset(w) {
                    this.err = null;
                    this.usedBufferBytes = 0;
                    this.writer = w;
                }
                /** Flush writes any buffered data to the underlying io.Writer. */
                async flush() {
                    if (this.err !== null)
                        throw this.err;
                    if (this.usedBufferBytes === 0)
                        return;
                    let numBytesWritten = 0;
                    try {
                        numBytesWritten = await this.writer.write(this.buf.subarray(0, this.usedBufferBytes));
                    }
                    catch (e) {
                        this.err = e;
                        throw e;
                    }
                    this.checkBytesWritten(numBytesWritten);
                    this.usedBufferBytes = 0;
                }
                /** Writes the contents of `data` into the buffer.  If the contents won't fully
                 * fit into the buffer, those bytes that can are copied into the buffer, the
                 * buffer is the flushed to the writer and the remaining bytes are copied into
                 * the now empty buffer.
                 *
                 * @return the number of bytes written to the buffer.
                 */
                async write(data) {
                    if (this.err !== null)
                        throw this.err;
                    if (data.length === 0)
                        return 0;
                    let totalBytesWritten = 0;
                    let numBytesWritten = 0;
                    while (data.byteLength > this.available()) {
                        if (this.buffered() === 0) {
                            // Large write, empty buffer.
                            // Write directly from data to avoid copy.
                            try {
                                numBytesWritten = await this.writer.write(data);
                            }
                            catch (e) {
                                this.err = e;
                                throw e;
                            }
                        }
                        else {
                            numBytesWritten = util_ts_9.copyBytes(data, this.buf, this.usedBufferBytes);
                            this.usedBufferBytes += numBytesWritten;
                            await this.flush();
                        }
                        totalBytesWritten += numBytesWritten;
                        data = data.subarray(numBytesWritten);
                    }
                    numBytesWritten = util_ts_9.copyBytes(data, this.buf, this.usedBufferBytes);
                    this.usedBufferBytes += numBytesWritten;
                    totalBytesWritten += numBytesWritten;
                    return totalBytesWritten;
                }
            };
            exports_83("BufWriter", BufWriter);
            /** BufWriterSync implements buffering for a deno.WriterSync object.
             * If an error occurs writing to a WriterSync, no more data will be
             * accepted and all subsequent writes, and flush(), will return the error.
             * After all data has been written, the client should call the
             * flush() method to guarantee all data has been forwarded to
             * the underlying deno.WriterSync.
             */
            BufWriterSync = class BufWriterSync extends AbstractBufBase {
                constructor(writer, size = DEFAULT_BUF_SIZE) {
                    super();
                    this.writer = writer;
                    if (size <= 0) {
                        size = DEFAULT_BUF_SIZE;
                    }
                    this.buf = new Uint8Array(size);
                }
                /** return new BufWriterSync unless writer is BufWriterSync */
                static create(writer, size = DEFAULT_BUF_SIZE) {
                    return writer instanceof BufWriterSync
                        ? writer
                        : new BufWriterSync(writer, size);
                }
                /** Discards any unflushed buffered data, clears any error, and
                 * resets buffer to write its output to w.
                 */
                reset(w) {
                    this.err = null;
                    this.usedBufferBytes = 0;
                    this.writer = w;
                }
                /** Flush writes any buffered data to the underlying io.WriterSync. */
                flush() {
                    if (this.err !== null)
                        throw this.err;
                    if (this.usedBufferBytes === 0)
                        return;
                    let numBytesWritten = 0;
                    try {
                        numBytesWritten = this.writer.writeSync(this.buf.subarray(0, this.usedBufferBytes));
                    }
                    catch (e) {
                        this.err = e;
                        throw e;
                    }
                    this.checkBytesWritten(numBytesWritten);
                    this.usedBufferBytes = 0;
                }
                /** Writes the contents of `data` into the buffer.  If the contents won't fully
                 * fit into the buffer, those bytes that can are copied into the buffer, the
                 * buffer is the flushed to the writer and the remaining bytes are copied into
                 * the now empty buffer.
                 *
                 * @return the number of bytes written to the buffer.
                 */
                writeSync(data) {
                    if (this.err !== null)
                        throw this.err;
                    if (data.length === 0)
                        return 0;
                    let totalBytesWritten = 0;
                    let numBytesWritten = 0;
                    while (data.byteLength > this.available()) {
                        if (this.buffered() === 0) {
                            // Large write, empty buffer.
                            // Write directly from data to avoid copy.
                            try {
                                numBytesWritten = this.writer.writeSync(data);
                            }
                            catch (e) {
                                this.err = e;
                                throw e;
                            }
                        }
                        else {
                            numBytesWritten = util_ts_9.copyBytes(data, this.buf, this.usedBufferBytes);
                            this.usedBufferBytes += numBytesWritten;
                            this.flush();
                        }
                        totalBytesWritten += numBytesWritten;
                        data = data.subarray(numBytesWritten);
                    }
                    numBytesWritten = util_ts_9.copyBytes(data, this.buf, this.usedBufferBytes);
                    this.usedBufferBytes += numBytesWritten;
                    totalBytesWritten += numBytesWritten;
                    return totalBytesWritten;
                }
            };
            exports_83("BufWriterSync", BufWriterSync);
        }
    };
});
System.register("https://deno.land/x/ask/src/core/text", ["https://deno.land/x/ask/src/core/prompt", "https://deno.land/std@0.51.0/io/bufio"], function (exports_84, context_84) {
    "use strict";
    var prompt_ts_1, bufio_ts_1, Text;
    var __moduleName = context_84 && context_84.id;
    return {
        setters: [
            function (prompt_ts_1_1) {
                prompt_ts_1 = prompt_ts_1_1;
            },
            function (bufio_ts_1_1) {
                bufio_ts_1 = bufio_ts_1_1;
            }
        ],
        execute: function () {
            Text = class Text extends prompt_ts_1.default {
                constructor(opts) {
                    super(opts);
                }
                getReader() {
                    return new bufio_ts_1.BufReader(this.input);
                }
                async printError(msg) {
                    await this.output.write(new TextEncoder().encode(`\x1b[31m>>\x1b[0m ${msg}\n`));
                }
                async question() {
                    const reader = this.getReader();
                    const prompt = new TextEncoder().encode(this.getPrompt());
                    await this.output.write(prompt);
                    try {
                        const input = await reader.readLine();
                        let result = input?.line && new TextDecoder().decode(input.line);
                        let pass = true;
                        result = result || this.default || result;
                        try {
                            pass = await Promise.resolve(this.validate(result));
                        }
                        catch (e) {
                            pass = false;
                            await this.printError(typeof e === 'string' ? e : e.message);
                        }
                        if (!pass) {
                            return this.question();
                        }
                        return result;
                    }
                    catch (err) {
                        throw err;
                    }
                }
            };
            exports_84("default", Text);
        }
    };
});
System.register("https://deno.land/x/ask/src/input", ["https://deno.land/x/ask/src/core/text"], function (exports_85, context_85) {
    "use strict";
    var text_ts_1, Input;
    var __moduleName = context_85 && context_85.id;
    return {
        setters: [
            function (text_ts_1_1) {
                text_ts_1 = text_ts_1_1;
            }
        ],
        execute: function () {
            Input = class Input extends text_ts_1.default {
                constructor(opts) {
                    super(opts);
                }
                async run() {
                    const result = {};
                    try {
                        const answer = await this.question();
                        result[this.name] = answer;
                        return result;
                    }
                    catch (err) {
                        throw err;
                    }
                }
            };
            exports_85("default", Input);
        }
    };
});
System.register("https://deno.land/x/ask/src/number", ["https://deno.land/x/ask/src/core/text"], function (exports_86, context_86) {
    "use strict";
    var text_ts_2, Number;
    var __moduleName = context_86 && context_86.id;
    return {
        setters: [
            function (text_ts_2_1) {
                text_ts_2 = text_ts_2_1;
            }
        ],
        execute: function () {
            Number = class Number extends text_ts_2.default {
                constructor(opts) {
                    super(opts);
                    this.min = opts.min || -Infinity;
                    this.max = opts.max || Infinity;
                    this.message = this.messageWithRange;
                }
                get messageWithRange() {
                    if (this.min === -Infinity && this.max === Infinity) {
                        return this.message;
                    }
                    if (this.min !== -Infinity && this.max === Infinity) {
                        return this.message + ` (>= ${this.min})`;
                    }
                    if (this.min === -Infinity && this.max !== Infinity) {
                        return this.message + ` (<= ${this.max})`;
                    }
                    return this.message + ` (${this.min}-${this.max})`;
                }
                isInputOk(input) {
                    if (typeof input !== 'number') {
                        return false;
                    }
                    return (input >= this.min && input <= this.max);
                }
                async run() {
                    const result = {};
                    let ok = false;
                    let answer;
                    try {
                        while (!ok) {
                            const rawAnswer = await this.question();
                            answer = rawAnswer && parseInt(rawAnswer, 10);
                            ok = this.isInputOk(answer);
                        }
                        result[this.name] = answer;
                        return result;
                    }
                    catch (err) {
                        throw err;
                    }
                }
            };
            exports_86("default", Number);
        }
    };
});
System.register("https://deno.land/x/ask/src/confirm", ["https://deno.land/x/ask/src/core/text"], function (exports_87, context_87) {
    "use strict";
    var text_ts_3, Confirm;
    var __moduleName = context_87 && context_87.id;
    return {
        setters: [
            function (text_ts_3_1) {
                text_ts_3 = text_ts_3_1;
            }
        ],
        execute: function () {
            Confirm = class Confirm extends text_ts_3.default {
                constructor(opts) {
                    super(opts);
                    this.accept = opts.accept || 'Y';
                    this.deny = opts.deny || 'n';
                    this.message = this.message + ` [${this.accept}/${this.deny}]`;
                }
                async run() {
                    const result = {};
                    try {
                        const answer = await this.question();
                        if (answer?.length === 0) {
                            result[this.name] = true;
                            return result;
                        }
                        result[this.name] = answer?.toLowerCase() === this.accept.toLowerCase();
                        return result;
                    }
                    catch (err) {
                        throw err;
                    }
                }
            };
            exports_87("default", Confirm);
        }
    };
});
System.register("https://deno.land/x/ask/mod", ["https://deno.land/x/ask/src/input", "https://deno.land/x/ask/src/number", "https://deno.land/x/ask/src/confirm"], function (exports_88, context_88) {
    "use strict";
    var input_ts_1, number_ts_1, confirm_ts_1, Ask;
    var __moduleName = context_88 && context_88.id;
    return {
        setters: [
            function (input_ts_1_1) {
                input_ts_1 = input_ts_1_1;
            },
            function (number_ts_1_1) {
                number_ts_1 = number_ts_1_1;
            },
            function (confirm_ts_1_1) {
                confirm_ts_1 = confirm_ts_1_1;
            }
        ],
        execute: function () {
            Ask = class Ask {
                constructor(opts) {
                    this.opts = opts || {};
                }
                mergeOptions(opts) {
                    return { ...this.opts, ...opts };
                }
                async input(opts) {
                    return new input_ts_1.default(this.mergeOptions(opts)).run();
                }
                async number(opts) {
                    return new number_ts_1.default(this.mergeOptions(opts)).run();
                }
                async confirm(opts) {
                    return new confirm_ts_1.default(this.mergeOptions(opts)).run();
                }
                async prompt(questions) {
                    const answers = {};
                    let cache;
                    for (let i = 0; i < questions.length; i++) {
                        cache = questions[i];
                        switch (cache.type) {
                            case 'input':
                                Object.assign(answers, await this.input(cache));
                                break;
                            case 'number':
                                Object.assign(answers, await this.number(cache));
                                break;
                            case 'confirm':
                                Object.assign(answers, await this.confirm(cache));
                                break;
                            default:
                                break;
                        }
                    }
                    return answers;
                }
            };
            exports_88("default", Ask);
        }
    };
});
System.register("https://deno.land/std/encoding/utf8", [], function (exports_89, context_89) {
    "use strict";
    var encoder, decoder;
    var __moduleName = context_89 && context_89.id;
    /** Shorthand for new TextEncoder().encode() */
    function encode(input) {
        return encoder.encode(input);
    }
    exports_89("encode", encode);
    /** Shorthand for new TextDecoder().decode() */
    function decode(input) {
        return decoder.decode(input);
    }
    exports_89("decode", decode);
    return {
        setters: [],
        execute: function () {
            /** A default TextEncoder instance */
            exports_89("encoder", encoder = new TextEncoder());
            /** A default TextDecoder instance */
            exports_89("decoder", decoder = new TextDecoder());
        }
    };
});
System.register("https://deno.land/x/bcrypt/bcrypt/base64", [], function (exports_90, context_90) {
    "use strict";
    var base64_code, index_64;
    var __moduleName = context_90 && context_90.id;
    function encode(d, len) {
        let off = 0;
        let rs = [];
        let c1 = 0;
        let c2 = 0;
        while (off < len) {
            c1 = d[off++] & 0xff;
            rs.push(base64_code[(c1 >> 2) & 0x3f]);
            c1 = (c1 & 0x03) << 4;
            if (off >= len) {
                rs.push(base64_code[c1 & 0x3f]);
                break;
            }
            c2 = d[off++] & 0xff;
            c1 |= (c2 >> 4) & 0x0f;
            rs.push(base64_code[c1 & 0x3f]);
            c1 = (c2 & 0x0f) << 2;
            if (off >= len) {
                rs.push(base64_code[c1 & 0x3f]);
                break;
            }
            c2 = d[off++] & 0xff;
            c1 |= (c2 >> 6) & 0x03;
            rs.push(base64_code[c1 & 0x3f]);
            rs.push(base64_code[c2 & 0x3f]);
        }
        return rs.join("");
    }
    exports_90("encode", encode);
    // x is a single character
    function char64(x) {
        if (x.length > 1) {
            throw new Error("Expected a single character");
        }
        let characterAsciiCode = x.charCodeAt(0);
        if (characterAsciiCode < 0 || characterAsciiCode > index_64.length)
            return -1;
        return index_64[characterAsciiCode];
    }
    function decode(s, maxolen) {
        let rs = [];
        let off = 0;
        let slen = s.length;
        let olen = 0;
        let ret;
        let c1, c2, c3, c4, o;
        if (maxolen <= 0)
            throw new Error("Invalid maxolen");
        while (off < slen - 1 && olen < maxolen) {
            c1 = char64(s.charAt(off++));
            c2 = char64(s.charAt(off++));
            if (c1 === -1 || c2 === -1)
                break;
            o = c1 << 2;
            o |= (c2 & 0x30) >> 4;
            rs.push(o);
            if (++olen >= maxolen || off >= slen)
                break;
            c3 = char64(s.charAt(off++));
            if (c3 === -1)
                break;
            o = (c2 & 0x0f) << 4;
            o |= (c3 & 0x3c) >> 2;
            rs.push(o);
            if (++olen >= maxolen || off >= slen)
                break;
            c4 = char64(s.charAt(off++));
            o = (c3 & 0x03) << 6;
            o |= c4;
            rs.push(o);
            ++olen;
        }
        ret = new Uint8Array(olen);
        for (off = 0; off < olen; off++)
            ret[off] = rs[off];
        return ret;
    }
    exports_90("decode", decode);
    return {
        setters: [],
        execute: function () {
            base64_code = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
            index_64 = new Uint8Array([
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                0,
                1,
                54,
                55,
                56,
                57,
                58,
                59,
                60,
                61,
                62,
                63,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26,
                27,
                -1,
                -1,
                -1,
                -1,
                -1,
                -1,
                28,
                29,
                30,
                31,
                32,
                33,
                34,
                35,
                36,
                37,
                38,
                39,
                40,
                41,
                42,
                43,
                44,
                45,
                46,
                47,
                48,
                49,
                50,
                51,
                52,
                53,
                -1,
                -1,
                -1,
                -1,
                -1,
            ]);
        }
    };
});
System.register("https://deno.land/x/bcrypt/bcrypt/bcrypt", ["https://deno.land/std/encoding/utf8", "https://deno.land/x/bcrypt/bcrypt/base64"], function (exports_91, context_91) {
    "use strict";
    var utf8_ts_3, base64, crypto, GENSALT_DEFAULT_LOG2_ROUNDS, BCRYPT_SALT_LEN, BLOWFISH_NUM_ROUNDS, P_orig, S_orig, bf_crypt_ciphertext, P, S;
    var __moduleName = context_91 && context_91.id;
    function encipher(lr, off) {
        let i = 0;
        let n = 0;
        let l = lr[off];
        let r = lr[off + 1];
        l ^= P[0];
        for (i = 0; i <= BLOWFISH_NUM_ROUNDS - 2;) {
            // Feistel substitution on left word
            n = S[(l >> 24) & 0xff];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[++i];
            // Feistel substitution on right word
            n = S[(r >> 24) & 0xff];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[++i];
        }
        lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
        lr[off + 1] = l;
    }
    function streamtoword(data, offp) {
        let word = 0;
        let off = offp[0];
        for (let i = 0; i < 4; i++) {
            word = (word << 8) | (data[off] & 0xff);
            off = (off + 1) % data.length;
        }
        offp[0] = off;
        return word;
    }
    function init_key() {
        P = P_orig.slice();
        S = S_orig.slice();
    }
    function key(key) {
        let i;
        let koffp = new Int32Array([0]);
        let lr = new Int32Array([0, 0]);
        let plen = P.length, slen = S.length;
        for (i = 0; i < plen; i++)
            P[i] = P[i] ^ streamtoword(key, koffp);
        for (i = 0; i < plen; i += 2) {
            encipher(lr, 0);
            P[i] = lr[0];
            P[i + 1] = lr[1];
        }
        for (i = 0; i < slen; i += 2) {
            encipher(lr, 0);
            S[i] = lr[0];
            S[i + 1] = lr[1];
        }
    }
    function ekskey(data, key) {
        let i = 0;
        let koffp = new Int32Array([0]);
        let doffp = new Int32Array([0]);
        let lr = new Int32Array([0, 0]);
        let plen = P.length, slen = S.length;
        for (i = 0; i < plen; i++)
            P[i] = P[i] ^ streamtoword(key, koffp);
        for (i = 0; i < plen; i += 2) {
            lr[0] ^= streamtoword(data, doffp);
            lr[1] ^= streamtoword(data, doffp);
            encipher(lr, 0);
            P[i] = lr[0];
            P[i + 1] = lr[1];
        }
        for (i = 0; i < slen; i += 2) {
            lr[0] ^= streamtoword(data, doffp);
            lr[1] ^= streamtoword(data, doffp);
            encipher(lr, 0);
            S[i] = lr[0];
            S[i + 1] = lr[1];
        }
    }
    function crypt_raw(password, salt, log_rounds, cdata) {
        let rounds = 0;
        let i = 0;
        let j = 0;
        let clen = cdata.length;
        let ret;
        if (log_rounds < 4 || log_rounds > 30) {
            throw new Error("Bad number of rounds");
        }
        rounds = 1 << log_rounds;
        if (salt.length !== BCRYPT_SALT_LEN)
            throw new Error("Bad salt length");
        init_key();
        ekskey(salt, password);
        for (i = 0; i !== rounds; i++) {
            key(password);
            key(salt);
        }
        for (i = 0; i < 64; i++) {
            for (j = 0; j < clen >> 1; j++)
                encipher(cdata, j << 1);
        }
        ret = new Uint8Array(clen * 4);
        for (i = 0, j = 0; i < clen; i++) {
            ret[j++] = (cdata[i] >> 24) & 0xff;
            ret[j++] = (cdata[i] >> 16) & 0xff;
            ret[j++] = (cdata[i] >> 8) & 0xff;
            ret[j++] = cdata[i] & 0xff;
        }
        return ret;
    }
    function hashpw(password, salt = gensalt()) {
        let real_salt;
        let passwordb;
        let saltb;
        let hashed;
        let minor = "";
        let rounds = 0;
        let off = 0;
        let rs = [];
        if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
            throw new Error("Invalid salt version");
        }
        if (salt.charAt(2) === "$")
            off = 3;
        else {
            minor = salt.charAt(2);
            if ((minor.charCodeAt(0) >= "a".charCodeAt(0) &&
                minor.charCodeAt(0) >= "z".charCodeAt(0)) ||
                salt.charAt(3) !== "$") {
                throw new Error("Invalid salt revision");
            }
            off = 4;
        }
        // Extract number of rounds
        if (salt.charAt(off + 2) > "$")
            throw new Error("Missing salt rounds");
        rounds = parseInt(salt.substring(off, off + 2));
        real_salt = salt.substring(off + 3, off + 25);
        passwordb = utf8_ts_3.encode(password + (minor.charCodeAt(0) >= "a".charCodeAt(0) ? "\u0000" : ""));
        saltb = base64.decode(real_salt, BCRYPT_SALT_LEN);
        hashed = crypt_raw(passwordb, saltb, rounds, bf_crypt_ciphertext.slice());
        rs.push("$2");
        if (minor.charCodeAt(0) >= "a".charCodeAt(0))
            rs.push(minor);
        rs.push("$");
        if (rounds < 10)
            rs.push("0");
        if (rounds > 30) {
            throw new Error("rounds exceeds maximum (30)");
        }
        rs.push(rounds.toString());
        rs.push("$");
        rs.push(base64.encode(saltb, saltb.length));
        rs.push(base64.encode(hashed, bf_crypt_ciphertext.length * 4 - 1));
        return rs.join("");
    }
    exports_91("hashpw", hashpw);
    function gensalt(log_rounds = GENSALT_DEFAULT_LOG2_ROUNDS) {
        let rs = [];
        let rnd = new Uint8Array(BCRYPT_SALT_LEN);
        crypto.getRandomValues(rnd);
        rs.push("$2a$");
        if (log_rounds < 10)
            rs.push("0");
        if (log_rounds > 30) {
            throw new Error("log_rounds exceeds maximum (30)");
        }
        rs.push(log_rounds.toString());
        rs.push("$");
        rs.push(base64.encode(rnd, rnd.length));
        return rs.join("");
    }
    exports_91("gensalt", gensalt);
    function checkpw(plaintext, hashed) {
        let hashed_bytes;
        let try_bytes;
        let try_pw = hashpw(plaintext, hashed);
        hashed_bytes = utf8_ts_3.encode(hashed);
        try_bytes = utf8_ts_3.encode(try_pw);
        if (hashed_bytes.length !== try_bytes.length)
            return false;
        let ret = 0;
        for (let i = 0; i < try_bytes.length; i++) {
            ret |= hashed_bytes[i] ^ try_bytes[i];
        }
        return ret === 0;
    }
    exports_91("checkpw", checkpw);
    return {
        setters: [
            function (utf8_ts_3_1) {
                utf8_ts_3 = utf8_ts_3_1;
            },
            function (base64_1) {
                base64 = base64_1;
            }
        ],
        execute: function () {
            crypto = globalThis.crypto;
            // BCrypt parameters
            GENSALT_DEFAULT_LOG2_ROUNDS = 10;
            BCRYPT_SALT_LEN = 16;
            // Blowfish parameters
            BLOWFISH_NUM_ROUNDS = 16;
            P_orig = new Int32Array([
                0x243f6a88,
                0x85a308d3,
                0x13198a2e,
                0x03707344,
                0xa4093822,
                0x299f31d0,
                0x082efa98,
                0xec4e6c89,
                0x452821e6,
                0x38d01377,
                0xbe5466cf,
                0x34e90c6c,
                0xc0ac29b7,
                0xc97c50dd,
                0x3f84d5b5,
                0xb5470917,
                0x9216d5d9,
                0x8979fb1b,
            ]);
            S_orig = new Int32Array([
                0xd1310ba6,
                0x98dfb5ac,
                0x2ffd72db,
                0xd01adfb7,
                0xb8e1afed,
                0x6a267e96,
                0xba7c9045,
                0xf12c7f99,
                0x24a19947,
                0xb3916cf7,
                0x0801f2e2,
                0x858efc16,
                0x636920d8,
                0x71574e69,
                0xa458fea3,
                0xf4933d7e,
                0x0d95748f,
                0x728eb658,
                0x718bcd58,
                0x82154aee,
                0x7b54a41d,
                0xc25a59b5,
                0x9c30d539,
                0x2af26013,
                0xc5d1b023,
                0x286085f0,
                0xca417918,
                0xb8db38ef,
                0x8e79dcb0,
                0x603a180e,
                0x6c9e0e8b,
                0xb01e8a3e,
                0xd71577c1,
                0xbd314b27,
                0x78af2fda,
                0x55605c60,
                0xe65525f3,
                0xaa55ab94,
                0x57489862,
                0x63e81440,
                0x55ca396a,
                0x2aab10b6,
                0xb4cc5c34,
                0x1141e8ce,
                0xa15486af,
                0x7c72e993,
                0xb3ee1411,
                0x636fbc2a,
                0x2ba9c55d,
                0x741831f6,
                0xce5c3e16,
                0x9b87931e,
                0xafd6ba33,
                0x6c24cf5c,
                0x7a325381,
                0x28958677,
                0x3b8f4898,
                0x6b4bb9af,
                0xc4bfe81b,
                0x66282193,
                0x61d809cc,
                0xfb21a991,
                0x487cac60,
                0x5dec8032,
                0xef845d5d,
                0xe98575b1,
                0xdc262302,
                0xeb651b88,
                0x23893e81,
                0xd396acc5,
                0x0f6d6ff3,
                0x83f44239,
                0x2e0b4482,
                0xa4842004,
                0x69c8f04a,
                0x9e1f9b5e,
                0x21c66842,
                0xf6e96c9a,
                0x670c9c61,
                0xabd388f0,
                0x6a51a0d2,
                0xd8542f68,
                0x960fa728,
                0xab5133a3,
                0x6eef0b6c,
                0x137a3be4,
                0xba3bf050,
                0x7efb2a98,
                0xa1f1651d,
                0x39af0176,
                0x66ca593e,
                0x82430e88,
                0x8cee8619,
                0x456f9fb4,
                0x7d84a5c3,
                0x3b8b5ebe,
                0xe06f75d8,
                0x85c12073,
                0x401a449f,
                0x56c16aa6,
                0x4ed3aa62,
                0x363f7706,
                0x1bfedf72,
                0x429b023d,
                0x37d0d724,
                0xd00a1248,
                0xdb0fead3,
                0x49f1c09b,
                0x075372c9,
                0x80991b7b,
                0x25d479d8,
                0xf6e8def7,
                0xe3fe501a,
                0xb6794c3b,
                0x976ce0bd,
                0x04c006ba,
                0xc1a94fb6,
                0x409f60c4,
                0x5e5c9ec2,
                0x196a2463,
                0x68fb6faf,
                0x3e6c53b5,
                0x1339b2eb,
                0x3b52ec6f,
                0x6dfc511f,
                0x9b30952c,
                0xcc814544,
                0xaf5ebd09,
                0xbee3d004,
                0xde334afd,
                0x660f2807,
                0x192e4bb3,
                0xc0cba857,
                0x45c8740f,
                0xd20b5f39,
                0xb9d3fbdb,
                0x5579c0bd,
                0x1a60320a,
                0xd6a100c6,
                0x402c7279,
                0x679f25fe,
                0xfb1fa3cc,
                0x8ea5e9f8,
                0xdb3222f8,
                0x3c7516df,
                0xfd616b15,
                0x2f501ec8,
                0xad0552ab,
                0x323db5fa,
                0xfd238760,
                0x53317b48,
                0x3e00df82,
                0x9e5c57bb,
                0xca6f8ca0,
                0x1a87562e,
                0xdf1769db,
                0xd542a8f6,
                0x287effc3,
                0xac6732c6,
                0x8c4f5573,
                0x695b27b0,
                0xbbca58c8,
                0xe1ffa35d,
                0xb8f011a0,
                0x10fa3d98,
                0xfd2183b8,
                0x4afcb56c,
                0x2dd1d35b,
                0x9a53e479,
                0xb6f84565,
                0xd28e49bc,
                0x4bfb9790,
                0xe1ddf2da,
                0xa4cb7e33,
                0x62fb1341,
                0xcee4c6e8,
                0xef20cada,
                0x36774c01,
                0xd07e9efe,
                0x2bf11fb4,
                0x95dbda4d,
                0xae909198,
                0xeaad8e71,
                0x6b93d5a0,
                0xd08ed1d0,
                0xafc725e0,
                0x8e3c5b2f,
                0x8e7594b7,
                0x8ff6e2fb,
                0xf2122b64,
                0x8888b812,
                0x900df01c,
                0x4fad5ea0,
                0x688fc31c,
                0xd1cff191,
                0xb3a8c1ad,
                0x2f2f2218,
                0xbe0e1777,
                0xea752dfe,
                0x8b021fa1,
                0xe5a0cc0f,
                0xb56f74e8,
                0x18acf3d6,
                0xce89e299,
                0xb4a84fe0,
                0xfd13e0b7,
                0x7cc43b81,
                0xd2ada8d9,
                0x165fa266,
                0x80957705,
                0x93cc7314,
                0x211a1477,
                0xe6ad2065,
                0x77b5fa86,
                0xc75442f5,
                0xfb9d35cf,
                0xebcdaf0c,
                0x7b3e89a0,
                0xd6411bd3,
                0xae1e7e49,
                0x00250e2d,
                0x2071b35e,
                0x226800bb,
                0x57b8e0af,
                0x2464369b,
                0xf009b91e,
                0x5563911d,
                0x59dfa6aa,
                0x78c14389,
                0xd95a537f,
                0x207d5ba2,
                0x02e5b9c5,
                0x83260376,
                0x6295cfa9,
                0x11c81968,
                0x4e734a41,
                0xb3472dca,
                0x7b14a94a,
                0x1b510052,
                0x9a532915,
                0xd60f573f,
                0xbc9bc6e4,
                0x2b60a476,
                0x81e67400,
                0x08ba6fb5,
                0x571be91f,
                0xf296ec6b,
                0x2a0dd915,
                0xb6636521,
                0xe7b9f9b6,
                0xff34052e,
                0xc5855664,
                0x53b02d5d,
                0xa99f8fa1,
                0x08ba4799,
                0x6e85076a,
                0x4b7a70e9,
                0xb5b32944,
                0xdb75092e,
                0xc4192623,
                0xad6ea6b0,
                0x49a7df7d,
                0x9cee60b8,
                0x8fedb266,
                0xecaa8c71,
                0x699a17ff,
                0x5664526c,
                0xc2b19ee1,
                0x193602a5,
                0x75094c29,
                0xa0591340,
                0xe4183a3e,
                0x3f54989a,
                0x5b429d65,
                0x6b8fe4d6,
                0x99f73fd6,
                0xa1d29c07,
                0xefe830f5,
                0x4d2d38e6,
                0xf0255dc1,
                0x4cdd2086,
                0x8470eb26,
                0x6382e9c6,
                0x021ecc5e,
                0x09686b3f,
                0x3ebaefc9,
                0x3c971814,
                0x6b6a70a1,
                0x687f3584,
                0x52a0e286,
                0xb79c5305,
                0xaa500737,
                0x3e07841c,
                0x7fdeae5c,
                0x8e7d44ec,
                0x5716f2b8,
                0xb03ada37,
                0xf0500c0d,
                0xf01c1f04,
                0x0200b3ff,
                0xae0cf51a,
                0x3cb574b2,
                0x25837a58,
                0xdc0921bd,
                0xd19113f9,
                0x7ca92ff6,
                0x94324773,
                0x22f54701,
                0x3ae5e581,
                0x37c2dadc,
                0xc8b57634,
                0x9af3dda7,
                0xa9446146,
                0x0fd0030e,
                0xecc8c73e,
                0xa4751e41,
                0xe238cd99,
                0x3bea0e2f,
                0x3280bba1,
                0x183eb331,
                0x4e548b38,
                0x4f6db908,
                0x6f420d03,
                0xf60a04bf,
                0x2cb81290,
                0x24977c79,
                0x5679b072,
                0xbcaf89af,
                0xde9a771f,
                0xd9930810,
                0xb38bae12,
                0xdccf3f2e,
                0x5512721f,
                0x2e6b7124,
                0x501adde6,
                0x9f84cd87,
                0x7a584718,
                0x7408da17,
                0xbc9f9abc,
                0xe94b7d8c,
                0xec7aec3a,
                0xdb851dfa,
                0x63094366,
                0xc464c3d2,
                0xef1c1847,
                0x3215d908,
                0xdd433b37,
                0x24c2ba16,
                0x12a14d43,
                0x2a65c451,
                0x50940002,
                0x133ae4dd,
                0x71dff89e,
                0x10314e55,
                0x81ac77d6,
                0x5f11199b,
                0x043556f1,
                0xd7a3c76b,
                0x3c11183b,
                0x5924a509,
                0xf28fe6ed,
                0x97f1fbfa,
                0x9ebabf2c,
                0x1e153c6e,
                0x86e34570,
                0xeae96fb1,
                0x860e5e0a,
                0x5a3e2ab3,
                0x771fe71c,
                0x4e3d06fa,
                0x2965dcb9,
                0x99e71d0f,
                0x803e89d6,
                0x5266c825,
                0x2e4cc978,
                0x9c10b36a,
                0xc6150eba,
                0x94e2ea78,
                0xa5fc3c53,
                0x1e0a2df4,
                0xf2f74ea7,
                0x361d2b3d,
                0x1939260f,
                0x19c27960,
                0x5223a708,
                0xf71312b6,
                0xebadfe6e,
                0xeac31f66,
                0xe3bc4595,
                0xa67bc883,
                0xb17f37d1,
                0x018cff28,
                0xc332ddef,
                0xbe6c5aa5,
                0x65582185,
                0x68ab9802,
                0xeecea50f,
                0xdb2f953b,
                0x2aef7dad,
                0x5b6e2f84,
                0x1521b628,
                0x29076170,
                0xecdd4775,
                0x619f1510,
                0x13cca830,
                0xeb61bd96,
                0x0334fe1e,
                0xaa0363cf,
                0xb5735c90,
                0x4c70a239,
                0xd59e9e0b,
                0xcbaade14,
                0xeecc86bc,
                0x60622ca7,
                0x9cab5cab,
                0xb2f3846e,
                0x648b1eaf,
                0x19bdf0ca,
                0xa02369b9,
                0x655abb50,
                0x40685a32,
                0x3c2ab4b3,
                0x319ee9d5,
                0xc021b8f7,
                0x9b540b19,
                0x875fa099,
                0x95f7997e,
                0x623d7da8,
                0xf837889a,
                0x97e32d77,
                0x11ed935f,
                0x16681281,
                0x0e358829,
                0xc7e61fd6,
                0x96dedfa1,
                0x7858ba99,
                0x57f584a5,
                0x1b227263,
                0x9b83c3ff,
                0x1ac24696,
                0xcdb30aeb,
                0x532e3054,
                0x8fd948e4,
                0x6dbc3128,
                0x58ebf2ef,
                0x34c6ffea,
                0xfe28ed61,
                0xee7c3c73,
                0x5d4a14d9,
                0xe864b7e3,
                0x42105d14,
                0x203e13e0,
                0x45eee2b6,
                0xa3aaabea,
                0xdb6c4f15,
                0xfacb4fd0,
                0xc742f442,
                0xef6abbb5,
                0x654f3b1d,
                0x41cd2105,
                0xd81e799e,
                0x86854dc7,
                0xe44b476a,
                0x3d816250,
                0xcf62a1f2,
                0x5b8d2646,
                0xfc8883a0,
                0xc1c7b6a3,
                0x7f1524c3,
                0x69cb7492,
                0x47848a0b,
                0x5692b285,
                0x095bbf00,
                0xad19489d,
                0x1462b174,
                0x23820e00,
                0x58428d2a,
                0x0c55f5ea,
                0x1dadf43e,
                0x233f7061,
                0x3372f092,
                0x8d937e41,
                0xd65fecf1,
                0x6c223bdb,
                0x7cde3759,
                0xcbee7460,
                0x4085f2a7,
                0xce77326e,
                0xa6078084,
                0x19f8509e,
                0xe8efd855,
                0x61d99735,
                0xa969a7aa,
                0xc50c06c2,
                0x5a04abfc,
                0x800bcadc,
                0x9e447a2e,
                0xc3453484,
                0xfdd56705,
                0x0e1e9ec9,
                0xdb73dbd3,
                0x105588cd,
                0x675fda79,
                0xe3674340,
                0xc5c43465,
                0x713e38d8,
                0x3d28f89e,
                0xf16dff20,
                0x153e21e7,
                0x8fb03d4a,
                0xe6e39f2b,
                0xdb83adf7,
                0xe93d5a68,
                0x948140f7,
                0xf64c261c,
                0x94692934,
                0x411520f7,
                0x7602d4f7,
                0xbcf46b2e,
                0xd4a20068,
                0xd4082471,
                0x3320f46a,
                0x43b7d4b7,
                0x500061af,
                0x1e39f62e,
                0x97244546,
                0x14214f74,
                0xbf8b8840,
                0x4d95fc1d,
                0x96b591af,
                0x70f4ddd3,
                0x66a02f45,
                0xbfbc09ec,
                0x03bd9785,
                0x7fac6dd0,
                0x31cb8504,
                0x96eb27b3,
                0x55fd3941,
                0xda2547e6,
                0xabca0a9a,
                0x28507825,
                0x530429f4,
                0x0a2c86da,
                0xe9b66dfb,
                0x68dc1462,
                0xd7486900,
                0x680ec0a4,
                0x27a18dee,
                0x4f3ffea2,
                0xe887ad8c,
                0xb58ce006,
                0x7af4d6b6,
                0xaace1e7c,
                0xd3375fec,
                0xce78a399,
                0x406b2a42,
                0x20fe9e35,
                0xd9f385b9,
                0xee39d7ab,
                0x3b124e8b,
                0x1dc9faf7,
                0x4b6d1856,
                0x26a36631,
                0xeae397b2,
                0x3a6efa74,
                0xdd5b4332,
                0x6841e7f7,
                0xca7820fb,
                0xfb0af54e,
                0xd8feb397,
                0x454056ac,
                0xba489527,
                0x55533a3a,
                0x20838d87,
                0xfe6ba9b7,
                0xd096954b,
                0x55a867bc,
                0xa1159a58,
                0xcca92963,
                0x99e1db33,
                0xa62a4a56,
                0x3f3125f9,
                0x5ef47e1c,
                0x9029317c,
                0xfdf8e802,
                0x04272f70,
                0x80bb155c,
                0x05282ce3,
                0x95c11548,
                0xe4c66d22,
                0x48c1133f,
                0xc70f86dc,
                0x07f9c9ee,
                0x41041f0f,
                0x404779a4,
                0x5d886e17,
                0x325f51eb,
                0xd59bc0d1,
                0xf2bcc18f,
                0x41113564,
                0x257b7834,
                0x602a9c60,
                0xdff8e8a3,
                0x1f636c1b,
                0x0e12b4c2,
                0x02e1329e,
                0xaf664fd1,
                0xcad18115,
                0x6b2395e0,
                0x333e92e1,
                0x3b240b62,
                0xeebeb922,
                0x85b2a20e,
                0xe6ba0d99,
                0xde720c8c,
                0x2da2f728,
                0xd0127845,
                0x95b794fd,
                0x647d0862,
                0xe7ccf5f0,
                0x5449a36f,
                0x877d48fa,
                0xc39dfd27,
                0xf33e8d1e,
                0x0a476341,
                0x992eff74,
                0x3a6f6eab,
                0xf4f8fd37,
                0xa812dc60,
                0xa1ebddf8,
                0x991be14c,
                0xdb6e6b0d,
                0xc67b5510,
                0x6d672c37,
                0x2765d43b,
                0xdcd0e804,
                0xf1290dc7,
                0xcc00ffa3,
                0xb5390f92,
                0x690fed0b,
                0x667b9ffb,
                0xcedb7d9c,
                0xa091cf0b,
                0xd9155ea3,
                0xbb132f88,
                0x515bad24,
                0x7b9479bf,
                0x763bd6eb,
                0x37392eb3,
                0xcc115979,
                0x8026e297,
                0xf42e312d,
                0x6842ada7,
                0xc66a2b3b,
                0x12754ccc,
                0x782ef11c,
                0x6a124237,
                0xb79251e7,
                0x06a1bbe6,
                0x4bfb6350,
                0x1a6b1018,
                0x11caedfa,
                0x3d25bdd8,
                0xe2e1c3c9,
                0x44421659,
                0x0a121386,
                0xd90cec6e,
                0xd5abea2a,
                0x64af674e,
                0xda86a85f,
                0xbebfe988,
                0x64e4c3fe,
                0x9dbc8057,
                0xf0f7c086,
                0x60787bf8,
                0x6003604d,
                0xd1fd8346,
                0xf6381fb0,
                0x7745ae04,
                0xd736fccc,
                0x83426b33,
                0xf01eab71,
                0xb0804187,
                0x3c005e5f,
                0x77a057be,
                0xbde8ae24,
                0x55464299,
                0xbf582e61,
                0x4e58f48f,
                0xf2ddfda2,
                0xf474ef38,
                0x8789bdc2,
                0x5366f9c3,
                0xc8b38e74,
                0xb475f255,
                0x46fcd9b9,
                0x7aeb2661,
                0x8b1ddf84,
                0x846a0e79,
                0x915f95e2,
                0x466e598e,
                0x20b45770,
                0x8cd55591,
                0xc902de4c,
                0xb90bace1,
                0xbb8205d0,
                0x11a86248,
                0x7574a99e,
                0xb77f19b6,
                0xe0a9dc09,
                0x662d09a1,
                0xc4324633,
                0xe85a1f02,
                0x09f0be8c,
                0x4a99a025,
                0x1d6efe10,
                0x1ab93d1d,
                0x0ba5a4df,
                0xa186f20f,
                0x2868f169,
                0xdcb7da83,
                0x573906fe,
                0xa1e2ce9b,
                0x4fcd7f52,
                0x50115e01,
                0xa70683fa,
                0xa002b5c4,
                0x0de6d027,
                0x9af88c27,
                0x773f8641,
                0xc3604c06,
                0x61a806b5,
                0xf0177a28,
                0xc0f586e0,
                0x006058aa,
                0x30dc7d62,
                0x11e69ed7,
                0x2338ea63,
                0x53c2dd94,
                0xc2c21634,
                0xbbcbee56,
                0x90bcb6de,
                0xebfc7da1,
                0xce591d76,
                0x6f05e409,
                0x4b7c0188,
                0x39720a3d,
                0x7c927c24,
                0x86e3725f,
                0x724d9db9,
                0x1ac15bb4,
                0xd39eb8fc,
                0xed545578,
                0x08fca5b5,
                0xd83d7cd3,
                0x4dad0fc4,
                0x1e50ef5e,
                0xb161e6f8,
                0xa28514d9,
                0x6c51133c,
                0x6fd5c7e7,
                0x56e14ec4,
                0x362abfce,
                0xddc6c837,
                0xd79a3234,
                0x92638212,
                0x670efa8e,
                0x406000e0,
                0x3a39ce37,
                0xd3faf5cf,
                0xabc27737,
                0x5ac52d1b,
                0x5cb0679e,
                0x4fa33742,
                0xd3822740,
                0x99bc9bbe,
                0xd5118e9d,
                0xbf0f7315,
                0xd62d1c7e,
                0xc700c47b,
                0xb78c1b6b,
                0x21a19045,
                0xb26eb1be,
                0x6a366eb4,
                0x5748ab2f,
                0xbc946e79,
                0xc6a376d2,
                0x6549c2c8,
                0x530ff8ee,
                0x468dde7d,
                0xd5730a1d,
                0x4cd04dc6,
                0x2939bbdb,
                0xa9ba4650,
                0xac9526e8,
                0xbe5ee304,
                0xa1fad5f0,
                0x6a2d519a,
                0x63ef8ce2,
                0x9a86ee22,
                0xc089c2b8,
                0x43242ef6,
                0xa51e03aa,
                0x9cf2d0a4,
                0x83c061ba,
                0x9be96a4d,
                0x8fe51550,
                0xba645bd6,
                0x2826a2f9,
                0xa73a3ae1,
                0x4ba99586,
                0xef5562e9,
                0xc72fefd3,
                0xf752f7da,
                0x3f046f69,
                0x77fa0a59,
                0x80e4a915,
                0x87b08601,
                0x9b09e6ad,
                0x3b3ee593,
                0xe990fd5a,
                0x9e34d797,
                0x2cf0b7d9,
                0x022b8b51,
                0x96d5ac3a,
                0x017da67d,
                0xd1cf3ed6,
                0x7c7d2d28,
                0x1f9f25cf,
                0xadf2b89b,
                0x5ad6b472,
                0x5a88f54c,
                0xe029ac71,
                0xe019a5e6,
                0x47b0acfd,
                0xed93fa9b,
                0xe8d3c48d,
                0x283b57cc,
                0xf8d56629,
                0x79132e28,
                0x785f0191,
                0xed756055,
                0xf7960e44,
                0xe3d35e8c,
                0x15056dd4,
                0x88f46dba,
                0x03a16125,
                0x0564f0bd,
                0xc3eb9e15,
                0x3c9057a2,
                0x97271aec,
                0xa93a072a,
                0x1b3f6d9b,
                0x1e6321f5,
                0xf59c66fb,
                0x26dcf319,
                0x7533d928,
                0xb155fdf5,
                0x03563482,
                0x8aba3cbb,
                0x28517711,
                0xc20ad9f8,
                0xabcc5167,
                0xccad925f,
                0x4de81751,
                0x3830dc8e,
                0x379d5862,
                0x9320f991,
                0xea7a90c2,
                0xfb3e7bce,
                0x5121ce64,
                0x774fbe32,
                0xa8b6e37e,
                0xc3293d46,
                0x48de5369,
                0x6413e680,
                0xa2ae0810,
                0xdd6db224,
                0x69852dfd,
                0x09072166,
                0xb39a460a,
                0x6445c0dd,
                0x586cdecf,
                0x1c20c8ae,
                0x5bbef7dd,
                0x1b588d40,
                0xccd2017f,
                0x6bb4e3bb,
                0xdda26a7e,
                0x3a59ff45,
                0x3e350a44,
                0xbcb4cdd5,
                0x72eacea8,
                0xfa6484bb,
                0x8d6612ae,
                0xbf3c6f47,
                0xd29be463,
                0x542f5d9e,
                0xaec2771b,
                0xf64e6370,
                0x740e0d8d,
                0xe75b1357,
                0xf8721671,
                0xaf537d5d,
                0x4040cb08,
                0x4eb4e2cc,
                0x34d2466a,
                0x0115af84,
                0xe1b00428,
                0x95983a1d,
                0x06b89fb4,
                0xce6ea048,
                0x6f3f3b82,
                0x3520ab82,
                0x011a1d4b,
                0x277227f8,
                0x611560b1,
                0xe7933fdc,
                0xbb3a792b,
                0x344525bd,
                0xa08839e1,
                0x51ce794b,
                0x2f32c9b7,
                0xa01fbac9,
                0xe01cc87e,
                0xbcc7d1f6,
                0xcf0111c3,
                0xa1e8aac7,
                0x1a908749,
                0xd44fbd9a,
                0xd0dadecb,
                0xd50ada38,
                0x0339c32a,
                0xc6913667,
                0x8df9317c,
                0xe0b12b4f,
                0xf79e59b7,
                0x43f5bb3a,
                0xf2d519ff,
                0x27d9459c,
                0xbf97222c,
                0x15e6fc2a,
                0x0f91fc71,
                0x9b941525,
                0xfae59361,
                0xceb69ceb,
                0xc2a86459,
                0x12baa8d1,
                0xb6c1075e,
                0xe3056a0c,
                0x10d25065,
                0xcb03a442,
                0xe0ec6e0e,
                0x1698db3b,
                0x4c98a0be,
                0x3278e964,
                0x9f1f9532,
                0xe0d392df,
                0xd3a0342b,
                0x8971f21e,
                0x1b0a7441,
                0x4ba3348c,
                0xc5be7120,
                0xc37632d8,
                0xdf359f8d,
                0x9b992f2e,
                0xe60b6f47,
                0x0fe3f11d,
                0xe54cda54,
                0x1edad891,
                0xce6279cf,
                0xcd3e7e6f,
                0x1618b166,
                0xfd2c1d05,
                0x848fd2c5,
                0xf6fb2299,
                0xf523f357,
                0xa6327623,
                0x93a83531,
                0x56cccd02,
                0xacf08162,
                0x5a75ebb5,
                0x6e163697,
                0x88d273cc,
                0xde966292,
                0x81b949d0,
                0x4c50901b,
                0x71c65614,
                0xe6c6c7bd,
                0x327a140a,
                0x45e1d006,
                0xc3f27b9a,
                0xc9aa53fd,
                0x62a80f00,
                0xbb25bfe2,
                0x35bdd2f6,
                0x71126905,
                0xb2040222,
                0xb6cbcf7c,
                0xcd769c2b,
                0x53113ec0,
                0x1640e3d3,
                0x38abbd60,
                0x2547adf0,
                0xba38209c,
                0xf746ce76,
                0x77afa1c5,
                0x20756060,
                0x85cbfe4e,
                0x8ae88dd8,
                0x7aaaf9b0,
                0x4cf9aa7e,
                0x1948c25c,
                0x02fb8a8c,
                0x01c36ae4,
                0xd6ebe1f9,
                0x90d4f869,
                0xa65cdea0,
                0x3f09252d,
                0xc208e69f,
                0xb74e6132,
                0xce77e25b,
                0x578fdfe3,
                0x3ac372e6,
            ]);
            // bcrypt IV: "OrpheanBeholderScryDoubt". The C implementation calls
            // this "ciphertext", but it is really plaintext or an IV. We keep
            // the name to make code comparison easier.
            bf_crypt_ciphertext = new Int32Array([
                0x4f727068,
                0x65616e42,
                0x65686f6c,
                0x64657253,
                0x63727944,
                0x6f756274,
            ]);
        }
    };
});
System.register("https://deno.land/x/bcrypt/main", ["https://deno.land/x/bcrypt/bcrypt/bcrypt"], function (exports_92, context_92) {
    "use strict";
    var bcrypt;
    var __moduleName = context_92 && context_92.id;
    /**
     * Generate a hash for the plaintext password
     * Requires --allow-net and --unstable flags
     *
     * @export
     * @param {string} plaintext The password to hash
     * @param {(string | undefined)} [salt=undefined] The salt to use when hashing. Recommended to leave this undefined.
     * @returns {Promise<string>} The hashed password
     */
    async function hash(plaintext, salt = undefined) {
        let worker = new Worker(new URL("worker.ts", context_92.meta.url).toString(), { type: "module", deno: true });
        worker.postMessage({
            action: "hash",
            payload: {
                plaintext,
                salt,
            },
        });
        return new Promise((resolve) => {
            worker.onmessage = (event) => {
                resolve(event.data);
                worker.terminate();
            };
        });
    }
    exports_92("hash", hash);
    /**
     * Generates a salt using a number of log rounds
     * Requires --allow-net and --unstable flags
     *
     * @export
     * @param {(number | undefined)} [log_rounds=undefined] Number of log rounds to use. Recommended to leave this undefined.
     * @returns {Promise<string>} The generated salt
     */
    async function genSalt(log_rounds = undefined) {
        let worker = new Worker(new URL("worker.ts", context_92.meta.url).toString(), { type: "module", deno: true });
        worker.postMessage({
            action: "genSalt",
            payload: {
                log_rounds,
            },
        });
        return new Promise((resolve) => {
            worker.onmessage = (event) => {
                resolve(event.data);
                worker.terminate();
            };
        });
    }
    exports_92("genSalt", genSalt);
    /**
     * Check if a plaintext password matches a hash
     * Requires --allow-net and --unstable flags
     *
     * @export
     * @param {string} plaintext The plaintext password to check
     * @param {string} hash The hash to compare to
     * @returns {Promise<boolean>} Whether the password matches the hash
     */
    async function compare(plaintext, hash) {
        let worker = new Worker(new URL("worker.ts", context_92.meta.url).toString(), { type: "module", deno: true });
        worker.postMessage({
            action: "compare",
            payload: {
                plaintext,
                hash,
            },
        });
        return new Promise((resolve) => {
            worker.onmessage = (event) => {
                resolve(event.data);
                worker.terminate();
            };
        });
    }
    exports_92("compare", compare);
    /**
     * Check if a plaintext password matches a hash
     * This function is blocking and computationally expensive but requires no additonal flags.
     * Using the async variant is highly recommended.
     *
     * @export
     * @param {string} plaintext The plaintext password to check
     * @param {string} hash The hash to compare to
     * @returns {boolean} Whether the password matches the hash
     */
    function compareSync(plaintext, hash) {
        try {
            return bcrypt.checkpw(plaintext, hash);
        }
        catch {
            return false;
        }
    }
    exports_92("compareSync", compareSync);
    /**
     * Generates a salt using a number of log rounds
     * This function is blocking and computationally expensive but requires no additonal flags.
     * Using the async variant is highly recommended.
     *
     * @export
     * @param {(number | undefined)} [log_rounds=undefined] Number of log rounds to use. Recommended to leave this undefined.
     * @returns {string} The generated salt
     */
    function genSaltSync(log_rounds = undefined) {
        return bcrypt.gensalt(log_rounds);
    }
    exports_92("genSaltSync", genSaltSync);
    /**
     * Generate a hash for the plaintext password
     * This function is blocking and computationally expensive but requires no additonal flags.
     * Using the async variant is highly recommended.
     *
     * @export
     * @param {string} plaintext The password to hash
     * @param {(string | undefined)} [salt=undefined] The salt to use when hashing. Recommended to leave this undefined.
     * @returns {string} The hashed password
     */
    function hashSync(plaintext, salt = undefined) {
        return bcrypt.hashpw(plaintext, salt);
    }
    exports_92("hashSync", hashSync);
    return {
        setters: [
            function (bcrypt_1) {
                bcrypt = bcrypt_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/bcrypt/mod", ["https://deno.land/x/bcrypt/main"], function (exports_93, context_93) {
    "use strict";
    var __moduleName = context_93 && context_93.id;
    return {
        setters: [
            function (main_ts_1_1) {
                exports_93({
                    "genSalt": main_ts_1_1["genSalt"],
                    "compare": main_ts_1_1["compare"],
                    "hash": main_ts_1_1["hash"],
                    "genSaltSync": main_ts_1_1["genSaltSync"],
                    "compareSync": main_ts_1_1["compareSync"],
                    "hashSync": main_ts_1_1["hashSync"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/nanoid/random", [], function (exports_94, context_94) {
    "use strict";
    var buffers;
    var __moduleName = context_94 && context_94.id;
    return {
        setters: [],
        execute: function () {
            // Storing the buffers should conserve memory. Have to do more benchmarks to test if this is true
            buffers = {};
            exports_94("default", (bytes) => {
                let buf = buffers[bytes];
                if (!buf) {
                    buf = new Uint32Array(bytes);
                    if (bytes <= 255)
                        buffers[bytes] = buf;
                }
                return crypto.getRandomValues(buf);
            });
        }
    };
});
System.register("https://deno.land/x/nanoid/url", [], function (exports_95, context_95) {
    "use strict";
    var i;
    var __moduleName = context_95 && context_95.id;
    return {
        setters: [],
        execute: function () {
            exports_95("default", '_-' + String.fromCharCode(
            // ASCII codes for 0...9
            i = 48, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, 
            // ASCII codes for A...Z
            i += 8, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, 
            // ASCII codes for a...z
            i += 7, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1, i += 1));
        }
    };
});
System.register("https://deno.land/x/nanoid/customRandom", [], function (exports_96, context_96) {
    "use strict";
    var customRandom;
    var __moduleName = context_96 && context_96.id;
    return {
        setters: [],
        execute: function () {
            exports_96("customRandom", customRandom = (random, alphabet, size) => {
                const mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
                const step = -~(1.6 * mask * size / alphabet.length);
                return () => {
                    let id = "";
                    while (true) {
                        const bytes = random(step);
                        let i = step;
                        while (i--) {
                            // If random byte is bigger than alphabet even after bitmask,
                            // we refuse it by `|| ''`.
                            id += alphabet[bytes[i] & mask] || '';
                            if (id.length === +size)
                                return id;
                        }
                    }
                };
            });
            exports_96("default", customRandom);
        }
    };
});
System.register("https://deno.land/x/nanoid/customAlphabet", ["https://deno.land/x/nanoid/random", "https://deno.land/x/nanoid/customRandom"], function (exports_97, context_97) {
    "use strict";
    var random_ts_1, customRandom_ts_1, customAlphabet;
    var __moduleName = context_97 && context_97.id;
    return {
        setters: [
            function (random_ts_1_1) {
                random_ts_1 = random_ts_1_1;
            },
            function (customRandom_ts_1_1) {
                customRandom_ts_1 = customRandom_ts_1_1;
            }
        ],
        execute: function () {
            /**
             * Low-level function to change alphabet and ID size.
             *
             * Alphabet must contain 256 symbols or less. Otherwise, the generator
             * will not be secure.
             *
             * @param {string} alphabet Symbols to be used in ID.
             * @param {number} size The number of symbols in ID.
             *
             * @return {string} Unique ID.
             *
             * @example
             * const generate = require('nanoid/generate')
             * model.id = generate('0123456789абвгдеё', 5) //=> "8ё56а"
             *
             * @name generate
             * @function
             */
            exports_97("customAlphabet", customAlphabet = (alphabet, size) => customRandom_ts_1.default(random_ts_1.default, alphabet, size));
            exports_97("default", customAlphabet);
        }
    };
});
System.register("https://deno.land/x/nanoid/mod", ["https://deno.land/x/nanoid/random", "https://deno.land/x/nanoid/url", "https://deno.land/x/nanoid/customAlphabet", "https://deno.land/x/nanoid/customRandom"], function (exports_98, context_98) {
    "use strict";
    var random_ts_2, url_ts_1, nanoid;
    var __moduleName = context_98 && context_98.id;
    var exportedNames_3 = {
        "nanoid": true
    };
    function exportStar_4(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_3.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_98(exports);
    }
    return {
        setters: [
            function (random_ts_2_1) {
                random_ts_2 = random_ts_2_1;
                exportStar_4(random_ts_2_1);
            },
            function (url_ts_1_1) {
                url_ts_1 = url_ts_1_1;
                exportStar_4(url_ts_1_1);
            },
            function (customAlphabet_ts_1_1) {
                exportStar_4(customAlphabet_ts_1_1);
            },
            function (customRandom_ts_2_1) {
                exportStar_4(customRandom_ts_2_1);
            }
        ],
        execute: function () {
            exports_98("nanoid", nanoid = (size = 21) => {
                let id = "";
                const bytes = random_ts_2.default(size);
                // Compact alternative for `for (var i = 0; i < size; i++)`
                // We can’t use bytes bigger than the alphabet. 63 is 00111111 bitmask.
                // This mask reduces random byte 0-255 to 0-63 values.
                // There is no need in `|| ''` and `* 1.6` hacks in here,
                // because bitmask trim bytes exact to alphabet size.
                while (size--)
                    id += url_ts_1.default[bytes[size] & 63];
                return id;
            });
            exports_98("default", nanoid);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/user/UserModel", ["https://deno.land/x/dso@v1.0.0/mod"], function (exports_99, context_99) {
    "use strict";
    var mod_ts_10, UserModel, userModel;
    var __moduleName = context_99 && context_99.id;
    return {
        setters: [
            function (mod_ts_10_1) {
                mod_ts_10 = mod_ts_10_1;
            }
        ],
        execute: function () {
            UserModel = /** @class */ (() => {
                let UserModel = class UserModel extends mod_ts_10.BaseModel {
                    get modelFields() {
                        return (Reflect.getMetadata("model:fields", this) || []);
                    }
                };
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.INT, primary: true, length: 11, autoIncrement: true }),
                    __metadata("design:type", Number)
                ], UserModel.prototype, "id", void 0);
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.STRING, length: 26, notNull: true }),
                    __metadata("design:type", String)
                ], UserModel.prototype, "hash", void 0);
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.STRING, length: 80, notNull: true }),
                    __metadata("design:type", String)
                ], UserModel.prototype, "username", void 0);
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.STRING, length: 80, notNull: true }),
                    __metadata("design:type", String)
                ], UserModel.prototype, "password", void 0);
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.STRING, length: 80 }),
                    __metadata("design:type", String)
                ], UserModel.prototype, "namespace", void 0);
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.DATE, default: mod_ts_10.Defaults.CURRENT_TIMESTAMP }),
                    __metadata("design:type", String)
                ], UserModel.prototype, "created", void 0);
                __decorate([
                    mod_ts_10.Field({ type: mod_ts_10.FieldType.DATE, default: mod_ts_10.Defaults.CURRENT_TIMESTAMP, autoUpdate: true }),
                    __metadata("design:type", String)
                ], UserModel.prototype, "updated", void 0);
                UserModel = __decorate([
                    mod_ts_10.Model("users")
                ], UserModel);
                return UserModel;
            })();
            exports_99("UserModel", UserModel);
            userModel = mod_ts_10.dso.define(UserModel);
            exports_99("userModel", userModel);
        }
    };
});
System.register("https://deno.land/x/djwt/base64/base64", [], function (exports_100, context_100) {
    "use strict";
    var __moduleName = context_100 && context_100.id;
    function convertBase64ToUint8Array(data) {
        const binString = atob(data);
        const size = binString.length;
        const bytes = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            bytes[i] = binString.charCodeAt(i);
        }
        return bytes;
    }
    exports_100("convertBase64ToUint8Array", convertBase64ToUint8Array);
    // credit: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
    function convertUint8ArrayToBase64(bytes) {
        const base64abc = (() => {
            const abc = [], A = "A".charCodeAt(0), a = "a".charCodeAt(0), n = "0".charCodeAt(0);
            for (let i = 0; i < 26; ++i) {
                abc.push(String.fromCharCode(A + i));
            }
            for (let i = 0; i < 26; ++i) {
                abc.push(String.fromCharCode(a + i));
            }
            for (let i = 0; i < 10; ++i) {
                abc.push(String.fromCharCode(n + i));
            }
            abc.push("+");
            abc.push("/");
            return abc;
        })();
        let result = "", i, l = bytes.length;
        for (i = 2; i < l; i += 3) {
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
            result += base64abc[bytes[i] & 0x3f];
        }
        if (i === l + 1) {
            // 1 octet missing
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[(bytes[i - 2] & 0x03) << 4];
            result += "==";
        }
        if (i === l) {
            // 2 octets missing
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += base64abc[(bytes[i - 1] & 0x0f) << 2];
            result += "=";
        }
        return result;
    }
    exports_100("convertUint8ArrayToBase64", convertUint8ArrayToBase64);
    // ucs-2 string to base64 encoded ascii
    function convertStringToBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    exports_100("convertStringToBase64", convertStringToBase64);
    // base64 encoded ascii to ucs-2 string
    function convertBase64ToString(str) {
        return decodeURIComponent(escape(atob(str)));
    }
    exports_100("convertBase64ToString", convertBase64ToString);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/djwt/base64/base64url", ["https://deno.land/x/djwt/base64/base64"], function (exports_101, context_101) {
    "use strict";
    var base64_ts_1;
    var __moduleName = context_101 && context_101.id;
    function addPaddingToBase64url(base64url) {
        if (base64url.length % 4 === 2)
            return base64url + "==";
        if (base64url.length % 4 === 3)
            return base64url + "=";
        if (base64url.length % 4 === 1)
            throw new TypeError("Illegal base64url string!");
        return base64url;
    }
    exports_101("addPaddingToBase64url", addPaddingToBase64url);
    function convertBase64urlToBase64(base64url) {
        return addPaddingToBase64url(base64url).replace(/\-/g, "+").replace(/_/g, "/");
    }
    exports_101("convertBase64urlToBase64", convertBase64urlToBase64);
    function convertBase64ToBase64url(base64) {
        return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    exports_101("convertBase64ToBase64url", convertBase64ToBase64url);
    function convertBase64urlToUint8Array(base64url) {
        return base64_ts_1.convertBase64ToUint8Array(convertBase64urlToBase64(base64url));
    }
    exports_101("convertBase64urlToUint8Array", convertBase64urlToUint8Array);
    function convertUint8ArrayToBase64url(uint8Array) {
        return convertBase64ToBase64url(base64_ts_1.convertUint8ArrayToBase64(uint8Array));
    }
    exports_101("convertUint8ArrayToBase64url", convertUint8ArrayToBase64url);
    return {
        setters: [
            function (base64_ts_1_1) {
                base64_ts_1 = base64_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
// Ported from Go
// https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std@v0.56.0/encoding/hex", [], function (exports_102, context_102) {
    "use strict";
    var hextable;
    var __moduleName = context_102 && context_102.id;
    function errInvalidByte(byte) {
        return new Error("encoding/hex: invalid byte: " +
            new TextDecoder().decode(new Uint8Array([byte])));
    }
    exports_102("errInvalidByte", errInvalidByte);
    function errLength() {
        return new Error("encoding/hex: odd length hex string");
    }
    exports_102("errLength", errLength);
    // fromHexChar converts a hex character into its value and a success flag.
    function fromHexChar(byte) {
        switch (true) {
            case 48 <= byte && byte <= 57: // '0' <= byte && byte <= '9'
                return [byte - 48, true];
            case 97 <= byte && byte <= 102: // 'a' <= byte && byte <= 'f'
                return [byte - 97 + 10, true];
            case 65 <= byte && byte <= 70: // 'A' <= byte && byte <= 'F'
                return [byte - 65 + 10, true];
        }
        return [0, false];
    }
    /**
     * EncodedLen returns the length of an encoding of n source bytes. Specifically,
     * it returns n * 2.
     * @param n
     */
    function encodedLen(n) {
        return n * 2;
    }
    exports_102("encodedLen", encodedLen);
    /**
     * Encode encodes `src` into `encodedLen(src.length)` bytes of `dst`.
     * As a convenience, it returns the number of bytes written to `dst`
     * but this value is always `encodedLen(src.length)`.
     * Encode implements hexadecimal encoding.
     * @param dst
     * @param src
     */
    function encode(dst, src) {
        const srcLength = encodedLen(src.length);
        if (dst.length !== srcLength) {
            throw new Error("Out of index.");
        }
        for (let i = 0; i < src.length; i++) {
            const v = src[i];
            dst[i * 2] = hextable[v >> 4];
            dst[i * 2 + 1] = hextable[v & 0x0f];
        }
        return srcLength;
    }
    exports_102("encode", encode);
    /**
     * EncodeToString returns the hexadecimal encoding of `src`.
     * @param src
     */
    function encodeToString(src) {
        const dest = new Uint8Array(encodedLen(src.length));
        encode(dest, src);
        return new TextDecoder().decode(dest);
    }
    exports_102("encodeToString", encodeToString);
    /**
     * Decode decodes `src` into `decodedLen(src.length)` bytes
     * returning the actual number of bytes written to `dst`.
     * Decode expects that `src` contains only hexadecimal characters and that `src`
     * has even length.
     * If the input is malformed, Decode returns the number of bytes decoded before
     * the error.
     * @param dst
     * @param src
     */
    function decode(dst, src) {
        let i = 0;
        for (; i < Math.floor(src.length / 2); i++) {
            const [a, aOK] = fromHexChar(src[i * 2]);
            if (!aOK) {
                return [i, errInvalidByte(src[i * 2])];
            }
            const [b, bOK] = fromHexChar(src[i * 2 + 1]);
            if (!bOK) {
                return [i, errInvalidByte(src[i * 2 + 1])];
            }
            dst[i] = (a << 4) | b;
        }
        if (src.length % 2 == 1) {
            // Check for invalid char before reporting bad length,
            // since the invalid char (if present) is an earlier problem.
            const [, ok] = fromHexChar(src[i * 2]);
            if (!ok) {
                return [i, errInvalidByte(src[i * 2])];
            }
            return [i, errLength()];
        }
        return [i, undefined];
    }
    exports_102("decode", decode);
    /**
     * DecodedLen returns the length of a decoding of `x` source bytes.
     * Specifically, it returns `x / 2`.
     * @param x
     */
    function decodedLen(x) {
        return Math.floor(x / 2);
    }
    exports_102("decodedLen", decodedLen);
    /**
     * DecodeString returns the bytes represented by the hexadecimal string `s`.
     * DecodeString expects that src contains only hexadecimal characters and that
     * src has even length.
     * If the input is malformed, DecodeString will throws an error.
     * @param s the `string` need to decode to `Uint8Array`
     */
    function decodeString(s) {
        const src = new TextEncoder().encode(s);
        // We can use the source slice itself as the destination
        // because the decode loop increments by one and then the 'seen' byte is not
        // used anymore.
        const [n, err] = decode(src, src);
        if (err) {
            throw err;
        }
        return src.slice(0, n);
    }
    exports_102("decodeString", decodeString);
    return {
        setters: [],
        execute: function () {
            hextable = new TextEncoder().encode("0123456789abcdef");
        }
    };
});
/*
 * Adapted to deno from:
 *
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
System.register("https://deno.land/std@v0.56.0/hash/sha256", [], function (exports_103, context_103) {
    "use strict";
    var HEX_CHARS, EXTRA, SHIFT, K, blocks, Sha256, HmacSha256;
    var __moduleName = context_103 && context_103.id;
    return {
        setters: [],
        execute: function () {
            HEX_CHARS = "0123456789abcdef".split("");
            EXTRA = [-2147483648, 8388608, 32768, 128];
            SHIFT = [24, 16, 8, 0];
            // prettier-ignore
            // deno-fmt-ignore
            K = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
                0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
                0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
                0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
                0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
                0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
                0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
                0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
                0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
            ];
            blocks = [];
            Sha256 = class Sha256 {
                constructor(is224 = false, sharedMemory = false) {
                    this.#lastByteIndex = 0;
                    this.init(is224, sharedMemory);
                }
                #block;
                #blocks;
                #bytes;
                #finalized;
                #first;
                #h0;
                #h1;
                #h2;
                #h3;
                #h4;
                #h5;
                #h6;
                #h7;
                #hashed;
                #hBytes;
                #is224;
                #lastByteIndex;
                #start;
                init(is224, sharedMemory) {
                    if (sharedMemory) {
                        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
                        this.#blocks = blocks;
                    }
                    else {
                        this.#blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    if (is224) {
                        this.#h0 = 0xc1059ed8;
                        this.#h1 = 0x367cd507;
                        this.#h2 = 0x3070dd17;
                        this.#h3 = 0xf70e5939;
                        this.#h4 = 0xffc00b31;
                        this.#h5 = 0x68581511;
                        this.#h6 = 0x64f98fa7;
                        this.#h7 = 0xbefa4fa4;
                    }
                    else {
                        // 256
                        this.#h0 = 0x6a09e667;
                        this.#h1 = 0xbb67ae85;
                        this.#h2 = 0x3c6ef372;
                        this.#h3 = 0xa54ff53a;
                        this.#h4 = 0x510e527f;
                        this.#h5 = 0x9b05688c;
                        this.#h6 = 0x1f83d9ab;
                        this.#h7 = 0x5be0cd19;
                    }
                    this.#block = this.#start = this.#bytes = this.#hBytes = 0;
                    this.#finalized = this.#hashed = false;
                    this.#first = true;
                    this.#is224 = is224;
                }
                /** Update hash
                 *
                 * @param message The message you want to hash.
                 */
                update(message) {
                    if (this.#finalized) {
                        return this;
                    }
                    let msg;
                    if (message instanceof ArrayBuffer) {
                        msg = new Uint8Array(message);
                    }
                    else {
                        msg = message;
                    }
                    let index = 0;
                    const length = msg.length;
                    const blocks = this.#blocks;
                    while (index < length) {
                        let i;
                        if (this.#hashed) {
                            this.#hashed = false;
                            blocks[0] = this.#block;
                            blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
                        }
                        if (typeof msg !== "string") {
                            for (i = this.#start; index < length && i < 64; ++index) {
                                blocks[i >> 2] |= msg[index] << SHIFT[i++ & 3];
                            }
                        }
                        else {
                            for (i = this.#start; index < length && i < 64; ++index) {
                                let code = msg.charCodeAt(index);
                                if (code < 0x80) {
                                    blocks[i >> 2] |= code << SHIFT[i++ & 3];
                                }
                                else if (code < 0x800) {
                                    blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else if (code < 0xd800 || code >= 0xe000) {
                                    blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else {
                                    code =
                                        0x10000 +
                                            (((code & 0x3ff) << 10) | (msg.charCodeAt(++index) & 0x3ff));
                                    blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                            }
                        }
                        this.#lastByteIndex = i;
                        this.#bytes += i - this.#start;
                        if (i >= 64) {
                            this.#block = blocks[16];
                            this.#start = i - 64;
                            this.hash();
                            this.#hashed = true;
                        }
                        else {
                            this.#start = i;
                        }
                    }
                    if (this.#bytes > 4294967295) {
                        this.#hBytes += (this.#bytes / 4294967296) << 0;
                        this.#bytes = this.#bytes % 4294967296;
                    }
                    return this;
                }
                finalize() {
                    if (this.#finalized) {
                        return;
                    }
                    this.#finalized = true;
                    const blocks = this.#blocks;
                    const i = this.#lastByteIndex;
                    blocks[16] = this.#block;
                    blocks[i >> 2] |= EXTRA[i & 3];
                    this.#block = blocks[16];
                    if (i >= 56) {
                        if (!this.#hashed) {
                            this.hash();
                        }
                        blocks[0] = this.#block;
                        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
                    }
                    blocks[14] = (this.#hBytes << 3) | (this.#bytes >>> 29);
                    blocks[15] = this.#bytes << 3;
                    this.hash();
                }
                hash() {
                    let a = this.#h0;
                    let b = this.#h1;
                    let c = this.#h2;
                    let d = this.#h3;
                    let e = this.#h4;
                    let f = this.#h5;
                    let g = this.#h6;
                    let h = this.#h7;
                    const blocks = this.#blocks;
                    let s0;
                    let s1;
                    let maj;
                    let t1;
                    let t2;
                    let ch;
                    let ab;
                    let da;
                    let cd;
                    let bc;
                    for (let j = 16; j < 64; ++j) {
                        // rightrotate
                        t1 = blocks[j - 15];
                        s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
                        t1 = blocks[j - 2];
                        s1 =
                            ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
                        blocks[j] = (blocks[j - 16] + s0 + blocks[j - 7] + s1) << 0;
                    }
                    bc = b & c;
                    for (let j = 0; j < 64; j += 4) {
                        if (this.#first) {
                            if (this.#is224) {
                                ab = 300032;
                                t1 = blocks[0] - 1413257819;
                                h = (t1 - 150054599) << 0;
                                d = (t1 + 24177077) << 0;
                            }
                            else {
                                ab = 704751109;
                                t1 = blocks[0] - 210244248;
                                h = (t1 - 1521486534) << 0;
                                d = (t1 + 143694565) << 0;
                            }
                            this.#first = false;
                        }
                        else {
                            s0 =
                                ((a >>> 2) | (a << 30)) ^
                                    ((a >>> 13) | (a << 19)) ^
                                    ((a >>> 22) | (a << 10));
                            s1 =
                                ((e >>> 6) | (e << 26)) ^
                                    ((e >>> 11) | (e << 21)) ^
                                    ((e >>> 25) | (e << 7));
                            ab = a & b;
                            maj = ab ^ (a & c) ^ bc;
                            ch = (e & f) ^ (~e & g);
                            t1 = h + s1 + ch + K[j] + blocks[j];
                            t2 = s0 + maj;
                            h = (d + t1) << 0;
                            d = (t1 + t2) << 0;
                        }
                        s0 =
                            ((d >>> 2) | (d << 30)) ^
                                ((d >>> 13) | (d << 19)) ^
                                ((d >>> 22) | (d << 10));
                        s1 =
                            ((h >>> 6) | (h << 26)) ^
                                ((h >>> 11) | (h << 21)) ^
                                ((h >>> 25) | (h << 7));
                        da = d & a;
                        maj = da ^ (d & b) ^ ab;
                        ch = (h & e) ^ (~h & f);
                        t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
                        t2 = s0 + maj;
                        g = (c + t1) << 0;
                        c = (t1 + t2) << 0;
                        s0 =
                            ((c >>> 2) | (c << 30)) ^
                                ((c >>> 13) | (c << 19)) ^
                                ((c >>> 22) | (c << 10));
                        s1 =
                            ((g >>> 6) | (g << 26)) ^
                                ((g >>> 11) | (g << 21)) ^
                                ((g >>> 25) | (g << 7));
                        cd = c & d;
                        maj = cd ^ (c & a) ^ da;
                        ch = (g & h) ^ (~g & e);
                        t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
                        t2 = s0 + maj;
                        f = (b + t1) << 0;
                        b = (t1 + t2) << 0;
                        s0 =
                            ((b >>> 2) | (b << 30)) ^
                                ((b >>> 13) | (b << 19)) ^
                                ((b >>> 22) | (b << 10));
                        s1 =
                            ((f >>> 6) | (f << 26)) ^
                                ((f >>> 11) | (f << 21)) ^
                                ((f >>> 25) | (f << 7));
                        bc = b & c;
                        maj = bc ^ (b & d) ^ cd;
                        ch = (f & g) ^ (~f & h);
                        t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
                        t2 = s0 + maj;
                        e = (a + t1) << 0;
                        a = (t1 + t2) << 0;
                    }
                    this.#h0 = (this.#h0 + a) << 0;
                    this.#h1 = (this.#h1 + b) << 0;
                    this.#h2 = (this.#h2 + c) << 0;
                    this.#h3 = (this.#h3 + d) << 0;
                    this.#h4 = (this.#h4 + e) << 0;
                    this.#h5 = (this.#h5 + f) << 0;
                    this.#h6 = (this.#h6 + g) << 0;
                    this.#h7 = (this.#h7 + h) << 0;
                }
                /** Return hash in hex string. */
                hex() {
                    this.finalize();
                    const h0 = this.#h0;
                    const h1 = this.#h1;
                    const h2 = this.#h2;
                    const h3 = this.#h3;
                    const h4 = this.#h4;
                    const h5 = this.#h5;
                    const h6 = this.#h6;
                    const h7 = this.#h7;
                    let hex = HEX_CHARS[(h0 >> 28) & 0x0f] +
                        HEX_CHARS[(h0 >> 24) & 0x0f] +
                        HEX_CHARS[(h0 >> 20) & 0x0f] +
                        HEX_CHARS[(h0 >> 16) & 0x0f] +
                        HEX_CHARS[(h0 >> 12) & 0x0f] +
                        HEX_CHARS[(h0 >> 8) & 0x0f] +
                        HEX_CHARS[(h0 >> 4) & 0x0f] +
                        HEX_CHARS[h0 & 0x0f] +
                        HEX_CHARS[(h1 >> 28) & 0x0f] +
                        HEX_CHARS[(h1 >> 24) & 0x0f] +
                        HEX_CHARS[(h1 >> 20) & 0x0f] +
                        HEX_CHARS[(h1 >> 16) & 0x0f] +
                        HEX_CHARS[(h1 >> 12) & 0x0f] +
                        HEX_CHARS[(h1 >> 8) & 0x0f] +
                        HEX_CHARS[(h1 >> 4) & 0x0f] +
                        HEX_CHARS[h1 & 0x0f] +
                        HEX_CHARS[(h2 >> 28) & 0x0f] +
                        HEX_CHARS[(h2 >> 24) & 0x0f] +
                        HEX_CHARS[(h2 >> 20) & 0x0f] +
                        HEX_CHARS[(h2 >> 16) & 0x0f] +
                        HEX_CHARS[(h2 >> 12) & 0x0f] +
                        HEX_CHARS[(h2 >> 8) & 0x0f] +
                        HEX_CHARS[(h2 >> 4) & 0x0f] +
                        HEX_CHARS[h2 & 0x0f] +
                        HEX_CHARS[(h3 >> 28) & 0x0f] +
                        HEX_CHARS[(h3 >> 24) & 0x0f] +
                        HEX_CHARS[(h3 >> 20) & 0x0f] +
                        HEX_CHARS[(h3 >> 16) & 0x0f] +
                        HEX_CHARS[(h3 >> 12) & 0x0f] +
                        HEX_CHARS[(h3 >> 8) & 0x0f] +
                        HEX_CHARS[(h3 >> 4) & 0x0f] +
                        HEX_CHARS[h3 & 0x0f] +
                        HEX_CHARS[(h4 >> 28) & 0x0f] +
                        HEX_CHARS[(h4 >> 24) & 0x0f] +
                        HEX_CHARS[(h4 >> 20) & 0x0f] +
                        HEX_CHARS[(h4 >> 16) & 0x0f] +
                        HEX_CHARS[(h4 >> 12) & 0x0f] +
                        HEX_CHARS[(h4 >> 8) & 0x0f] +
                        HEX_CHARS[(h4 >> 4) & 0x0f] +
                        HEX_CHARS[h4 & 0x0f] +
                        HEX_CHARS[(h5 >> 28) & 0x0f] +
                        HEX_CHARS[(h5 >> 24) & 0x0f] +
                        HEX_CHARS[(h5 >> 20) & 0x0f] +
                        HEX_CHARS[(h5 >> 16) & 0x0f] +
                        HEX_CHARS[(h5 >> 12) & 0x0f] +
                        HEX_CHARS[(h5 >> 8) & 0x0f] +
                        HEX_CHARS[(h5 >> 4) & 0x0f] +
                        HEX_CHARS[h5 & 0x0f] +
                        HEX_CHARS[(h6 >> 28) & 0x0f] +
                        HEX_CHARS[(h6 >> 24) & 0x0f] +
                        HEX_CHARS[(h6 >> 20) & 0x0f] +
                        HEX_CHARS[(h6 >> 16) & 0x0f] +
                        HEX_CHARS[(h6 >> 12) & 0x0f] +
                        HEX_CHARS[(h6 >> 8) & 0x0f] +
                        HEX_CHARS[(h6 >> 4) & 0x0f] +
                        HEX_CHARS[h6 & 0x0f];
                    if (!this.#is224) {
                        hex +=
                            HEX_CHARS[(h7 >> 28) & 0x0f] +
                                HEX_CHARS[(h7 >> 24) & 0x0f] +
                                HEX_CHARS[(h7 >> 20) & 0x0f] +
                                HEX_CHARS[(h7 >> 16) & 0x0f] +
                                HEX_CHARS[(h7 >> 12) & 0x0f] +
                                HEX_CHARS[(h7 >> 8) & 0x0f] +
                                HEX_CHARS[(h7 >> 4) & 0x0f] +
                                HEX_CHARS[h7 & 0x0f];
                    }
                    return hex;
                }
                /** Return hash in hex string. */
                toString() {
                    return this.hex();
                }
                /** Return hash in integer array. */
                digest() {
                    this.finalize();
                    const h0 = this.#h0;
                    const h1 = this.#h1;
                    const h2 = this.#h2;
                    const h3 = this.#h3;
                    const h4 = this.#h4;
                    const h5 = this.#h5;
                    const h6 = this.#h6;
                    const h7 = this.#h7;
                    const arr = [
                        (h0 >> 24) & 0xff,
                        (h0 >> 16) & 0xff,
                        (h0 >> 8) & 0xff,
                        h0 & 0xff,
                        (h1 >> 24) & 0xff,
                        (h1 >> 16) & 0xff,
                        (h1 >> 8) & 0xff,
                        h1 & 0xff,
                        (h2 >> 24) & 0xff,
                        (h2 >> 16) & 0xff,
                        (h2 >> 8) & 0xff,
                        h2 & 0xff,
                        (h3 >> 24) & 0xff,
                        (h3 >> 16) & 0xff,
                        (h3 >> 8) & 0xff,
                        h3 & 0xff,
                        (h4 >> 24) & 0xff,
                        (h4 >> 16) & 0xff,
                        (h4 >> 8) & 0xff,
                        h4 & 0xff,
                        (h5 >> 24) & 0xff,
                        (h5 >> 16) & 0xff,
                        (h5 >> 8) & 0xff,
                        h5 & 0xff,
                        (h6 >> 24) & 0xff,
                        (h6 >> 16) & 0xff,
                        (h6 >> 8) & 0xff,
                        h6 & 0xff,
                    ];
                    if (!this.#is224) {
                        arr.push((h7 >> 24) & 0xff, (h7 >> 16) & 0xff, (h7 >> 8) & 0xff, h7 & 0xff);
                    }
                    return arr;
                }
                /** Return hash in integer array. */
                array() {
                    return this.digest();
                }
                /** Return hash in ArrayBuffer. */
                arrayBuffer() {
                    this.finalize();
                    const buffer = new ArrayBuffer(this.#is224 ? 28 : 32);
                    const dataView = new DataView(buffer);
                    dataView.setUint32(0, this.#h0);
                    dataView.setUint32(4, this.#h1);
                    dataView.setUint32(8, this.#h2);
                    dataView.setUint32(12, this.#h3);
                    dataView.setUint32(16, this.#h4);
                    dataView.setUint32(20, this.#h5);
                    dataView.setUint32(24, this.#h6);
                    if (!this.#is224) {
                        dataView.setUint32(28, this.#h7);
                    }
                    return buffer;
                }
            };
            exports_103("Sha256", Sha256);
            HmacSha256 = class HmacSha256 extends Sha256 {
                constructor(secretKey, is224 = false, sharedMemory = false) {
                    super(is224, sharedMemory);
                    let key;
                    if (typeof secretKey === "string") {
                        const bytes = [];
                        const length = secretKey.length;
                        let index = 0;
                        for (let i = 0; i < length; ++i) {
                            let code = secretKey.charCodeAt(i);
                            if (code < 0x80) {
                                bytes[index++] = code;
                            }
                            else if (code < 0x800) {
                                bytes[index++] = 0xc0 | (code >> 6);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else if (code < 0xd800 || code >= 0xe000) {
                                bytes[index++] = 0xe0 | (code >> 12);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else {
                                code =
                                    0x10000 +
                                        (((code & 0x3ff) << 10) | (secretKey.charCodeAt(++i) & 0x3ff));
                                bytes[index++] = 0xf0 | (code >> 18);
                                bytes[index++] = 0x80 | ((code >> 12) & 0x3f);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                        }
                        key = bytes;
                    }
                    else {
                        if (secretKey instanceof ArrayBuffer) {
                            key = new Uint8Array(secretKey);
                        }
                        else {
                            key = secretKey;
                        }
                    }
                    if (key.length > 64) {
                        key = new Sha256(is224, true).update(key).array();
                    }
                    const oKeyPad = [];
                    const iKeyPad = [];
                    for (let i = 0; i < 64; ++i) {
                        const b = key[i] || 0;
                        oKeyPad[i] = 0x5c ^ b;
                        iKeyPad[i] = 0x36 ^ b;
                    }
                    this.update(iKeyPad);
                    this.#oKeyPad = oKeyPad;
                    this.#inner = true;
                    this.#is224 = is224;
                    this.#sharedMemory = sharedMemory;
                }
                #inner;
                #is224;
                #oKeyPad;
                #sharedMemory;
                finalize() {
                    super.finalize();
                    if (this.#inner) {
                        this.#inner = false;
                        const innerHash = this.array();
                        super.init(this.#is224, this.#sharedMemory);
                        this.update(this.#oKeyPad);
                        this.update(innerHash);
                        super.finalize();
                    }
                }
            };
            exports_103("HmacSha256", HmacSha256);
        }
    };
});
/*
 * [js-sha512]{@link https://github.com/emn178/js-sha512}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2018
 * @license MIT
 */
System.register("https://deno.land/std@v0.56.0/hash/sha512", [], function (exports_104, context_104) {
    "use strict";
    var HEX_CHARS, EXTRA, SHIFT, K, blocks, Sha512, HmacSha512;
    var __moduleName = context_104 && context_104.id;
    return {
        setters: [],
        execute: function () {
            // prettier-ignore
            HEX_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
            EXTRA = [-2147483648, 8388608, 32768, 128];
            SHIFT = [24, 16, 8, 0];
            // prettier-ignore
            K = [
                0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd, 0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc, 0x3956c25b,
                0xf348b538, 0x59f111f1, 0xb605d019, 0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118, 0xd807aa98, 0xa3030242,
                0x12835b01, 0x45706fbe, 0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2, 0x72be5d74, 0xf27b896f, 0x80deb1fe,
                0x3b1696b1, 0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694, 0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
                0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65, 0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483, 0x5cb0a9dc,
                0xbd41fbd4, 0x76f988da, 0x831153b5, 0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210, 0xb00327c8, 0x98fb213f,
                0xbf597fc7, 0xbeef0ee4, 0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725, 0x06ca6351, 0xe003826f, 0x14292967,
                0x0a0e6e70, 0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926, 0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
                0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8, 0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b, 0xa2bfe8a1,
                0x4cf10364, 0xa81a664b, 0xbc423001, 0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30, 0xd192e819, 0xd6ef5218,
                0xd6990624, 0x5565a910, 0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8, 0x19a4c116, 0xb8d2d0c8, 0x1e376c08,
                0x5141ab53, 0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8, 0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
                0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3, 0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60, 0x84c87814,
                0xa1f0ab72, 0x8cc70208, 0x1a6439ec, 0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9, 0xbef9a3f7, 0xb2c67915,
                0xc67178f2, 0xe372532b, 0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207, 0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f,
                0xee6ed178, 0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6, 0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
                0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493, 0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c, 0x4cc5d4be,
                0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
            ];
            blocks = [];
            // prettier-ignore
            Sha512 = class Sha512 {
                constructor(bits = 512, sharedMemory = false) {
                    this.#lastByteIndex = 0;
                    this.init(bits, sharedMemory);
                }
                #blocks;
                #block;
                #bits;
                #start;
                #bytes;
                #hBytes;
                #lastByteIndex;
                #finalized;
                #hashed;
                #h0h;
                #h0l;
                #h1h;
                #h1l;
                #h2h;
                #h2l;
                #h3h;
                #h3l;
                #h4h;
                #h4l;
                #h5h;
                #h5l;
                #h6h;
                #h6l;
                #h7h;
                #h7l;
                init(bits, sharedMemory) {
                    if (sharedMemory) {
                        blocks[0] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                            blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = blocks[16] =
                                blocks[17] = blocks[18] = blocks[19] = blocks[20] = blocks[21] = blocks[22] = blocks[23] = blocks[24] =
                                    blocks[25] = blocks[26] = blocks[27] = blocks[28] = blocks[29] = blocks[30] = blocks[31] = blocks[32] = 0;
                        this.#blocks = blocks;
                    }
                    else {
                        this.#blocks =
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    if (bits === 224) {
                        this.#h0h = 0x8c3d37c8;
                        this.#h0l = 0x19544da2;
                        this.#h1h = 0x73e19966;
                        this.#h1l = 0x89dcd4d6;
                        this.#h2h = 0x1dfab7ae;
                        this.#h2l = 0x32ff9c82;
                        this.#h3h = 0x679dd514;
                        this.#h3l = 0x582f9fcf;
                        this.#h4h = 0x0f6d2b69;
                        this.#h4l = 0x7bd44da8;
                        this.#h5h = 0x77e36f73;
                        this.#h5l = 0x04c48942;
                        this.#h6h = 0x3f9d85a8;
                        this.#h6l = 0x6a1d36c8;
                        this.#h7h = 0x1112e6ad;
                        this.#h7l = 0x91d692a1;
                    }
                    else if (bits === 256) {
                        this.#h0h = 0x22312194;
                        this.#h0l = 0xfc2bf72c;
                        this.#h1h = 0x9f555fa3;
                        this.#h1l = 0xc84c64c2;
                        this.#h2h = 0x2393b86b;
                        this.#h2l = 0x6f53b151;
                        this.#h3h = 0x96387719;
                        this.#h3l = 0x5940eabd;
                        this.#h4h = 0x96283ee2;
                        this.#h4l = 0xa88effe3;
                        this.#h5h = 0xbe5e1e25;
                        this.#h5l = 0x53863992;
                        this.#h6h = 0x2b0199fc;
                        this.#h6l = 0x2c85b8aa;
                        this.#h7h = 0x0eb72ddc;
                        this.#h7l = 0x81c52ca2;
                    }
                    else if (bits === 384) {
                        this.#h0h = 0xcbbb9d5d;
                        this.#h0l = 0xc1059ed8;
                        this.#h1h = 0x629a292a;
                        this.#h1l = 0x367cd507;
                        this.#h2h = 0x9159015a;
                        this.#h2l = 0x3070dd17;
                        this.#h3h = 0x152fecd8;
                        this.#h3l = 0xf70e5939;
                        this.#h4h = 0x67332667;
                        this.#h4l = 0xffc00b31;
                        this.#h5h = 0x8eb44a87;
                        this.#h5l = 0x68581511;
                        this.#h6h = 0xdb0c2e0d;
                        this.#h6l = 0x64f98fa7;
                        this.#h7h = 0x47b5481d;
                        this.#h7l = 0xbefa4fa4;
                    }
                    else { // 512
                        this.#h0h = 0x6a09e667;
                        this.#h0l = 0xf3bcc908;
                        this.#h1h = 0xbb67ae85;
                        this.#h1l = 0x84caa73b;
                        this.#h2h = 0x3c6ef372;
                        this.#h2l = 0xfe94f82b;
                        this.#h3h = 0xa54ff53a;
                        this.#h3l = 0x5f1d36f1;
                        this.#h4h = 0x510e527f;
                        this.#h4l = 0xade682d1;
                        this.#h5h = 0x9b05688c;
                        this.#h5l = 0x2b3e6c1f;
                        this.#h6h = 0x1f83d9ab;
                        this.#h6l = 0xfb41bd6b;
                        this.#h7h = 0x5be0cd19;
                        this.#h7l = 0x137e2179;
                    }
                    this.#bits = bits;
                    this.#block = this.#start = this.#bytes = this.#hBytes = 0;
                    this.#finalized = this.#hashed = false;
                }
                update(message) {
                    if (this.#finalized) {
                        return this;
                    }
                    let msg;
                    if (message instanceof ArrayBuffer) {
                        msg = new Uint8Array(message);
                    }
                    else {
                        msg = message;
                    }
                    const length = msg.length;
                    const blocks = this.#blocks;
                    let index = 0;
                    while (index < length) {
                        let i;
                        if (this.#hashed) {
                            this.#hashed = false;
                            blocks[0] = this.#block;
                            blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                                blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = blocks[16] =
                                    blocks[17] = blocks[18] = blocks[19] = blocks[20] = blocks[21] = blocks[22] = blocks[23] = blocks[24] =
                                        blocks[25] = blocks[26] = blocks[27] = blocks[28] = blocks[29] = blocks[30] = blocks[31] = blocks[32] = 0;
                        }
                        if (typeof msg !== "string") {
                            for (i = this.#start; index < length && i < 128; ++index) {
                                blocks[i >> 2] |= msg[index] << SHIFT[i++ & 3];
                            }
                        }
                        else {
                            for (i = this.#start; index < length && i < 128; ++index) {
                                let code = msg.charCodeAt(index);
                                if (code < 0x80) {
                                    blocks[i >> 2] |= code << SHIFT[i++ & 3];
                                }
                                else if (code < 0x800) {
                                    blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else if (code < 0xd800 || code >= 0xe000) {
                                    blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else {
                                    code = 0x10000 + (((code & 0x3ff) << 10) | (msg.charCodeAt(++index) & 0x3ff));
                                    blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                            }
                        }
                        this.#lastByteIndex = i;
                        this.#bytes += i - this.#start;
                        if (i >= 128) {
                            this.#block = blocks[32];
                            this.#start = i - 128;
                            this.hash();
                            this.#hashed = true;
                        }
                        else {
                            this.#start = i;
                        }
                    }
                    if (this.#bytes > 4294967295) {
                        this.#hBytes += (this.#bytes / 4294967296) << 0;
                        this.#bytes = this.#bytes % 4294967296;
                    }
                    return this;
                }
                finalize() {
                    if (this.#finalized) {
                        return;
                    }
                    this.#finalized = true;
                    const blocks = this.#blocks;
                    const i = this.#lastByteIndex;
                    blocks[32] = this.#block;
                    blocks[i >> 2] |= EXTRA[i & 3];
                    this.#block = blocks[32];
                    if (i >= 112) {
                        if (!this.#hashed) {
                            this.hash();
                        }
                        blocks[0] = this.#block;
                        blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                            blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = blocks[16] =
                                blocks[17] = blocks[18] = blocks[19] = blocks[20] = blocks[21] = blocks[22] = blocks[23] = blocks[24] =
                                    blocks[25] = blocks[26] = blocks[27] = blocks[28] = blocks[29] = blocks[30] = blocks[31] = blocks[32] = 0;
                    }
                    blocks[30] = (this.#hBytes << 3) | (this.#bytes >>> 29);
                    blocks[31] = this.#bytes << 3;
                    this.hash();
                }
                hash() {
                    const h0h = this.#h0h, h0l = this.#h0l, h1h = this.#h1h, h1l = this.#h1l, h2h = this.#h2h, h2l = this.#h2l, h3h = this.#h3h, h3l = this.#h3l, h4h = this.#h4h, h4l = this.#h4l, h5h = this.#h5h, h5l = this.#h5l, h6h = this.#h6h, h6l = this.#h6l, h7h = this.#h7h, h7l = this.#h7l;
                    let s0h, s0l, s1h, s1l, c1, c2, c3, c4, abh, abl, dah, dal, cdh, cdl, bch, bcl, majh, majl, t1h, t1l, t2h, t2l, chh, chl;
                    const blocks = this.#blocks;
                    for (let j = 32; j < 160; j += 2) {
                        t1h = blocks[j - 30];
                        t1l = blocks[j - 29];
                        s0h = ((t1h >>> 1) | (t1l << 31)) ^ ((t1h >>> 8) | (t1l << 24)) ^ (t1h >>> 7);
                        s0l = ((t1l >>> 1) | (t1h << 31)) ^ ((t1l >>> 8) | (t1h << 24)) ^ ((t1l >>> 7) | (t1h << 25));
                        t1h = blocks[j - 4];
                        t1l = blocks[j - 3];
                        s1h = ((t1h >>> 19) | (t1l << 13)) ^ ((t1l >>> 29) | (t1h << 3)) ^ (t1h >>> 6);
                        s1l = ((t1l >>> 19) | (t1h << 13)) ^ ((t1h >>> 29) | (t1l << 3)) ^ ((t1l >>> 6) | (t1h << 26));
                        t1h = blocks[j - 32];
                        t1l = blocks[j - 31];
                        t2h = blocks[j - 14];
                        t2l = blocks[j - 13];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (s0l & 0xffff) + (s1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (s0l >>> 16) + (s1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (s0h & 0xffff) + (s1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (s0h >>> 16) + (s1h >>> 16) + (c3 >>> 16);
                        blocks[j] = (c4 << 16) | (c3 & 0xffff);
                        blocks[j + 1] = (c2 << 16) | (c1 & 0xffff);
                    }
                    let ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
                    bch = bh & ch;
                    bcl = bl & cl;
                    for (let j = 0; j < 160; j += 8) {
                        s0h = ((ah >>> 28) | (al << 4)) ^ ((al >>> 2) | (ah << 30)) ^ ((al >>> 7) | (ah << 25));
                        s0l = ((al >>> 28) | (ah << 4)) ^ ((ah >>> 2) | (al << 30)) ^ ((ah >>> 7) | (al << 25));
                        s1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((el >>> 9) | (eh << 23));
                        s1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((eh >>> 9) | (el << 23));
                        abh = ah & bh;
                        abl = al & bl;
                        majh = abh ^ (ah & ch) ^ bch;
                        majl = abl ^ (al & cl) ^ bcl;
                        chh = (eh & fh) ^ (~eh & gh);
                        chl = (el & fl) ^ (~el & gl);
                        t1h = blocks[j];
                        t1l = blocks[j + 1];
                        t2h = K[j];
                        t2l = K[j + 1];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (hl & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (hl >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (hh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (hh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (dl & 0xffff) + (t1l & 0xffff);
                        c2 = (dl >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (dh & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (dh >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        hh = (c4 << 16) | (c3 & 0xffff);
                        hl = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        dh = (c4 << 16) | (c3 & 0xffff);
                        dl = (c2 << 16) | (c1 & 0xffff);
                        s0h = ((dh >>> 28) | (dl << 4)) ^ ((dl >>> 2) | (dh << 30)) ^ ((dl >>> 7) | (dh << 25));
                        s0l = ((dl >>> 28) | (dh << 4)) ^ ((dh >>> 2) | (dl << 30)) ^ ((dh >>> 7) | (dl << 25));
                        s1h = ((hh >>> 14) | (hl << 18)) ^ ((hh >>> 18) | (hl << 14)) ^ ((hl >>> 9) | (hh << 23));
                        s1l = ((hl >>> 14) | (hh << 18)) ^ ((hl >>> 18) | (hh << 14)) ^ ((hh >>> 9) | (hl << 23));
                        dah = dh & ah;
                        dal = dl & al;
                        majh = dah ^ (dh & bh) ^ abh;
                        majl = dal ^ (dl & bl) ^ abl;
                        chh = (hh & eh) ^ (~hh & fh);
                        chl = (hl & el) ^ (~hl & fl);
                        t1h = blocks[j + 2];
                        t1l = blocks[j + 3];
                        t2h = K[j + 2];
                        t2l = K[j + 3];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (gl & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (gl >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (gh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (gh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (cl & 0xffff) + (t1l & 0xffff);
                        c2 = (cl >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (ch & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (ch >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        gh = (c4 << 16) | (c3 & 0xffff);
                        gl = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        ch = (c4 << 16) | (c3 & 0xffff);
                        cl = (c2 << 16) | (c1 & 0xffff);
                        s0h = ((ch >>> 28) | (cl << 4)) ^ ((cl >>> 2) | (ch << 30)) ^ ((cl >>> 7) | (ch << 25));
                        s0l = ((cl >>> 28) | (ch << 4)) ^ ((ch >>> 2) | (cl << 30)) ^ ((ch >>> 7) | (cl << 25));
                        s1h = ((gh >>> 14) | (gl << 18)) ^ ((gh >>> 18) | (gl << 14)) ^ ((gl >>> 9) | (gh << 23));
                        s1l = ((gl >>> 14) | (gh << 18)) ^ ((gl >>> 18) | (gh << 14)) ^ ((gh >>> 9) | (gl << 23));
                        cdh = ch & dh;
                        cdl = cl & dl;
                        majh = cdh ^ (ch & ah) ^ dah;
                        majl = cdl ^ (cl & al) ^ dal;
                        chh = (gh & hh) ^ (~gh & eh);
                        chl = (gl & hl) ^ (~gl & el);
                        t1h = blocks[j + 4];
                        t1l = blocks[j + 5];
                        t2h = K[j + 4];
                        t2l = K[j + 5];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (fl & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (fl >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (fh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (fh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (bl & 0xffff) + (t1l & 0xffff);
                        c2 = (bl >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (bh & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (bh >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        fh = (c4 << 16) | (c3 & 0xffff);
                        fl = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        bh = (c4 << 16) | (c3 & 0xffff);
                        bl = (c2 << 16) | (c1 & 0xffff);
                        s0h = ((bh >>> 28) | (bl << 4)) ^ ((bl >>> 2) | (bh << 30)) ^ ((bl >>> 7) | (bh << 25));
                        s0l = ((bl >>> 28) | (bh << 4)) ^ ((bh >>> 2) | (bl << 30)) ^ ((bh >>> 7) | (bl << 25));
                        s1h = ((fh >>> 14) | (fl << 18)) ^ ((fh >>> 18) | (fl << 14)) ^ ((fl >>> 9) | (fh << 23));
                        s1l = ((fl >>> 14) | (fh << 18)) ^ ((fl >>> 18) | (fh << 14)) ^ ((fh >>> 9) | (fl << 23));
                        bch = bh & ch;
                        bcl = bl & cl;
                        majh = bch ^ (bh & dh) ^ cdh;
                        majl = bcl ^ (bl & dl) ^ cdl;
                        chh = (fh & gh) ^ (~fh & hh);
                        chl = (fl & gl) ^ (~fl & hl);
                        t1h = blocks[j + 6];
                        t1l = blocks[j + 7];
                        t2h = K[j + 6];
                        t2l = K[j + 7];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (el & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (el >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (eh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (eh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (al & 0xffff) + (t1l & 0xffff);
                        c2 = (al >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (ah & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (ah >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        eh = (c4 << 16) | (c3 & 0xffff);
                        el = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        ah = (c4 << 16) | (c3 & 0xffff);
                        al = (c2 << 16) | (c1 & 0xffff);
                    }
                    c1 = (h0l & 0xffff) + (al & 0xffff);
                    c2 = (h0l >>> 16) + (al >>> 16) + (c1 >>> 16);
                    c3 = (h0h & 0xffff) + (ah & 0xffff) + (c2 >>> 16);
                    c4 = (h0h >>> 16) + (ah >>> 16) + (c3 >>> 16);
                    this.#h0h = (c4 << 16) | (c3 & 0xffff);
                    this.#h0l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h1l & 0xffff) + (bl & 0xffff);
                    c2 = (h1l >>> 16) + (bl >>> 16) + (c1 >>> 16);
                    c3 = (h1h & 0xffff) + (bh & 0xffff) + (c2 >>> 16);
                    c4 = (h1h >>> 16) + (bh >>> 16) + (c3 >>> 16);
                    this.#h1h = (c4 << 16) | (c3 & 0xffff);
                    this.#h1l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h2l & 0xffff) + (cl & 0xffff);
                    c2 = (h2l >>> 16) + (cl >>> 16) + (c1 >>> 16);
                    c3 = (h2h & 0xffff) + (ch & 0xffff) + (c2 >>> 16);
                    c4 = (h2h >>> 16) + (ch >>> 16) + (c3 >>> 16);
                    this.#h2h = (c4 << 16) | (c3 & 0xffff);
                    this.#h2l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h3l & 0xffff) + (dl & 0xffff);
                    c2 = (h3l >>> 16) + (dl >>> 16) + (c1 >>> 16);
                    c3 = (h3h & 0xffff) + (dh & 0xffff) + (c2 >>> 16);
                    c4 = (h3h >>> 16) + (dh >>> 16) + (c3 >>> 16);
                    this.#h3h = (c4 << 16) | (c3 & 0xffff);
                    this.#h3l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h4l & 0xffff) + (el & 0xffff);
                    c2 = (h4l >>> 16) + (el >>> 16) + (c1 >>> 16);
                    c3 = (h4h & 0xffff) + (eh & 0xffff) + (c2 >>> 16);
                    c4 = (h4h >>> 16) + (eh >>> 16) + (c3 >>> 16);
                    this.#h4h = (c4 << 16) | (c3 & 0xffff);
                    this.#h4l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h5l & 0xffff) + (fl & 0xffff);
                    c2 = (h5l >>> 16) + (fl >>> 16) + (c1 >>> 16);
                    c3 = (h5h & 0xffff) + (fh & 0xffff) + (c2 >>> 16);
                    c4 = (h5h >>> 16) + (fh >>> 16) + (c3 >>> 16);
                    this.#h5h = (c4 << 16) | (c3 & 0xffff);
                    this.#h5l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h6l & 0xffff) + (gl & 0xffff);
                    c2 = (h6l >>> 16) + (gl >>> 16) + (c1 >>> 16);
                    c3 = (h6h & 0xffff) + (gh & 0xffff) + (c2 >>> 16);
                    c4 = (h6h >>> 16) + (gh >>> 16) + (c3 >>> 16);
                    this.#h6h = (c4 << 16) | (c3 & 0xffff);
                    this.#h6l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h7l & 0xffff) + (hl & 0xffff);
                    c2 = (h7l >>> 16) + (hl >>> 16) + (c1 >>> 16);
                    c3 = (h7h & 0xffff) + (hh & 0xffff) + (c2 >>> 16);
                    c4 = (h7h >>> 16) + (hh >>> 16) + (c3 >>> 16);
                    this.#h7h = (c4 << 16) | (c3 & 0xffff);
                    this.#h7l = (c2 << 16) | (c1 & 0xffff);
                }
                hex() {
                    this.finalize();
                    const h0h = this.#h0h, h0l = this.#h0l, h1h = this.#h1h, h1l = this.#h1l, h2h = this.#h2h, h2l = this.#h2l, h3h = this.#h3h, h3l = this.#h3l, h4h = this.#h4h, h4l = this.#h4l, h5h = this.#h5h, h5l = this.#h5l, h6h = this.#h6h, h6l = this.#h6l, h7h = this.#h7h, h7l = this.#h7l, bits = this.#bits;
                    let hex = HEX_CHARS[(h0h >> 28) & 0x0f] + HEX_CHARS[(h0h >> 24) & 0x0f] +
                        HEX_CHARS[(h0h >> 20) & 0x0f] + HEX_CHARS[(h0h >> 16) & 0x0f] +
                        HEX_CHARS[(h0h >> 12) & 0x0f] + HEX_CHARS[(h0h >> 8) & 0x0f] +
                        HEX_CHARS[(h0h >> 4) & 0x0f] + HEX_CHARS[h0h & 0x0f] +
                        HEX_CHARS[(h0l >> 28) & 0x0f] + HEX_CHARS[(h0l >> 24) & 0x0f] +
                        HEX_CHARS[(h0l >> 20) & 0x0f] + HEX_CHARS[(h0l >> 16) & 0x0f] +
                        HEX_CHARS[(h0l >> 12) & 0x0f] + HEX_CHARS[(h0l >> 8) & 0x0f] +
                        HEX_CHARS[(h0l >> 4) & 0x0f] + HEX_CHARS[h0l & 0x0f] +
                        HEX_CHARS[(h1h >> 28) & 0x0f] + HEX_CHARS[(h1h >> 24) & 0x0f] +
                        HEX_CHARS[(h1h >> 20) & 0x0f] + HEX_CHARS[(h1h >> 16) & 0x0f] +
                        HEX_CHARS[(h1h >> 12) & 0x0f] + HEX_CHARS[(h1h >> 8) & 0x0f] +
                        HEX_CHARS[(h1h >> 4) & 0x0f] + HEX_CHARS[h1h & 0x0f] +
                        HEX_CHARS[(h1l >> 28) & 0x0f] + HEX_CHARS[(h1l >> 24) & 0x0f] +
                        HEX_CHARS[(h1l >> 20) & 0x0f] + HEX_CHARS[(h1l >> 16) & 0x0f] +
                        HEX_CHARS[(h1l >> 12) & 0x0f] + HEX_CHARS[(h1l >> 8) & 0x0f] +
                        HEX_CHARS[(h1l >> 4) & 0x0f] + HEX_CHARS[h1l & 0x0f] +
                        HEX_CHARS[(h2h >> 28) & 0x0f] + HEX_CHARS[(h2h >> 24) & 0x0f] +
                        HEX_CHARS[(h2h >> 20) & 0x0f] + HEX_CHARS[(h2h >> 16) & 0x0f] +
                        HEX_CHARS[(h2h >> 12) & 0x0f] + HEX_CHARS[(h2h >> 8) & 0x0f] +
                        HEX_CHARS[(h2h >> 4) & 0x0f] + HEX_CHARS[h2h & 0x0f] +
                        HEX_CHARS[(h2l >> 28) & 0x0f] + HEX_CHARS[(h2l >> 24) & 0x0f] +
                        HEX_CHARS[(h2l >> 20) & 0x0f] + HEX_CHARS[(h2l >> 16) & 0x0f] +
                        HEX_CHARS[(h2l >> 12) & 0x0f] + HEX_CHARS[(h2l >> 8) & 0x0f] +
                        HEX_CHARS[(h2l >> 4) & 0x0f] + HEX_CHARS[h2l & 0x0f] +
                        HEX_CHARS[(h3h >> 28) & 0x0f] + HEX_CHARS[(h3h >> 24) & 0x0f] +
                        HEX_CHARS[(h3h >> 20) & 0x0f] + HEX_CHARS[(h3h >> 16) & 0x0f] +
                        HEX_CHARS[(h3h >> 12) & 0x0f] + HEX_CHARS[(h3h >> 8) & 0x0f] +
                        HEX_CHARS[(h3h >> 4) & 0x0f] + HEX_CHARS[h3h & 0x0f];
                    if (bits >= 256) {
                        hex +=
                            HEX_CHARS[(h3l >> 28) & 0x0f] + HEX_CHARS[(h3l >> 24) & 0x0f] +
                                HEX_CHARS[(h3l >> 20) & 0x0f] + HEX_CHARS[(h3l >> 16) & 0x0f] +
                                HEX_CHARS[(h3l >> 12) & 0x0f] + HEX_CHARS[(h3l >> 8) & 0x0f] +
                                HEX_CHARS[(h3l >> 4) & 0x0f] + HEX_CHARS[h3l & 0x0f];
                    }
                    if (bits >= 384) {
                        hex +=
                            HEX_CHARS[(h4h >> 28) & 0x0f] + HEX_CHARS[(h4h >> 24) & 0x0f] +
                                HEX_CHARS[(h4h >> 20) & 0x0f] + HEX_CHARS[(h4h >> 16) & 0x0f] +
                                HEX_CHARS[(h4h >> 12) & 0x0f] + HEX_CHARS[(h4h >> 8) & 0x0f] +
                                HEX_CHARS[(h4h >> 4) & 0x0f] + HEX_CHARS[h4h & 0x0f] +
                                HEX_CHARS[(h4l >> 28) & 0x0f] + HEX_CHARS[(h4l >> 24) & 0x0f] +
                                HEX_CHARS[(h4l >> 20) & 0x0f] + HEX_CHARS[(h4l >> 16) & 0x0f] +
                                HEX_CHARS[(h4l >> 12) & 0x0f] + HEX_CHARS[(h4l >> 8) & 0x0f] +
                                HEX_CHARS[(h4l >> 4) & 0x0f] + HEX_CHARS[h4l & 0x0f] +
                                HEX_CHARS[(h5h >> 28) & 0x0f] + HEX_CHARS[(h5h >> 24) & 0x0f] +
                                HEX_CHARS[(h5h >> 20) & 0x0f] + HEX_CHARS[(h5h >> 16) & 0x0f] +
                                HEX_CHARS[(h5h >> 12) & 0x0f] + HEX_CHARS[(h5h >> 8) & 0x0f] +
                                HEX_CHARS[(h5h >> 4) & 0x0f] + HEX_CHARS[h5h & 0x0f] +
                                HEX_CHARS[(h5l >> 28) & 0x0f] + HEX_CHARS[(h5l >> 24) & 0x0f] +
                                HEX_CHARS[(h5l >> 20) & 0x0f] + HEX_CHARS[(h5l >> 16) & 0x0f] +
                                HEX_CHARS[(h5l >> 12) & 0x0f] + HEX_CHARS[(h5l >> 8) & 0x0f] +
                                HEX_CHARS[(h5l >> 4) & 0x0f] + HEX_CHARS[h5l & 0x0f];
                    }
                    if (bits === 512) {
                        hex +=
                            HEX_CHARS[(h6h >> 28) & 0x0f] + HEX_CHARS[(h6h >> 24) & 0x0f] +
                                HEX_CHARS[(h6h >> 20) & 0x0f] + HEX_CHARS[(h6h >> 16) & 0x0f] +
                                HEX_CHARS[(h6h >> 12) & 0x0f] + HEX_CHARS[(h6h >> 8) & 0x0f] +
                                HEX_CHARS[(h6h >> 4) & 0x0f] + HEX_CHARS[h6h & 0x0f] +
                                HEX_CHARS[(h6l >> 28) & 0x0f] + HEX_CHARS[(h6l >> 24) & 0x0f] +
                                HEX_CHARS[(h6l >> 20) & 0x0f] + HEX_CHARS[(h6l >> 16) & 0x0f] +
                                HEX_CHARS[(h6l >> 12) & 0x0f] + HEX_CHARS[(h6l >> 8) & 0x0f] +
                                HEX_CHARS[(h6l >> 4) & 0x0f] + HEX_CHARS[h6l & 0x0f] +
                                HEX_CHARS[(h7h >> 28) & 0x0f] + HEX_CHARS[(h7h >> 24) & 0x0f] +
                                HEX_CHARS[(h7h >> 20) & 0x0f] + HEX_CHARS[(h7h >> 16) & 0x0f] +
                                HEX_CHARS[(h7h >> 12) & 0x0f] + HEX_CHARS[(h7h >> 8) & 0x0f] +
                                HEX_CHARS[(h7h >> 4) & 0x0f] + HEX_CHARS[h7h & 0x0f] +
                                HEX_CHARS[(h7l >> 28) & 0x0f] + HEX_CHARS[(h7l >> 24) & 0x0f] +
                                HEX_CHARS[(h7l >> 20) & 0x0f] + HEX_CHARS[(h7l >> 16) & 0x0f] +
                                HEX_CHARS[(h7l >> 12) & 0x0f] + HEX_CHARS[(h7l >> 8) & 0x0f] +
                                HEX_CHARS[(h7l >> 4) & 0x0f] + HEX_CHARS[h7l & 0x0f];
                    }
                    return hex;
                }
                toString() {
                    return this.hex();
                }
                digest() {
                    this.finalize();
                    const h0h = this.#h0h, h0l = this.#h0l, h1h = this.#h1h, h1l = this.#h1l, h2h = this.#h2h, h2l = this.#h2l, h3h = this.#h3h, h3l = this.#h3l, h4h = this.#h4h, h4l = this.#h4l, h5h = this.#h5h, h5l = this.#h5l, h6h = this.#h6h, h6l = this.#h6l, h7h = this.#h7h, h7l = this.#h7l, bits = this.#bits;
                    const arr = [
                        (h0h >> 24) & 0xff, (h0h >> 16) & 0xff, (h0h >> 8) & 0xff, h0h & 0xff,
                        (h0l >> 24) & 0xff, (h0l >> 16) & 0xff, (h0l >> 8) & 0xff, h0l & 0xff,
                        (h1h >> 24) & 0xff, (h1h >> 16) & 0xff, (h1h >> 8) & 0xff, h1h & 0xff,
                        (h1l >> 24) & 0xff, (h1l >> 16) & 0xff, (h1l >> 8) & 0xff, h1l & 0xff,
                        (h2h >> 24) & 0xff, (h2h >> 16) & 0xff, (h2h >> 8) & 0xff, h2h & 0xff,
                        (h2l >> 24) & 0xff, (h2l >> 16) & 0xff, (h2l >> 8) & 0xff, h2l & 0xff,
                        (h3h >> 24) & 0xff, (h3h >> 16) & 0xff, (h3h >> 8) & 0xff, h3h & 0xff
                    ];
                    if (bits >= 256) {
                        arr.push((h3l >> 24) & 0xff, (h3l >> 16) & 0xff, (h3l >> 8) & 0xff, h3l & 0xff);
                    }
                    if (bits >= 384) {
                        arr.push((h4h >> 24) & 0xff, (h4h >> 16) & 0xff, (h4h >> 8) & 0xff, h4h & 0xff, (h4l >> 24) & 0xff, (h4l >> 16) & 0xff, (h4l >> 8) & 0xff, h4l & 0xff, (h5h >> 24) & 0xff, (h5h >> 16) & 0xff, (h5h >> 8) & 0xff, h5h & 0xff, (h5l >> 24) & 0xff, (h5l >> 16) & 0xff, (h5l >> 8) & 0xff, h5l & 0xff);
                    }
                    if (bits === 512) {
                        arr.push((h6h >> 24) & 0xff, (h6h >> 16) & 0xff, (h6h >> 8) & 0xff, h6h & 0xff, (h6l >> 24) & 0xff, (h6l >> 16) & 0xff, (h6l >> 8) & 0xff, h6l & 0xff, (h7h >> 24) & 0xff, (h7h >> 16) & 0xff, (h7h >> 8) & 0xff, h7h & 0xff, (h7l >> 24) & 0xff, (h7l >> 16) & 0xff, (h7l >> 8) & 0xff, h7l & 0xff);
                    }
                    return arr;
                }
                array() {
                    return this.digest();
                }
                arrayBuffer() {
                    this.finalize();
                    const bits = this.#bits;
                    const buffer = new ArrayBuffer(bits / 8);
                    const dataView = new DataView(buffer);
                    dataView.setUint32(0, this.#h0h);
                    dataView.setUint32(4, this.#h0l);
                    dataView.setUint32(8, this.#h1h);
                    dataView.setUint32(12, this.#h1l);
                    dataView.setUint32(16, this.#h2h);
                    dataView.setUint32(20, this.#h2l);
                    dataView.setUint32(24, this.#h3h);
                    if (bits >= 256) {
                        dataView.setUint32(28, this.#h3l);
                    }
                    if (bits >= 384) {
                        dataView.setUint32(32, this.#h4h);
                        dataView.setUint32(36, this.#h4l);
                        dataView.setUint32(40, this.#h5h);
                        dataView.setUint32(44, this.#h5l);
                    }
                    if (bits === 512) {
                        dataView.setUint32(48, this.#h6h);
                        dataView.setUint32(52, this.#h6l);
                        dataView.setUint32(56, this.#h7h);
                        dataView.setUint32(60, this.#h7l);
                    }
                    return buffer;
                }
            };
            exports_104("Sha512", Sha512);
            HmacSha512 = class HmacSha512 extends Sha512 {
                constructor(secretKey, bits = 512, sharedMemory = false) {
                    super(bits, sharedMemory);
                    let key;
                    if (secretKey instanceof ArrayBuffer) {
                        key = new Uint8Array(secretKey);
                    }
                    else if (typeof secretKey === "string") {
                        const bytes = [];
                        const length = secretKey.length;
                        let index = 0;
                        let code;
                        for (let i = 0; i < length; ++i) {
                            code = secretKey.charCodeAt(i);
                            if (code < 0x80) {
                                bytes[index++] = code;
                            }
                            else if (code < 0x800) {
                                bytes[index++] = 0xc0 | (code >> 6);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else if (code < 0xd800 || code >= 0xe000) {
                                bytes[index++] = 0xe0 | (code >> 12);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else {
                                code =
                                    0x10000 +
                                        (((code & 0x3ff) << 10) | (secretKey.charCodeAt(++i) & 0x3ff));
                                bytes[index++] = 0xf0 | (code >> 18);
                                bytes[index++] = 0x80 | ((code >> 12) & 0x3f);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                        }
                        key = bytes;
                    }
                    else {
                        key = secretKey;
                    }
                    if (key.length > 128) {
                        key = new Sha512(bits, true).update(key).array();
                    }
                    const oKeyPad = [];
                    const iKeyPad = [];
                    for (let i = 0; i < 128; ++i) {
                        const b = key[i] || 0;
                        oKeyPad[i] = 0x5c ^ b;
                        iKeyPad[i] = 0x36 ^ b;
                    }
                    this.update(iKeyPad);
                    this.#inner = true;
                    this.#bits = bits;
                    this.#oKeyPad = oKeyPad;
                    this.#sharedMemory = sharedMemory;
                }
                #inner;
                #bits;
                #oKeyPad;
                #sharedMemory;
                finalize() {
                    super.finalize();
                    if (this.#inner) {
                        this.#inner = false;
                        const innerHash = this.array();
                        super.init(this.#bits, this.#sharedMemory);
                        this.update(this.#oKeyPad);
                        this.update(innerHash);
                        super.finalize();
                    }
                }
            };
            exports_104("HmacSha512", HmacSha512);
        }
    };
});
System.register("https://deno.land/x/djwt/create", ["https://deno.land/x/djwt/base64/base64url", "https://deno.land/std@v0.56.0/encoding/hex", "https://deno.land/std@v0.56.0/hash/sha256", "https://deno.land/std@v0.56.0/hash/sha512"], function (exports_105, context_105) {
    "use strict";
    var base64url_ts_2, hex_ts_1, sha256_ts_1, sha512_ts_1;
    var __moduleName = context_105 && context_105.id;
    // Helper function: setExpiration()
    // returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
    function setExpiration(exp) {
        return (exp instanceof Date ? exp : new Date(exp)).getTime();
    }
    exports_105("setExpiration", setExpiration);
    function convertHexToBase64url(input) {
        return base64url_ts_2.convertUint8ArrayToBase64url(hex_ts_1.decodeString(input));
    }
    exports_105("convertHexToBase64url", convertHexToBase64url);
    function convertStringToBase64url(input) {
        return base64url_ts_2.convertUint8ArrayToBase64url(new TextEncoder().encode(input));
    }
    exports_105("convertStringToBase64url", convertStringToBase64url);
    function makeSigningInput(header, payload) {
        return `${convertStringToBase64url(JSON.stringify(header))}.${convertStringToBase64url(JSON.stringify(payload || ""))}`;
    }
    function encrypt(alg, key, msg) {
        function assertNever(alg) {
            throw new RangeError("no matching crypto algorithm in the header: " + alg);
        }
        switch (alg) {
            case "none":
                return null;
            case "HS256":
                return new sha256_ts_1.HmacSha256(key).update(msg).toString();
            case "HS512":
                return new sha512_ts_1.HmacSha512(key).update(msg).toString();
            default:
                assertNever(alg);
        }
    }
    function makeSignature(alg, key, input) {
        const encryptionInHex = encrypt(alg, key, input);
        return encryptionInHex ? convertHexToBase64url(encryptionInHex) : "";
    }
    exports_105("makeSignature", makeSignature);
    function makeJwt({ key, header, payload }) {
        try {
            const signingInput = makeSigningInput(header, payload);
            return `${signingInput}.${makeSignature(header.alg, key, signingInput)}`;
        }
        catch (err) {
            err.message = `Failed to create JWT: ${err.message}`;
            throw err;
        }
    }
    exports_105("makeJwt", makeJwt);
    return {
        setters: [
            function (base64url_ts_2_1) {
                base64url_ts_2 = base64url_ts_2_1;
            },
            function (hex_ts_1_1) {
                hex_ts_1 = hex_ts_1_1;
            },
            function (sha256_ts_1_1) {
                sha256_ts_1 = sha256_ts_1_1;
            },
            function (sha512_ts_1_1) {
                sha512_ts_1 = sha512_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/user/IUser", [], function (exports_106, context_106) {
    "use strict";
    var __moduleName = context_106 && context_106.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/config/validation", [], function (exports_107, context_107) {
    "use strict";
    var requiredValues, validateConfig;
    var __moduleName = context_107 && context_107.id;
    return {
        setters: [],
        execute: function () {
            /**
             * Walkaround
             * interfaces are not available in runtime
             * @substitution IConfigJWT, ClientConfig, IConfigServer
             */
            exports_107("requiredValues", requiredValues = {
                jwtConfig: {
                    header: "string",
                    schema: "string",
                    secretKey: "string",
                    expirationTime: "number",
                    type: "string",
                    alg: "string"
                },
                mysqlConfig: {
                    hostname: "string",
                    port: "number",
                    username: "string",
                    password: "string",
                    db: "string",
                },
                serverConfig: {
                    hostname: "string",
                    port: "number"
                }
            });
            /**
             * Check if object has all necessary values with right type
             * @param requiredProperties
             * @param configObj
             * @param name
             */
            exports_107("validateConfig", validateConfig = (requiredProperties, configObj, name = "unknown") => {
                for (const key in requiredProperties) {
                    if (!configObj.hasOwnProperty(key))
                        throw `Key "${key}" not found in configuration ${name}.`;
                    if (typeof configObj[key] !== requiredProperties[key])
                        throw `Key "${key}" is not type of ${requiredProperties[key]} in configuration ${name}.`;
                }
            });
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/config/IConfig", [], function (exports_108, context_108) {
    "use strict";
    var __moduleName = context_108 && context_108.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/config/config", ["file:///home/jax/www/denoAPI2/src/controllers/config/validation"], function (exports_109, context_109) {
    "use strict";
    var validation_ts_1, decoder, content, config, serverConfig, mysqlConfig, jwtConfig;
    var __moduleName = context_109 && context_109.id;
    return {
        setters: [
            function (validation_ts_1_1) {
                validation_ts_1 = validation_ts_1_1;
            }
        ],
        execute: function () {
            /** Load config.json file and parse it */
            decoder = new TextDecoder("utf-8");
            content = decoder.decode(Deno.readFileSync("./config.json"));
            config = JSON.parse(content);
            /**
             * validate values through requiredValues variable
             * because interfaces are not available in runtime
             */
            for (const [key, configSection] of Object.entries(config))
                validation_ts_1.validateConfig(validation_ts_1.requiredValues[key], configSection, key);
            /** assing and export */
            exports_109("serverConfig", serverConfig = config.serverConfig);
            exports_109("mysqlConfig", mysqlConfig = config.mysqlConfig);
            exports_109("jwtConfig", jwtConfig = config.jwtConfig);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/user/UserController", ["https://deno.land/x/bcrypt/mod", "https://deno.land/x/dso@v1.0.0/mod", "https://deno.land/x/nanoid/mod", "file:///home/jax/www/denoAPI2/src/controllers/user/UserModel", "https://deno.land/x/djwt/create", "file:///home/jax/www/denoAPI2/src/controllers/config/config"], function (exports_110, context_110) {
    "use strict";
    var bcrypt, mod_ts_11, mod_ts_12, UserModel_ts_1, create_ts_1, config_ts_1, UserController;
    var __moduleName = context_110 && context_110.id;
    return {
        setters: [
            function (bcrypt_2) {
                bcrypt = bcrypt_2;
            },
            function (mod_ts_11_1) {
                mod_ts_11 = mod_ts_11_1;
            },
            function (mod_ts_12_1) {
                mod_ts_12 = mod_ts_12_1;
            },
            function (UserModel_ts_1_1) {
                UserModel_ts_1 = UserModel_ts_1_1;
            },
            function (create_ts_1_1) {
                create_ts_1 = create_ts_1_1;
            },
            function (config_ts_1_1) {
                config_ts_1 = config_ts_1_1;
            }
        ],
        execute: function () {
            UserController = class UserController {
                constructor() {
                    /**
                     * Password is being hashed during this function
                     * @param values
                     */
                    this.create = async (values) => {
                        const password = this.hashPassword(values.password);
                        const user = {
                            ...values,
                            hash: mod_ts_12.default(),
                            password,
                        };
                        const id = await UserModel_ts_1.userModel.insert(user);
                        return id;
                    };
                    /**
                     * Update user by `id`. Requires whole IUser values.
                     * @param id
                     * @param values
                     */
                    this.delete = async (id) => !!await UserModel_ts_1.userModel.delete(mod_ts_11.Where.from({ id: id }));
                    /**
                     * Fetch one row by `id` column
                     * @param id
                     */
                    this.get = (id) => UserModel_ts_1.userModel.findOne(mod_ts_11.Where.from({ id: id }));
                    /**
                     * Fetch one row by `hash` column
                     * @param hash
                     */
                    this.getByHash = (hash) => UserModel_ts_1.userModel.findOne(mod_ts_11.Where.from({ hash: hash }));
                    /**
                     * Synchronised hash input string with bcrypt
                     * @param password
                     */
                    this.hashPassword = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8));
                }
                /**
                 * Update user by `id`. Requires whole IUser values.
                 * @param id
                 * @param values
                 */
                async update(id, values) {
                    const user = this.get(id);
                    if (user === undefined)
                        throw 'User not found';
                    await UserModel_ts_1.userModel.update(values, mod_ts_11.Where.from({ id: id }));
                    return user;
                }
                /**
                 * Main function of auth server
                 * @param username
                 * @param password
                 * @param namespace
                 */
                async authenticate(username, password, namespace) {
                    const user = await UserModel_ts_1.userModel.findOne(mod_ts_11.Where.from({ username: username, namespace: namespace }));
                    if (user === undefined)
                        return false;
                    if (user.hash === undefined)
                        return false;
                    if (user.password === undefined)
                        return false;
                    if (!(bcrypt.compareSync(password, user.password)))
                        return false;
                    return this.generateJwt(user.hash);
                }
                /**
                 * Generates JSON web token with `id` and `exp` (expiration) in Payload
                 * @param hash
                 */
                generateJwt(hash) {
                    const payload = { hash, exp: create_ts_1.setExpiration(new Date().getTime() + config_ts_1.jwtConfig.expirationTime) };
                    const header = {
                        alg: config_ts_1.jwtConfig.alg,
                        typ: config_ts_1.jwtConfig.type,
                    };
                    return create_ts_1.makeJwt({ header, payload, key: config_ts_1.jwtConfig.secretKey });
                }
            };
            exports_110("UserController", UserController);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/cli/createUser", ["https://deno.land/x/dso@v1.0.0/mod", "https://deno.land/x/ask/mod", "file:///home/jax/www/denoAPI2/src/controllers/user/UserModel"], function (exports_111, context_111) {
    "use strict";
    var mod_ts_13, mod_ts_14, UserModel_ts_2, canCreateUser, createUser;
    var __moduleName = context_111 && context_111.id;
    return {
        setters: [
            function (mod_ts_13_1) {
                mod_ts_13 = mod_ts_13_1;
            },
            function (mod_ts_14_1) {
                mod_ts_14 = mod_ts_14_1;
            },
            function (UserModel_ts_2_1) {
                UserModel_ts_2 = UserModel_ts_2_1;
            }
        ],
        execute: function () {
            /**
             * Check if user with `username` and `namespace` exists
             * @param username
             * @param namespace
             */
            canCreateUser = async (username, namespace) => {
                const user = await UserModel_ts_2.userModel.findOne(mod_ts_13.Where.from({ username: username, namespace: namespace }));
                if (user === undefined)
                    return true;
                console.info(`User with username "${username}" in namespace "${namespace}" already exists.`);
                return false;
            };
            /**
             * Prompt wizard for user creation
             */
            createUser = (controller) => async () => {
                const ask = new mod_ts_14.default();
                const userData = await ask.prompt([
                    { name: 'username', type: 'input', message: 'Username:' },
                    { name: 'namespace', type: 'input', message: 'Namespace:' },
                    { name: 'password', type: 'input', message: 'Password:' }
                ]);
                if (!(await canCreateUser(userData.username, userData.domain)))
                    return;
                await controller.create({
                    username: userData.username,
                    password: userData.password,
                    namespace: userData.namespace
                });
                console.info(`Created user "${userData.username}" in namespace ${userData.namespace}.`);
            };
            exports_111("default", createUser);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/cli/askValidation", [], function (exports_112, context_112) {
    "use strict";
    var validateUserHash;
    var __moduleName = context_112 && context_112.id;
    return {
        setters: [],
        execute: function () {
            /**
             * Check if user with hash exists
             * @param controller
             */
            validateUserHash = (controller) => async (value) => {
                const user = !!await controller.getByHash(value);
                if (!user)
                    console.info(`User with hash ${value} doesn't exist`);
                return !!await controller.getByHash(value);
            };
            exports_112("validateUserHash", validateUserHash);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/cli/updateUserPassword", ["https://deno.land/x/ask/mod", "file:///home/jax/www/denoAPI2/src/cli/askValidation"], function (exports_113, context_113) {
    "use strict";
    var mod_ts_15, askValidation_ts_1, updateUserPassword;
    var __moduleName = context_113 && context_113.id;
    return {
        setters: [
            function (mod_ts_15_1) {
                mod_ts_15 = mod_ts_15_1;
            },
            function (askValidation_ts_1_1) {
                askValidation_ts_1 = askValidation_ts_1_1;
            }
        ],
        execute: function () {
            /**
             * Prompt wizard for user password change.
             * Asks for user hash and new password. Hashes password before insert
             */
            updateUserPassword = (controller) => async () => {
                const ask = new mod_ts_15.default();
                const data = await ask.prompt([
                    { name: 'hash', type: 'input', message: 'User hash:', validate: askValidation_ts_1.validateUserHash(controller) },
                    { name: 'password', type: 'input', message: 'New password:' },
                ]);
                const user = await controller.getByHash(data.hash);
                if (user === undefined || !user.id)
                    throw `User with name ${data.name} doesn't exist.`;
                await controller.update(user.id, { password: controller.hashPassword(data.password) });
                console.info("User password has been updated.");
            };
            exports_113("default", updateUserPassword);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/controllers/database/database", ["https://deno.land/x/dso@v1.0.0/mod"], function (exports_114, context_114) {
    "use strict";
    var mod_ts_16, connectMySQL;
    var __moduleName = context_114 && context_114.id;
    return {
        setters: [
            function (mod_ts_16_1) {
                mod_ts_16 = mod_ts_16_1;
            }
        ],
        execute: function () {
            /**
             * Connects MySQL database.
             * @caution Drops and recreates whole database If @param sync is true!
             * @param config
             * @param sync
             */
            connectMySQL = async (config, sync = false) => {
                await mod_ts_16.dso.connect(config);
                await mod_ts_16.dso.sync(sync);
            };
            exports_114("connectMySQL", connectMySQL);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/cli/deleteUser", ["https://deno.land/x/ask/mod", "file:///home/jax/www/denoAPI2/src/cli/askValidation"], function (exports_115, context_115) {
    "use strict";
    var mod_ts_17, askValidation_ts_2, deleteUser;
    var __moduleName = context_115 && context_115.id;
    return {
        setters: [
            function (mod_ts_17_1) {
                mod_ts_17 = mod_ts_17_1;
            },
            function (askValidation_ts_2_1) {
                askValidation_ts_2 = askValidation_ts_2_1;
            }
        ],
        execute: function () {
            /**
             * Asks for user hash and new password. Hashes password before insert
             */
            deleteUser = (controller) => async () => {
                const ask = new mod_ts_17.default();
                const data = await ask.prompt([
                    { name: 'hash', type: 'input', message: 'User hash:', validate: askValidation_ts_2.validateUserHash(controller) },
                ]);
                const user = await controller.getByHash(data.hash);
                if (user === undefined || !user.id)
                    throw `User with name ${data.name} doesn't exist.`;
                await controller.delete(user.id);
                console.info("User has been deleted.");
            };
            exports_115("default", deleteUser);
        }
    };
});
System.register("file:///home/jax/www/denoAPI2/src/cli", ["https://deno.land/std/flags/mod", "file:///home/jax/www/denoAPI2/src/cli/createUser", "file:///home/jax/www/denoAPI2/src/cli/updateUserPassword", "file:///home/jax/www/denoAPI2/src/controllers/database/database", "file:///home/jax/www/denoAPI2/src/controllers/user/UserController", "file:///home/jax/www/denoAPI2/src/cli/deleteUser", "file:///home/jax/www/denoAPI2/src/controllers/config/config"], function (exports_116, context_116) {
    "use strict";
    var mod_ts_18, createUser_ts_1, updateUserPassword_ts_1, database_ts_1, UserController_ts_1, deleteUser_ts_1, config_ts_2, args, methods, processArgs;
    var __moduleName = context_116 && context_116.id;
    return {
        setters: [
            function (mod_ts_18_1) {
                mod_ts_18 = mod_ts_18_1;
            },
            function (createUser_ts_1_1) {
                createUser_ts_1 = createUser_ts_1_1;
            },
            function (updateUserPassword_ts_1_1) {
                updateUserPassword_ts_1 = updateUserPassword_ts_1_1;
            },
            function (database_ts_1_1) {
                database_ts_1 = database_ts_1_1;
            },
            function (UserController_ts_1_1) {
                UserController_ts_1 = UserController_ts_1_1;
            },
            function (deleteUser_ts_1_1) {
                deleteUser_ts_1 = deleteUser_ts_1_1;
            },
            function (config_ts_2_1) {
                config_ts_2 = config_ts_2_1;
            }
        ],
        execute: function () {
            args = mod_ts_18.parse(Deno.args);
            methods = {
                "createUser": createUser_ts_1.default,
                "updateUserPassword": updateUserPassword_ts_1.default,
                "deleteUser": deleteUser_ts_1.default
            };
            /**
             * Processes command line arguments
             */
            processArgs = async () => {
                if (!args.m)
                    throw `Method arg -m is required`;
                const methodName = args.m;
                const methodFromArgs = methods[methodName];
                if (!methodFromArgs)
                    throw `Unknown method "${methodName}"`;
                await database_ts_1.connectMySQL(config_ts_2.mysqlConfig);
                const controller = new UserController_ts_1.UserController();
                await methodFromArgs(controller)();
            };
            try {
                processArgs()
                    .then(() => console.info("Finished successfully."))
                    .catch((err) => console.info("Finished with error: ", err));
            }
            catch (err) {
                console.error(`Something is wrong: ${err}`);
            }
        }
    };
});

__instantiate("file:///home/jax/www/denoAPI2/src/cli");
