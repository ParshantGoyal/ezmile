// db.js
const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const mongoURI = 'mongodb://127.0.0.1:27017/dummyjsondb';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;