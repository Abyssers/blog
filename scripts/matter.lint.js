const { extname, relative, resolve } = require("node:path");
const { existsSync, statSync, readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { program, InvalidArgumentError } = require("commander");
const { read, stringify } = require("gray-matter");
const { isEmpty, isInt } = require("./utils");
const { isInvokedByHexo, getRoot, getRepo, getContributors } = require("./service");

if (!isInvokedByHexo()) {
    program
        .option("--now", "whether to use the current running time of the script as the update time", false)
        .option("--staged", "whether to look for .commit to get a list of staged files as targets", false)
        .option(
            "--includes <paths>",
            "paths of file or directory splited by comma",
            value => {
                return value.split(",").map(path => resolve(getRoot(), path));
            },
            [getRoot()]
        )
        .option(
            "-bl, --blank-lines <number>",
            "how many blank lines are left between front-matter and content",
            value => {
                if (!isInt(Number(value))) throw new InvalidArgumentError("Not a integer.");
                return Number(value);
            },
            1
        )
        .option(
            "-m, --map <pairs>",
            "map original fields to fields u wanted like: created:createdAt,updated:updatedAt",
            value => {
                return value
                    .split(",")
                    .filter(pair => !isEmpty(pair))
                    .reduce((map, pair) => {
                        pair = pair.split(":");
                        if (pair.length < 2) throw new InvalidArgumentError("Not a key:value pair.");
                        map[pair[0]] = pair.slice(1).join("");
                        return map;
                    }, {});
            },
            {}
        )
        .option("-w, --write", "whether to write the result back", false)
        .option("-a, --add", "whether to add target file to the staged", false)
        .parse(process.argv);

    const opts = program.opts();
    const { platform } = process;
    const targets = (
        opts.staged
            ? readFileSync(resolve(getRoot(), ".commit"), "utf8")
                  .split("\n")
                  .filter(path => path !== "")
                  .map(path => resolve(getRoot(), path))
            : program.args.map(arg => resolve(getRoot(), arg))
    ).filter(path =>
        opts.includes.some(
            includePath => relative(includePath, path) === "" || !relative(includePath, path).startsWith("..")
        )
    );

    targets.forEach(target => {
        lint(target, Object.assign(opts, { platform }));
    });
}

function lint(path, opts) {
    if (!existsSync(path)) return;
    const stats = statSync(path);

    if (stats.isFile() && [".md", ".markdown"].includes(extname(path))) {
        let { data, content } = read(path);
        const commits = getRepo().do("log", ["--pretty=fuller", "--", path]).formatted || [];
        const map = opts.map || {};
        if (!isEmpty(commits)) {
            const latestCommit = commits[0];
            const earliestCommit = commits[commits.length - 1];

            data[map["author"] || "author"] = earliestCommit["author"]["name"];
            data[map["contributors"] || "contributors"] = getContributors(path).filter(
                ctr => ctr["contributions"] !== 0
            );
            data[map["updatedby"] || "updatedby"] = latestCommit["author"]["name"];
            data[map["updated"] || "updated"] = opts.now ? new Date() : latestCommit["authorDate"];
            data[map["created"] || "created"] = data[map["created"] || "created"] || earliestCommit["authorDate"];
        } else {
            data[map["author"] || "author"] = getRepo().user.name;
        }

        let rn = false;
        while (content.startsWith("\r\n") || content.startsWith("\n")) {
            if (content.startsWith("\r\n")) (content = content.slice(2)) && (rn = true);
            if (content.startsWith("\n")) content = content.slice(1);
        }
        content = new Array(opts.blankLines).fill(rn ? "\r\n" : "\n").join("") + content;

        if (opts.write) {
            writeFileSync(path, stringify(content, data));
            switch (opts.platform) {
                case "win32":
                    spawnSync("npx.cmd", ["prettier", "--write", path], { cwd: getRoot() });
                    break;
                default:
                    spawnSync("npx", ["prettier", "--write", path], { cwd: getRoot() });
                    break;
            }
            if (opts.add) {
                getRepo().do("add", [path]);
            }
        }
    } else if (stats.isDirectory()) {
        readdirSync(path).forEach(subPath => {
            lint(resolve(path, subPath), opts);
        });
    }
}
