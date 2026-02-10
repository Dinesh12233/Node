const http = require('http');

const users = [
    { id: 1, name: 'Dinesh', age: 21, profession: 'Developer' },
    { id: 2, name: 'John', age: 25, profession: 'Designer' },
    { id: 3, name: 'Jane', age: 22, profession: 'Manager' },
    { id: 4, name: 'Doe', age: 28, profession: 'Tester' }
]

http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(users));
    res.end();
}).listen(4900);