import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execFile } from "node:child_process";
import { z } from "zod";

const server = new McpServer({
  name: "docker-mcp",
  version: "0.0.0"
});

async function runDockerShell({ image, code, timeoutSeconds }, execFileImpl = execFile) {
  const args = ["run", "--rm", "--network", "bridge", image, "sh", "-c", code];

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

server.registerTool(
  "run_in_docker",
  {
    title: "Run shell in Docker",
    description: "Run arbitrary shell code inside a docker image with timeout.",
    inputSchema: {
      image: z.string().min(1).describe("Docker image name as used in docker run"),
      code: z.string().describe("Arbitrary shell code to execute"),
      timeoutSeconds: z.number().int().positive().describe("Timeout in seconds")
    }
  },
  async ({ image, code, timeoutSeconds }) => {
    const result = await runDockerShell({ image, code, timeoutSeconds });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ stdout: result.stdout, stderr: result.stderr })
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
