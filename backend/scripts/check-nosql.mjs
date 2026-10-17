#!/usr/bin/env node
/**
 * MIG-05 guard: SQL/Sequelize regression check.
 *
 * Fails (exit code 1) if Sequelize APIs, SQL drivers, raw SQL or SQL-era
 * environment variables reappear anywhere in `src/`.
 *
 * Run: npm run check:nosql
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const srcDir = fileURLToPath(new URL("../src", import.meta.url));
const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));

const BANNED_DEPENDENCIES = [
  "sequelize",
  "sequelize-cli",
  "mysql",
  "mysql2",
  "mariadb",
  "sqlite3",
  "pg",
  "pg-hstore",
  "mssql",
  "tedious",
  "oracledb",
];

const CHECKS = [
  {
    id: "sequelize-import",
    description: "Sequelize import/require",
    pattern: /(?:require\(\s*["']sequelize(?:-cli)?["']\s*\)|from\s+["']sequelize(?:-cli)?["'])/,
  },
  {
    id: "sequelize-data-types",
    description: "Sequelize DataTypes",
    pattern: /\bDataTypes\b/,
  },
  {
    id: "sequelize-query-types",
    description: "Sequelize QueryTypes",
    pattern: /\bQueryTypes\b/,
  },
  {
    id: "sequelize-operators",
    description: "Sequelize Op.* operators",
    pattern: /\bOp\.[A-Za-z]+/,
  },
  {
    id: "sequelize-static-methods",
    description: "Sequelize static model methods",
    pattern: /\.(findByPk|findAndCountAll|findOrCreate|bulkCreate|upsert)\s*\(/,
  },
  {
    id: "sequelize-associations",
    description: "Sequelize associations",
    pattern: /\.(belongsTo|hasMany|hasOne|belongsToMany)\s*\(/,
  },
  {
    id: "sequelize-sync",
    description: "Sequelize sync()",
    pattern: /\bsync\s*\(\s*\{?\s*(alter|force)?\s*\}?\s*\)/,
  },
  {
    id: "sequelize-transaction",
    description: "Sequelize transactions",
    pattern: /\bsequelize\.transaction\s*\(/,
  },
  {
    id: "sequelize-where-option",
    description: "Sequelize `{ where: ... }` option object",
    pattern: /\.(findAll|findOne|findByPk|update|destroy|count)\s*\(\s*\{[^}]*\bwhere\s*:/,
  },
  {
    id: "sequelize-include-option",
    description: "Sequelize include option",
    pattern: /include\s*:\s*\[\s*\{\s*model\s*:/,
  },
  {
    id: "sequelize-order-option",
    description: "Sequelize nested order arrays",
    pattern: /order\s*:\s*\[\s*\[\s*["']/,
  },
  {
    id: "sequelize-paranoid",
    description: "Sequelize paranoid option",
    pattern: /\bparanoid\s*:\s*(true|false)/,
  },
  {
    id: "sequelize-raw",
    description: "Sequelize raw option",
    pattern: /\braw\s*:\s*true\b/,
  },
  {
    id: "sql-drivers",
    description: "SQL driver reference",
    pattern: /\b(?:mysql2?|mariadb|sqlite3?)\b/,
  },
  {
    id: "raw-sql-keywords",
    description: "Raw SQL statement",
    pattern: /\b(SELECT\s+.+\s+FROM|INSERT\s+INTO|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/,
  },
  {
    id: "legacy-update-result",
    description: "Legacy result.nModified/nInserted",
    pattern: /\b(nModified|nInserted)\b/,
  },
  {
    id: "sql-env-vars",
    description: "SQL-era environment variable",
    pattern: /\bDB_(?:NAME|USER|HOST|PASS|PASSWORD|PORT|SSL)\b/,
  },
  {
    id: "legacy-model-remove",
    description: "Removed Mongoose Model.remove()",
    pattern: /\.remove\s*\(/,
  },
];

const ALLOWLIST = [
  {
    check: "legacy-model-remove",
    file: "src/utils/supabaseStorage.util.js",
    reason: "Supabase Storage SDK uses .remove([paths]) - not the removed Mongoose Model.remove()",
  },
];

const collectJsFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};

const isAllowlisted = (finding) =>
  ALLOWLIST.some(
    (entry) => entry.check === finding.check && entry.file === finding.file
  );

const main = async () => {
  const files = await collectJsFiles(srcDir);
  const findings = [];

  for (const file of files) {
    const relPath = relative(projectRoot, file).split(sep).join("/");
    const lines = (await readFile(file, "utf8")).split(/\r?\n/);

    lines.forEach((lineText, index) => {
      for (const check of CHECKS) {
        if (check.pattern.test(lineText)) {
          findings.push({
            check: check.id,
            description: check.description,
            file: relPath,
            line: index + 1,
            text: lineText,
          });
        }
      }
    });
  }

  const problems = findings.filter((finding) => !isAllowlisted(finding));

  const dependencyProblems = [];
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const declaredDependencies = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ]);

  for (const banned of BANNED_DEPENDENCIES) {
    if (declaredDependencies.has(banned)) {
      dependencyProblems.push(banned);
    }
  }

  if (problems.length > 0 || dependencyProblems.length > 0) {
    console.error(
      "\n✗ NoSQL check FAILED: SQL/Sequelize artifacts are not allowed in this codebase.\n"
    );

    for (const problem of problems) {
      console.error(
        `  - [${problem.check}] ${problem.file}:${problem.line} (${problem.description})\n      ${problem.text.trim()}`
      );
    }

    for (const banned of dependencyProblems) {
      console.error(`  - [banned-dependency] package.json declares "${banned}"`);
    }

    console.error("");
    process.exit(1);
  }

  const allowlistedCount = findings.length - problems.length;
  console.log(
    `✅ NoSQL check passed: ${files.length} files scanned, no SQL/Sequelize artifacts found` +
      (allowlistedCount > 0 ? ` (${allowlistedCount} allowlisted match).` : ".")
  );
};

main().catch((error) => {
  console.error("✗ NoSQL check crashed:", error);
  process.exit(1);
});
