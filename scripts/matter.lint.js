const { resolve, extname } = require("node:path");
const { existsSync, statSync, readdirSync, writeFileSync } = require("node:fs");
const { program, InvalidArgumentError } = require("commander");
const { read, stringify } = require("gray-matter");
const { isEmpty, isInt } = require("./utils");
const { isInvokedByHexo, getRepo, getContributors } = require("./service");

if (!isInvokedByHexo()) {
    program
        .option("--now", "whether to use the current running time of the script as the update time", false)
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
        .parse(process.argv);

    const cwd = process.cwd();
    const opts = program.opts();
    const targets = program.args.map(arg => resolve(cwd, arg)); // regard remaining arguments as target files/directories

    targets.forEach(target => {
        lint(target, opts);
    });
}

function lint(path, opts) {
    if (!existsSync(path)) return;
    const stats = statSync(path);

    if (stats.isFile() && [".md", ".markdown"].includes(extname(path))) {
        let { data, content } = read(path);
        const commits = getRepo().do("log", ["--pretty=fuller", "--", path]).formatted || [];
        if (!isEmpty(commits)) {
            const latestCommit = commits[0];
            const earliestCommit = commits[commits.length - 1];
            const map = opts.map || {};

            data[map["author"] || "author"] = earliestCommit["author"]["name"];
            data[map["contributors"] || "contributors"] = getContributors(path).filter(
                ctr => ctr["contributions"] !== 0
            );
            data[map["updatedby"] || "updatedby"] = latestCommit["author"]["name"];
            data[map["updated"] || "updated"] = opts.now ? new Date() : latestCommit["authorDate"];
            data[map["created"] || "created"] = data[map["created"] || "created"] || earliestCommit["authorDate"];
        }

        let rn = false;
        while (content.startsWith("\r\n") || content.startsWith("\n")) {
            if (content.startsWith("\r\n")) (content = content.slice(2)) && (rn = true);
            if (content.startsWith("\n")) content = content.slice(1);
        }
        content = new Array(opts.blankLines).fill(rn ? "\r\n" : "\n").join("") + content;

        if (opts.write) writeFileSync(path, stringify(content, data));
    } else if (stats.isDirectory()) {
        readdirSync(path).forEach(subPath => {
            lint(resolve(path, subPath), opts);
        });
    }
}
