// const http = require("http");

// http
//   .createServer((req, res) => {
//     res.writeHead(200, { "content-type": "text/html" });

// if (req.url === "/") {
//   res.write(`
//         <form action="/submit" method="POST">
//             <input type="text" name="username" placeholder="Enter your name" />
//             <input type="password" name="password" placeholder="Enter your password" />
//             <input type="submit" value="Submit" />
//         </form>
//     `);
// }else if(req.url === "/submit"){
//     res.write("<h1>Form submitted successfully!</h1>");
// }

//     res.end();
//   })
//   .listen(4500);



const http = require("http");
const fs = require("fs");
const queryString = require("querystring");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    // Serve the form
    fs.readFile("html/form.html", "utf-8", (error, data) => {
      if (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.url === "/submit" && req.method === "POST") {
    // Handle form submission
    let body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const formData = queryString.parse(parsedBody);
      console.log("Form Data:", formData); 

      fs.writeFile('text/' + formData.name + '.txt', `Name: ${formData.name}\nPassword: ${formData.password}`, (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('File written successfully');
        }
      });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h1>Form submitted successfully!</h1>
               <p>Name: ${formData.name}</p>
               <p>Password: ${formData.password}</p>`);
    });
  } else {
    // Handle unknown routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(3600, () => {
  console.log("Server running on http://localhost:3600");
});
