const http = require("http");
const fs = require("fs");
const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const formHtml = fs.readFileSync("getintouch.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(formHtml);
  } else if (req.method === "POST" && req.url === "/form-handler") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const name = params.get("name");
      const email = params.get("email");
      const message = params.get("message");

      MongoClient.connect("mongodb://localhost:27017", (err, client) => {
        if (err) throw err;

        const db = client.db("formDB");

        db.collection("submissions").insertOne(
          {
            name: name,
            email: email,
            message: message,
          },
          (err, result) => {
            if (err) throw err;

            res.writeHead(302, { Location: "/" });
            res.end();
          }
        );
      });
    });
  } else {
    res.writeHead(404);
    res.end("Page Not Found");
  }
});

server.listen(3000);
