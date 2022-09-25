"use strict";

const { isAbsolute, resolve, sep } = require("node:path");
const { existsSync, readFileSync } = require("node:fs");
const { load } = require("js-yaml");
const { jit } = require("@abysser/jit");
const { isObj, isArr, isEmpty, hasOwn, intersectionOf, unionOf } = require("../utils");

/**
 * Determine whether the script is executed by the user or invoked by hexo
 */
function isInvokedByHexo() {
    return isAbsolute(process.argv[1]) && process.argv[1].split(sep).slice(-2).join("/").endsWith("bin/hexo");
}

function getRoot() {
    return resolve(__dirname, "../../");
}

function getRepo() {
    return jit.repo(getRoot());
}

function getChangedPaths() {
    return (getRepo().do("diff", ["--name-only"]).formatted || []).map(path => resolve(getRoot(), path));
}

function getStagedPaths() {
    return (getRepo().do("diff", ["--cached", "--name-only"]).formatted || []).map(path => resolve(getRoot(), path));
}

/**
 * Get contributors
 * @param {string | undefined} path the path of a file or a directory
 * @return {any[]} contributors of the path (return contributors of all the repo if path is undefined)
 */
function getContributors(path = undefined) {
    const configPath = resolve(getRoot(), "_config.abyrus.yml");
    if (!existsSync(configPath)) return;
    const cfgs = load(readFileSync(configPath, { encoding: "utf8" }));
    if (!isObj(cfgs) || !cfgs?.widgets || !isArr(cfgs.widgets)) return [];
    const { contributors } = cfgs.widgets.find(widget => widget?.type === "profile") || {};
    if (!contributors || !isArr(contributors)) return [];
    const repo = getRepo();
    const { formatted } = repo.do("shortlog", ["HEAD", "-sne", ...(path ? ["--", path] : [])]);
    if (!formatted) return [];
    /* ctrs: { indexes: string[]; summary: number; }[] */
    const ctrs = formatted.reduce((ctrs, ctr) => {
        let flag = false;
        const { name, email, summary } = ctr;
        const ghname = /(^\d+\+)?\S+@users.noreply.github.com$/.test(email)
            ? email.replace(/^\d+\+/, "").replace(/@users.noreply.github.com$/, "")
            : undefined;
        const indexes = unionOf([name, email, ...(ghname ? [ghname] : [])]);
        ctrs = ctrs.map(ctr => {
            if (!isEmpty(intersectionOf(ctr.indexes, indexes))) {
                ctr.indexes = unionOf(ctr.indexes, indexes);
                ctr.summary += summary;
                flag = true;
            }
            return ctr;
        });
        if (!flag) ctrs.push({ indexes, summary });
        return ctrs;
    }, []);
    return (
        contributors
            .filter(contributor => isObj(contributor) && hasOwn(contributor, "name"))
            .map(contributor => {
                contributor["contributions"] =
                    ctrs.find(ctr => ctr.indexes.includes(contributor["name"]))?.summary || 0;
                return contributor;
            })
            // .filter(contributor => contributor["contributions"] !== 0)
            .sort((a, b) => b["contributions"] - a["contributions"])
    );
}

module.exports = {
    isInvokedByHexo,
    getRoot,
    getRepo,
    getChangedPaths,
    getStagedPaths,
    getContributors,
};
