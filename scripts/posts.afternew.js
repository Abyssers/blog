const { resolve, extname } = require("node:path");
const { existsSync, statSync, readdirSync, copyFileSync, mkdirSync, unlinkSync, rmdirSync } = require("node:fs");
const { read } = require("gray-matter");
const { isInvokedByHexo, getRoot } = require("./service");

// 归档
const archive = src => {
    console.log("forceArchive RUNNING");
    readdirSync(src).forEach(fileName => {
        const fileSrc = resolve(src, fileName);
        if (statSync(fileSrc).isDirectory()) {
            const isEmpty = archive(fileSrc);
            if (isEmpty) rmdirSync(fileSrc);
            return;
        }
        if (extname(fileName) === ".md") {
            const {
                data: { date },
            } = read(fileSrc);
            if (!date) return;
            const year = String(date.getUTCFullYear());
            const month = "0" + (date.getUTCMonth() + 1);
            const day = "0" + date.getUTCDate();
            shear(
                fileName,
                src,
                resolve(
                    getRoot(),
                    "source",
                    "_posts",
                    year,
                    month.substring(month.length - 2),
                    day.substring(day.length - 2)
                )
            );
        }
    });
    return readdirSync(src).length === 0;
};

// 剪切一个文件到指定文件夹
const shear = (fileName, src, dest) => {
    const srcFile = resolve(src, fileName);
    const destFile = resolve(dest, fileName);
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    copyFileSync(srcFile, destFile);

    // 如果复制前后的目录不一致，则删除源目录文件
    if (srcFile !== destFile) unlinkSync(resolve(src, fileName));

    // 如果剪切完成后的文件夹为空，则删除该文件夹
    // if (readdirSync(resolve(src)).length === 0) rmdirSync(src);
};

if (isInvokedByHexo()) {
    return;
}

archive(resolve(getRoot(), "source", "_posts"));
