import { execFile } from "node:child_process";

export async function runDockerShell({ image, code, timeoutSeconds }, execFileImpl = execFile) {
  const args = ["run", "--rm", "--network", "bridge", image, "sh", "-lc", code];

  return new Promise((resolve) => {
    execFileImpl("docker", args, { timeout: timeoutSeconds * 1000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout = "", stderr = "") => {
      if (!error) {
        resolve({ stdout, stderr, exitCode: 0, timedOut: false });
        return;
      }

      const timedOut = Boolean(error.killed && error.signal === "SIGTERM");
      resolve({
        stdout,
        stderr: timedOut && !stderr ? `Timed out after ${timeoutSeconds} seconds` : stderr,
        exitCode: typeof error.code === "number" ? error.code : 1,
        timedOut
      });
    });
  });
}
