// const http = require('http');
// http.createServer((req, res)=>{
//     res.setHeader('Content-Type', 'text/html');
//     res.write('<h2>Hello from the server</h2>');
//     res.end('Dinesh');
// }).listen(4300);

const http = require("http");
let age = 21;
http
  .createServer((req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write(`
            <html>
            <head>
                <title>My First Page</title>
            </head>
            <body>
                <h1>Hello from my Node.js Server!</h1>
                <h2>`+age+`</h2>
                <h3>`+new Date()+`</h3>
            </body>
            </html>
        `);
    res.end();
  })
  .listen(4300);
