// require ('dotenv').config({path:'./env'})

import dotenv from 'dotenv'
import mongoose from 'mongoose';

import connectDB from './db/database.js';
console.log("Hi")
dotenv.config({
  path:'./env'
})
connectDB()
















































/*
import express from 'express'
const app = express();
(async () => {
  try {
    await nmongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (eroor) => {
      console.log("Error", eroor)
      throw error
    })
    app.listen(process.env.PORT, () => {
      console.log(`App is running on Port ${process.env.PORT} `)
    })
  }
  catch (err) {
    console.log(err)
  }
})()
  */