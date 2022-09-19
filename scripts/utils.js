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

function isEmpty(o) {
    if (isArr(o) || isStr(o)) return o.length === 0;
    if (isObj(o)) return isEmpty(Object.keys(o)) === 0;
    return false;
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

module.exports = {
    /* Type Checking */
    isNum,
    isInt,
    isFlt,
    isStr,
    isObj,
    isArr,
    isFunc,
    isEmpty,
    isNull,
    isUndef,
    isNil,
    isInstOf,
    /* Property Checking */
    has,
    hasOwn,
    /* Element Getter */
    fisrtOf,
    lastOf,
    randomOf,
};
