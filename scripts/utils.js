"use strict";

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

function isInstOf(o, C) {
    if (isNil(o) && !isFunc(C)) return false;
    let proto = Object.getPrototypeOf(o);
    while (true) {
        if (!proto) return false;
        if (proto === C.prototype) return true;
        proto = Object.getPrototypeOf(o);
    }
}

function has(o, k) {
    return k in Object(o);
}

function hasOwn(o, k) {
    return !isNil(o) && Object.prototype.hasOwnProperty.call(o, k);
}

module.exports = {
    /* Type Checking */
    isNum,
    isInt,
    isFlt,
    isStr,
    isObj,
    isArr,
    isFunc,
    isNull,
    isUndef,
    isNil,
    isInstOf,
    /* Property Checking */
    has,
    hasOwn,
};
