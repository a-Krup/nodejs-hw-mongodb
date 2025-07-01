import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  accessToken: {
    type: String,
    required: [true, "Access token is required"],
  },
  refreshToken: {
    type: String,
    required: [true, "Refresh token is required"],
  },
  accessTokenValidUntil: {
    type: Date,
    required: [true, "Access token expiration date is required"],
  },
  refreshTokenValidUntil: {
    type: Date,
    required: [true, "Refresh token expiration date is required"],
  },
},
{
    timestamps: true, 
  }

);

const Session = mongoose.model("Session", sessionSchema);

export default Session;