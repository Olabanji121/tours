const fs = require('fs');
const connectDB = require('../../config/db');
const Tour = require('../../models/TourModel');
const User = require('../../models/userModel');
const Review = require('../../models/ReviewModel');

connectDB();

// READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// import data to database

const importData = async () => {
  try {
    await Tour.create(tours,{ validateBeforeSave: false });
    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    console.log('data loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//  Delete all data from colloection

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('All data Deleted ');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);

// node ./dev-data/data/import-Dev-Data.js --delete
