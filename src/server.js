// require ('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import connectDB from './db/database.js';
import {app} from './app.js'
console.log("Hi")
dotenv.config({
  path:'./env'
})

const PORT = process.env.PORT|| 8000;
connectDB()
  .then((response) => {
    app.listen(PORT, () => {
      
      console.log(`server is running on PORT ${PORT}`)
    })
  })
  .then((err) => {
    console.log("MONGODB connection failed once",err)
  })
















































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