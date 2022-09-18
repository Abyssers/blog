const { resolve } = require("node:path");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { load, dump } = require("js-yaml");
const { jit } = require("@abysser/jit");

const cwd = process.cwd();
const { platform } = process;
const args = process.argv.slice(2);
const options = Object.assign(
    { this: false, write: false, add: false },
    {
        this: args.some(arg => /^(--this|-t)$/.test(arg)), // whether to reckon this commitment in
        write: args.some(arg => /^(--write|-w)$/.test(arg)), // whether to write the result back
        add: args.some(arg => /^(--add|-a)$/.test(arg)), // whether to add target file to the staged
    }
);
const target = resolve(cwd, "./_config.abyrus.yml");

if (existsSync(target)) {
    const { hasOwnProperty, toString: typeOf } = Object.prototype;
    const has = (o, k) => hasOwnProperty.call(o, k);
    const isObj = o => typeOf.call(o) === "[object Object]";
    const isArr = o => typeOf.call(o) === "[object Array]";
    const configs = load(readFileSync(target, { encoding: "utf8" }));
    if (isObj(configs) && configs?.widgets && isArr(configs.widgets)) {
        const idx = configs.widgets.findIndex(widget => widget?.type === "profile");
        if (idx !== -1) {
            const profile = configs.widgets[idx];
            if (profile?.contributors && isArr(profile.contributors)) {
                const repo = jit.repo(resolve(cwd));
                const { formatted } = repo.do("log", ["--pretty=format:%an"]);
                if (formatted) {
                    const commits = formatted.reduce((sets, curr) => {
                        if (has(sets, curr)) {
                            sets[curr]++;
                        } else {
                            sets[curr] = options.this && repo.user.name === curr ? 1 : 0;
                        }
                        return sets;
                    }, {});
                    profile.contributors = profile.contributors
                        .filter(contributor => isObj(contributor) && has(contributor, "name"))
                        .map(contributor => {
                            contributor["contributions"] = Object.keys(commits).includes(contributor["name"])
                                ? commits[contributor["name"]]
                                : 0;
                            return contributor;
                        })
                        .sort((a, b) => b["contributions"] - a["contributions"] || 0);
                    if (options.write) {
                        writeFileSync(target, dump(configs, { indent: 4, quotingType: '"' }), { encoding: "utf8" });
                        switch (platform) {
                            case "win32":
                                spawnSync("npx.cmd", ["prettier", "--write", target], { cwd });
                                break;
                            default:
                                spawnSync("npx", ["prettier", "--write", target], { cwd });
                                break;
                        }
                        if (options.add) {
                            repo.do("add", [target]);
                        }
                    }
                    log(profile.contributors);
                }
            }
        }
    }
}

function log(contributors) {
    if (contributors.length <= 0) return;
    const spaces = number => new Array(number).fill(" ").join("");
    const dashes = number => new Array(number).fill("-").join("");
    const widths = contributors.concat({ name: "name", contributions: "contributions" }).reduce(
        (max, contributor) => {
            const { name, contributions } = contributor;
            name.length > max[0] && (max[0] = name.length);
            String(contributions).length > max[1] && (max[1] = String(contributions).length);
            return max;
        },
        [0, 0]
    );
    const cells = contributors.map(contributor => {
        const { name, contributions } = contributor;
        return `| ${name + spaces(widths[0] - name.length)} | ${
            contributions + spaces(widths[1] - String(contributions).length)
        } |\n`;
    });
    const head = `${dashes(cells[0].trim().length)}\n| name${spaces(widths[0] - 4)} | contributions${spaces(
        widths[1] - 13
    )} |\n`;
    console.log(`${head}${dashes(cells[0].trim().length)}\n${cells.join("")}${dashes(cells[0].trim().length)}`);
}
