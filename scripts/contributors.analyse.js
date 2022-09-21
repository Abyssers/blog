const { resolve } = require("node:path");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { load, dump } = require("js-yaml");
const { jit } = require("@abysser/jit");
const { isInvokedByHexo, isObj, isArr, hasOwn, isEmpty, intersectionOf, unionOf } = require("./utils");

if (isInvokedByHexo()) return;

const cwd = process.cwd();
const { platform } = process;
const args = process.argv.slice(2);
const options = {
    write: args.some(arg => /^(--write|-w)$/.test(arg)), // whether to write the result back
    add: args.some(arg => /^(--add|-a)$/.test(arg)), // whether to add target file to the staged
};
const target = resolve(cwd, "./_config.abyrus.yml");

if (existsSync(target)) {
    const configs = load(readFileSync(target, { encoding: "utf8" }));
    if (isObj(configs) && configs?.widgets && isArr(configs.widgets)) {
        const idx = configs.widgets.findIndex(widget => widget?.type === "profile");
        if (idx !== -1) {
            const profile = configs.widgets[idx];
            if (profile?.contributors && isArr(profile.contributors)) {
                const repo = jit.repo(resolve(cwd));
                const { formatted } = repo.do("shortlog", ["HEAD", "-sne"]);
                if (formatted) {
                    /* groups: { keys: string[]; summary: number; }[] */
                    const groups = formatted.reduce((groups, contributor) => {
                        let flag = false;
                        const { name, email, summary } = contributor;
                        const ghname = /(^\d+\+)?\S+@users.noreply.github.com$/.test(email)
                            ? email.replace(/^\d+\+/, "").replace(/@users.noreply.github.com$/, "")
                            : undefined;
                        const keys = [name, email, ...(ghname ? [ghname] : [])];
                        groups = groups.map(group => {
                            if (!isEmpty(intersectionOf(group.keys, keys))) {
                                group.keys = unionOf(group.keys, keys);
                                group.summary += summary;
                                flag = true;
                            }
                            return group;
                        });
                        if (!flag) groups.push({ keys, summary });
                        return groups;
                    }, []);
                    profile.contributors = profile.contributors
                        .filter(contributor => isObj(contributor) && hasOwn(contributor, "name"))
                        .map(contributor => {
                            const group = groups.find(group => group.keys.includes(contributor["name"]));
                            contributor["contributions"] = group ? group.summary : 0;
                            return contributor;
                        })
                        .sort((a, b) => b["contributions"] - a["contributions"]);
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
