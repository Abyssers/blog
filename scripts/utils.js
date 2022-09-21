"use strict";

const { isAbsolute, sep } = require("path");

/**
 * Determine whether the script is executed by the user or invoked by hexo
 */
function isInvokedByHexo() {
    return isAbsolute(process.argv[1]) && process.argv[1].split(sep).slice(-2).join("/").endsWith("bin/hexo");
}

function isNum(o) {
    /**
     * To Avoid:
     * typeof NaN === "number"
     * Object.prototype.toString.call(NaN) === "[object Number]"
     */
    return o === +o;
}

function isInt(o) {
    return isNum(o) && o % 1 === 0;
}

function isFlt(o) {
    return isNum(o) && o % 1 !== 0;
}

function isBool(o) {
    /**
     * To Avoid: typeof new Boolean(true) === "object"
     */
    return Object.prototype.toString.call(o) === "[object Boolean]";
}

function isStr(o) {
    /**
     * To Avoid: typeof new String("xxx") === "object"
     */
    return Object.prototype.toString.call(o) === "[object String]";
}

function isObj(o) {
    /**
     * Remark: for plain object
     */
    return Object.prototype.toString.call(o) === "[object Object]";
}

function isArr(o) {
    /**
     * Remark: for plain array
     */
    return Object.prototype.toString.call(o) === "[object Array]";
}

function isFunc(o) {
    /**
     * To Avoid: some DOM Object
     */
    return typeof o === "function" && !isNum(o.nodeType);
}

function isNull(o) {
    return o === null;
}

function isUndef(o) {
    return o === undefined;
}

function isNil(o) {
    return isNull(o) || isUndef(o);
}

function isInstOf(o, Class) {
    if (isNil(o) && !isFunc(Class)) return false;
    let proto = Object.getPrototypeOf(o);
    while (true) {
        if (!proto) return false;
        if (proto === Class.prototype) return true;
        proto = Object.getPrototypeOf(o);
    }
}

function isEmpty(o) {
    if (isArr(o) || isStr(o)) return o.length === 0;
    if (isObj(o)) return isEmpty(Object.keys(o)) === 0;
    return false;
}

function isEqual(a, b) {
    return a == b;
}

function isStrictEqual(a, b) {
    return a === b;
}

function isDeepEqual(a, b) {
    /**
     * To Avoid:
     * true !== new Boolean(true)
     * "xxx" !== new String("xxx")
     */
    if ((isBool(a) && isBool(b)) || (isStr(a) && isStr(b))) return isEqual(a, b);
    if (isObj(a) && isObj(b)) {
        const keys = Object.keys(a);
        if (!isDeepEqual(keys, Object.keys(b))) return false;
        for (let i = keys.length - 1; i >= 0; i--) {
            if (!isDeepEqual(a[keys[i]], b[keys[i]])) return false;
        }
        return true;
    }
    if (isArr(a) && isArr(b)) {
        if (a.length !== b.length) return false;
        for (let i = a.length - 1; i >= 0; i--) {
            if (!isDeepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    return isStrictEqual(a, b);
}

function has(o, ...keys) {
    return keys.every(k => k in Object(o));
}

function hasOwn(o, ...keys) {
    return !isNil(o) && keys.every(k => Object.prototype.hasOwnProperty.call(o, k));
}

function fisrtOf(o) {
    if (isArr(o)) return o[0];
    if (isStr(o)) return o.at(0);
    return undefined;
}

function lastOf(o) {
    if (isArr(o)) return o[o.length - 1];
    if (isStr(o)) return o.at(o.length - 1);
    return undefined;
}

function randomOf(o) {
    if (isArr(o)) return o[Math.floor(Math.random() * o.length)];
    if (isStr(o)) return randomOf(o.split(""));
    return undefined;
}

function intersectionOf(...arrs) {
    return arrs.reduce((intersection, arr) => {
        return intersection.filter(itemA => [...(isArr(arr) ? arr : [arr])].some(itemB => isDeepEqual(itemA, itemB)));
    }, arrs[0]);
}

function unionOf(...arrs) {
    const sylloge = arrs.reduce((total, arr) => [...total, ...(isArr(arr) ? arr : [arr])], []);
    return sylloge.filter((itemA, idx) => sylloge.findIndex(itemB => isDeepEqual(itemA, itemB)) === idx);
}

module.exports = {
    isInvokedByHexo,
    /* Type Checking */
    isNum,
    isInt,
    isFlt,
    isBool,
    isStr,
    isObj,
    isArr,
    isFunc,
    isNull,
    isUndef,
    isNil,
    isInstOf,
    /* Element Checking */
    isEmpty,
    isEqual,
    isStrictEqual,
    isDeepEqual,
    /* Property Checking */
    has,
    hasOwn,
    /* Element Getter */
    fisrtOf,
    lastOf,
    randomOf,
    intersectionOf,
    unionOf,
};
