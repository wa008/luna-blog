const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const PORT = 3000;

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".xml": "application/xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split("?")[0];

    // Try the exact path first
    let filePath = path.join(DIST_DIR, urlPath);

    // If it's a directory, look for index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
    }

    // If no extension, try adding /index.html
    if (!path.extname(filePath) && !fs.existsSync(filePath)) {
        filePath = filePath + "/index.html";
    }

    if (!fs.existsSync(filePath)) {
        // Serve 404 page
        const notFoundPath = path.join(DIST_DIR, "404.html");
        if (fs.existsSync(notFoundPath)) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(fs.readFileSync(notFoundPath));
        } else {
            res.writeHead(404);
            res.end("404 Not Found");
        }
        return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(fs.readFileSync(filePath));
});

server.listen(PORT, () => {
    console.log(`\n🌙 Luna dev server running at http://localhost:${PORT}\n`);
});
