const http = require("http");

function handler(req, res) {
    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("Hello from Node!");
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
}

if (require.main === module) {
    const server = http.createServer(handler);

    server.listen(3000, "0.0.0.0", () => {
        console.log("Server running on port 3000");
    });
}

module.exports = handler;
