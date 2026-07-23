import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runDockerShell } from "./dockerRunner.js";

const server = new McpServer({
  name: "docker-mcp",
  version: "0.1.0"
});

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
