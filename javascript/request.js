const http = require("http");

http
  .createServer((req, res) => {
    console.log(req);
    if (req.url === "/") {
      res.write("Welcome to the homepage");
      res.end();
    } else if (req.url === "/about") {
      res.write("This is the about page");
      res.end();
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("<h1>404 Page Not Found</h1>");
      res.end();
    }
  })
  .listen(4400);
