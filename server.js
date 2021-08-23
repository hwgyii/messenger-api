const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");

// REQUIRE ROUTERS
const userRouter = require("./controllers/users"); 

const app = express();

const PORT = process.env.PORT || 5000;

const URL = "mongodb://localhost:27017/";
const DATABASE_NAME = "messenger";
const connectionOptions = {
  useUnifiedTopology: true,
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true,
}
connectionString = `${URL}${DATABASE_NAME}`;

mongoose.connect(connectionString, connectionOptions);

app.use(cors());

// FOR ROUTERS
app.use(userRouter);


// FOR SOCKETS

app.listen(PORT, err => {
  if (err) throw err;
  console.log(`Application listening at PORT ${PORT}`);
	console.log(`Accessing main database // ${DATABASE_NAME} @ url: ${URL}`);
});