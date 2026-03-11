import { spawn } from "node:child_process";

const composeArgs = ["compose", "-f", "../../docker/docker-compose.yml"];
let nextProc = null;
let shuttingDown = false;

function run(command, args, options = {}, allowFailure = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0 || allowFailure) {
        resolve(code);
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
      }
    });
  });
}

async function ensureDbRunning() {
  await run("docker", [...composeArgs, "unpause", "db"], {}, true);
  await run("docker", [...composeArgs, "up", "-d", "db"]);
}

async function stopDb() {
  try {
    await run("docker", [...composeArgs, "stop", "db"], {}, true);
  } catch (err) {
    console.error("Failed to stop db:", err.message);
  }
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (nextProc && !nextProc.killed) {
    nextProc.kill("SIGINT");
  }

  await stopDb();
  process.exit(exitCode);
}

async function main() {
  try {
    await ensureDbRunning();

    nextProc = spawn("npx", ["next", "dev"], {
      stdio: "inherit",
      shell: true,
    });

    nextProc.on("exit", async (code) => {
      await shutdown(code ?? 0);
    });

    process.on("SIGINT", async () => {
      await shutdown(0);
    });

    process.on("SIGTERM", async () => {
      await shutdown(0);
    });
  } catch (err) {
    console.error(err.message);
    await shutdown(1);
  }
}

main();