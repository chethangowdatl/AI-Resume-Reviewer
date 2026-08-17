const mongoose = require('mongoose');
const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

// Force Node.js DNS resolver to use Google/Cloudflare public DNS to bypass Windows/ISP SRV lookup blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

let isMongoConnected = false;
let localUsersDb = null;
let localReviewsDb = null;

// Embedded NeDB datastores for offline local dev
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

localUsersDb = Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true });
localReviewsDb = Datastore.create({ filename: path.join(dataDir, 'reviews.db'), autoload: true });

/**
 * Mongoose Schemas for MongoDB Atlas Production Mode
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  ats_score: { type: Number, required: true },
  verdict: { type: String },
  summary: { type: String },
  strengths: [String],
  weaknesses: [String],
  missing_skills: [String],
  improved_bullet_points: Array,
  grammar_fixes: Array,
  recommended_projects: Array,
  job_match: Object,
  final_recommendation: String,
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);
const MongoReview = mongoose.model('Review', reviewSchema);

/**
 * Initialize Database Connection
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim() !== '') {
    try {
      console.log('🍃 Connecting to MongoDB Atlas Cloud Database...');
      await mongoose.connect(uri.trim());
      isMongoConnected = true;
      console.log('✅ MongoDB Atlas connected successfully!');
      return;
    } catch (err) {
      console.error('❌ MongoDB Atlas connection error:', err.message);
      console.log('🔄 Falling back to Embedded Local Database for development...');
    }
  } else {
    console.log('💾 Running in Embedded Local Database mode (Set MONGODB_URI in .env for Cloud MongoDB)');
  }
}

/**
 * Unified Database Access Methods
 */

async function findUserByEmail(email) {
  const cleanEmail = email.toLowerCase().trim();
  if (isMongoConnected) {
    return await MongoUser.findOne({ email: cleanEmail });
  } else {
    return await localUsersDb.findOne({ email: cleanEmail });
  }
}

async function findUserById(id) {
  if (isMongoConnected) {
    return await MongoUser.findById(id).select('-password');
  } else {
    const u = await localUsersDb.findOne({ _id: id });
    if (u) {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    }
    return null;
  }
}

async function createUser(name, email, hashedPassword) {
  const cleanEmail = email.toLowerCase().trim();
  if (isMongoConnected) {
    const newUser = new MongoUser({ name, email: cleanEmail, password: hashedPassword });
    await newUser.save();
    return newUser;
  } else {
    const newUser = await localUsersDb.insert({
      name,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    return newUser;
  }
}

async function createReview(reviewData) {
  if (isMongoConnected) {
    const newRev = new MongoReview(reviewData);
    await newRev.save();
    return newRev;
  } else {
    const newRev = await localReviewsDb.insert({
      ...reviewData,
      createdAt: new Date().toISOString()
    });
    return newRev;
  }
}

async function getUserReviews(userId) {
  if (isMongoConnected) {
    return await MongoReview.find({ userId }).sort({ createdAt: -1 });
  } else {
    return await localReviewsDb.find({ userId }).sort({ createdAt: -1 });
  }
}

async function getReviewById(reviewId, userId) {
  if (isMongoConnected) {
    return await MongoReview.findOne({ _id: reviewId, userId });
  } else {
    return await localReviewsDb.findOne({ _id: reviewId, userId });
  }
}

async function deleteReview(reviewId, userId) {
  if (isMongoConnected) {
    return await MongoReview.deleteOne({ _id: reviewId, userId });
  } else {
    return await localReviewsDb.remove({ _id: reviewId, userId }, {});
  }
}

module.exports = {
  connectDB,
  findUserByEmail,
  findUserById,
  createUser,
  createReview,
  getUserReviews,
  getReviewById,
  deleteReview
};
