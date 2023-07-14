require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const conversationRoute = require("./routes/conversation");
const messageRoute = require("./routes/message");
const app = express();
//database connect
connection();

//middlewares 
app.use(express.json());
app.use(cors());

//routes
app.use("/api/users",userRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);


app.get("/api/profile", (req,res) => {
    const token = req.headers['authorization'];
    //console.log(token);
    if (token) {
      jwt.verify(token,process.env.JWTPRIVATEKEY,{},(err, userData) => {
        if (err) throw err;
        res.json(userData);
        console.log(userData);
      });
    } else {
      res.status(401).json('no token');
    }
});

const port = process.env.PORT||8000;
app.listen(port,()=>{
    console.log(`We are Live on port ${port}...`);
})