const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    fs.readFile("html/web.html", (error, data) => { 
      if (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.write("Internal Server Error");
        res.end();
        return;
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      }
    });
  })
  .listen(4900);
