const { resolve } = require("node:path");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { program } = require("commander");
const { load, dump } = require("js-yaml");
const { isObj, isArr } = require("./utils");
const { isInvokedByHexo, getRoot, getRepo, getContributors } = require("./service");

if (!isInvokedByHexo()) {
    program
        .option("-w, --write", "whether to write the result back", false)
        .option("-a, --add", "whether to add target file to the staged", false)
        .parse(process.argv);

    const opts = program.opts();
    const { platform } = process;
    const target = resolve(getRoot(), "_config.abyrus.yml");

    if (existsSync(target)) {
        const cfgs = load(readFileSync(target, { encoding: "utf8" }));
        if (!isObj(cfgs) || !cfgs?.widgets || !isArr(cfgs.widgets)) return;
        const profile = cfgs.widgets.find(widget => widget?.type === "profile");
        if (!profile?.contributors || !isArr(profile.contributors)) return;

        profile.contributors = getContributors();
        if (opts.write) {
            writeFileSync(target, dump(cfgs, { indent: 4, quotingType: '"' }), { encoding: "utf8" });
            switch (platform) {
                case "win32":
                    spawnSync("npx.cmd", ["prettier", "--write", target], { cwd: getRoot() });
                    break;
                default:
                    spawnSync("npx", ["prettier", "--write", target], { cwd: getRoot() });
                    break;
            }
            if (opts.add) {
                getRepo().do("add", [target]);
            }
        }
        log(profile.contributors);
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
