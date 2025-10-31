const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }, // hashed password
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
