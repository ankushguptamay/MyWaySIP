require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("./Routes/Admin/adminRoute");
const user = require("./Routes/User/userRoute");
const db = require("./Models");
// const fs = require('fs');
// const pdf = require('pdf-parse');

// let dataBuffer = fs.readFileSync('Resources/Receipt.pdf');
// pdf(dataBuffer).then(function (data) {
//   console.log(data.numpages);
//   console.log(data.numrender);
//   console.log(data.info);
//   console.log(data.text);

// });
const app = express();

var corsOptions = {
  origin: "*",
};

db.sequelize
  .sync()
  .then(() => {
    console.log("Database is synced");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/admin", admin);
app.use("/user", user);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
