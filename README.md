# docker-mcp

An MCP server with a single tool: `run_in_docker`.

The tool takes:
- `image`: docker image name (as in `docker run`)
- `code`: arbitrary shell code
- `timeoutSeconds`: timeout in seconds

It runs:
- `docker run --rm --network bridge <image> sh -c <code>`

And returns JSON text containing:
- `stdout`
- `stderr`

## Run locally

```bash
npm ci
npm start
```

## Docker image

CI builds and pushes the server image to GHCR:
- `ghcr.io/plengauer/docker-mcp:latest`
- `ghcr.io/plengauer/docker-mcp:<sha>`

## Configure Claude Desktop

Because this MCP server itself runs in Docker and starts other Docker containers, mount the host Docker socket:

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "ghcr.io/plengauer/docker-mcp:latest"
      ]
    }
  }
}
```
