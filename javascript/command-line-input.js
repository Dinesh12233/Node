const http = require('http');

const arg = process.argv;
const port = arg[2];

http.createServer((req, res)=>{
    res.write('Hello from the server')
    res.end()
}).listen(port);