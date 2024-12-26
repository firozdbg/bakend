import { channel } from "diagnostics_channel";
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref:"User"
  },
  channel:{
    type: Schema.Types.ObjectId,
    ref:"User" 
  }
}, {
  timestamps:true
})

const Subscription=mongoose.model("Subscription",subscriptionSchema)