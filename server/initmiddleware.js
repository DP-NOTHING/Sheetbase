import cors from "cors";
import morgan from "morgan";
import express from "express";
import dotenv from "dotenv";


function setupMiddlewares(app){
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());
    dotenv.config();
}

export { setupMiddlewares };