const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

const trackModel = new Schema(
  {
    tripName: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    locations: [locationSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalDistance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

trackModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

// Middleware to calculate and update totalDistance before saving
trackModel.pre("save", function (next) {
  if (this.locations.length >= 2) {
    this.totalDistance = calculateTotalDistance(this.locations);
  }
  next();
});

function calculateTotalDistance(locations) {
  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    const prevLoc = locations[i - 1];
    const currLoc = locations[i];
    const distance = calculateDistance(prevLoc.latitude, prevLoc.longitude, currLoc.latitude, currLoc.longitude);
    totalDistance += distance;
  }
  return totalDistance;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

const track = mongoose.model("track", trackModel);
module.exports = track;
