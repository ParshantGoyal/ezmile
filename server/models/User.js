// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: Number,
    firstName: String,
    lastName: String,
    age: Number,
    email: String,
    gender: String,
    phone: String,
});

module.exports = mongoose.model('User', UserSchema);