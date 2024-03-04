const express=require("express");
const dotenv=require("dotenv");
const connectDB = require("./config/db");
const app=express();
const cors = require('cors');
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
app.use(express.json());
app.use(cors());
const userRoutes=require("./routes/userRoutes");
const chatRoutes=require("./routes/chatRoutes");
dotenv.config();
connectDB()
const PORT=process.env.PORT ||5000
app.get('/',(req, res)=>{
    res.send("API IS Running")
})
app.use('/api/users',userRoutes)
app.use('/api/chat',chatRoutes)
app.use(notFound);
app.use(errorHandler)
app.listen(PORT,()=>{
    console.log("listening on",PORT);
});
