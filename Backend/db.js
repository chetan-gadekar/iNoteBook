const mongoose = require("mongoose");
const mongoURI = "mongodb://127.0.0.1:27017"; //it is database url used for connection

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to Mongo Successfully");
  } catch (error) {
    console.error("Error connecting to Mongo:", error);
  }
};

module.exports = connectToMongo;
