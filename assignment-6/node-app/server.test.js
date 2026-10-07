const test = require("node:test");
const assert = require("node:assert");
const http = require("http");

const handler = require("./server");

test("GET / returns Hello from Node!", async () => {
    const server = http.createServer(handler);

    await new Promise((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });

    const port = server.address().port;

    const body = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/`, (response) => {
            let data = "";

            response.on("data", (chunk) => {
                data += chunk;
            });

            response.on("end", () => {
                resolve(data);
            });
        }).on("error", reject);
    });

    server.close();

    assert.strictEqual(body, "Hello from Node!");
});
