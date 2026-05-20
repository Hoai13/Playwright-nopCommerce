import fs from "fs";
import path from "path";
import chalk from "chalk";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(
  logDir,
  `run-${new Date().toISOString().replace(/[:]/g, "-")}.log`
);

function write(message: string) {
  const time = new Date().toISOString();
  const log = `[${time}] ${message}\n`;

  fs.appendFileSync(logFile, log);
  console.log(log.trim());
}

export const logStep = (msg: string) => write(`${msg}`);
export const logInfo = (msg: string) => write(`${msg}`);
export const logSuccess = (msg: string) => write(`[SUCCESS] ${msg}`);
export const logWarning = (msg: string) => write(`[WARNING] ${msg}`);
export const logError = (msg: string) => write(`[ERROR] ${msg}`);

export function logTitle(title: string) {
  const line = "=".repeat(80);

  console.log(chalk.yellow(line));
  console.log(chalk.yellow(title));
  console.log(chalk.yellow(line));

  write(line);
  write(title);
  write(line);
}