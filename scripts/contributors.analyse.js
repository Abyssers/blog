const { resolve } = require("node:path");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { load, dump } = require("js-yaml");
const { jit } = require("@abysser/jit");

const cwd = process.cwd();
const args = process.argv.slice(2);
const { platform } = process;
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
                            sets[curr] = 0;
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
                    if (args.some(arg => /^(--write|-w)$/.test(arg))) {
                        profile.contributors = profile.contributors.map(contributor => {
                            if (contributor["name"] === repo.user.name) {
                                contributor["contributions"] += 1;
                            }
                            return contributor;
                        });
                        writeFileSync(target, dump(configs, { indent: 4, quotingType: '"' }), { encoding: "utf8" });
                        switch (platform) {
                            case "win32":
                                spawnSync("npx.cmd", ["prettier", "--write", target], { cwd });
                                break;
                            default:
                                spawnSync("npx", ["prettier", "--write", target], { cwd });
                                break;
                        }
                        log(
                            profile.contributors.map(contributor => {
                                if (contributor["name"] === repo.user.name) {
                                    contributor["contributions"] += " *";
                                }
                                return contributor;
                            })
                        );
                    } else {
                        log(profile.contributors);
                    }
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
