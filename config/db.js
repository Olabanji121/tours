const mongoose = require("mongoose");

const config = require("config");

const db = config.get("mongoURI");
 
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    await mongoose.connection.on('error', function(error) {
      console.error('Database connection error:', error);
    });
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err.message);
    //   exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
