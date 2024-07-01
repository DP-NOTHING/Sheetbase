import express from "express";
import { connect } from "./db/connection.js";
import { setupMiddlewares } from "./initmiddleware.js";

const app=express();
setupMiddlewares(app);

app.get("/",(req,res)=>res.send("Hello World"));

const PORT=process.env.PORT;
app.listen(PORT,async ()=>{
    const connected=await connect();
    connected?console.log(`Server is running on PORT: ${PORT}`):console.log("Server starting failed");
});