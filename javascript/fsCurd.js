const fs = require("fs");

// console.log(process.argv[2]);

const operation = process.argv[2];
if (operation == "write") {
  const name = process.argv[3];
  const content = process.argv[4];
  // console.log(operation, name, content);
  fs.writeFileSync("files/" + name + ".txt", content);
} else if (operation == "read") {
    const name = process.argv[3];
    const fullName = "files/" + name + ".txt";
    let data = fs.readFileSync(fullName, "utf-8");
    console.log(data);
} else if (operation == "update"){
    const name = process.argv[3];
    const content = process.argv[4];
    let fullName = "files/" + name + ".txt";
    let data = fs.appendFileSync(fullName, content);
} else if (operation == "delete"){
    const name = process.argv[3];
    let fullName = "files/" + name + ".txt";
    fs.unlinkSync(fullName);
}

// fs.writeFileSync('files/mango.txt', 'This is Mango File');

// fs.unlinkSync('files/mango.txt');
