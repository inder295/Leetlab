import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app=express();

dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{

    res.send("Helo welcome to leetlab 💕") //window + .
  
})

app.use("/api/v1/auth",authRoutes)

app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 8000");
})