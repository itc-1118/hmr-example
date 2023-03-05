const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");

// 定义常量，用于指定文件类型对应的 Content-Type
const CONTENT_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
};

// 定义 URL 到文件路径的映射
const URL_PATH_MAP = {
  "/": path.resolve(__dirname, "index.html"),
  "/src/app.js": path.resolve(__dirname, "src", "app.js"),
  "/client.js": path.resolve(__dirname, "client.js"),
};

const server = http.createServer((req, res) => {
  const { url } = req;
  let content = null;
  let contentType = "text/plain";

  // 根据请求的 URL 设置对应的 content 和 content-type
  if (url in URL_PATH_MAP) {
    const filePath = URL_PATH_MAP[url];
    content = fs.readFileSync(filePath, "utf-8");
    const extname = path.extname(filePath);
    if (extname in CONTENT_TYPES) {
      contentType = CONTENT_TYPES[extname];
    }
  } else {
    // 如果 URL 不在 URL_PATH_MAP 中，则返回 404 Not Found
    res.statusCode = 404;
    res.statusMessage = "Not Found";
    content = "404 Not Found";
  }

  // 设置响应头的 Content-Type，并返回对应的内容
  res.setHeader("Content-Type", contentType);
  res.end(content);
});

const wss = new WebSocket.Server({ server });

let connectedClient = null;

wss.on("connection", (ws) => {
  connectedClient = ws;
  console.log("WebSocket connected");
});

// 监听指定的文件，当文件变化时，向客户端发送消息
const watchFile = (filePath) => {
  fs.watchFile(filePath, () => {
    console.log(`${filePath} changed`);
    const message = {
      type: "update",
      data: {
        filePath,
        content: fs.readFileSync(filePath, "utf-8"),
      },
    };
    if (connectedClient) {
      connectedClient.send(JSON.stringify(message));
    }
  });
};

// 监听 src/app.js 文件
watchFile(path.resolve(__dirname, "src", "app.js"));

// 启动服务器
server.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
