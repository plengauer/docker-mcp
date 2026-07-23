import test from "node:test";
import assert from "node:assert/strict";
import { runDockerShell } from "../src/dockerRunner.js";

test("runDockerShell runs docker with --rm, network bridge, and timeout", async () => {
  let receivedFile;
  let receivedArgs;
  let receivedOptions;

  const mockExecFile = (file, args, options, callback) => {
    receivedFile = file;
    receivedArgs = args;
    receivedOptions = options;
    callback(null, "out", "err");
  };

  const result = await runDockerShell(
    { image: "alpine:3.20", code: "echo hi", timeoutSeconds: 7 },
    mockExecFile
  );

  assert.equal(receivedFile, "docker");
  assert.deepEqual(receivedArgs, ["run", "--rm", "--network", "bridge", "alpine:3.20", "sh", "-lc", "echo hi"]);
  assert.equal(receivedOptions.timeout, 7000);
  assert.equal(result.stdout, "out");
  assert.equal(result.stderr, "err");
});

test("runDockerShell flags timeout and keeps stderr", async () => {
  const mockExecFile = (_file, _args, _options, callback) => {
    callback({ killed: true, signal: "SIGTERM", code: null }, "", "");
  };

  const result = await runDockerShell(
    { image: "alpine", code: "sleep 10", timeoutSeconds: 1 },
    mockExecFile
  );

  assert.equal(result.timedOut, true);
  assert.equal(result.stderr, "Timed out after 1 seconds");
});
