const router = require("express").Router();
const {User,validate} = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const joi = require("joi");

//get own information
router.get("/profile", (req,res) => {
  const token = req.headers.authorization;
  //console.log("get :"+token);
  if (token) {
    jwt.verify(token,process.env.JWTPRIVATEKEY,{},(err, userData) => {
      if (err)throw err;
      res.status(200).send(userData);
    });
  } else {
    res.status(401).json('no token');
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all users
router.get('/usersList', async (req, res) => {

  const users = await User.find({});
  
  const userMap = [];
  users.forEach((user) => {
      const { password,email, ...other } = user._doc;
      userMap.push(other);
  });
  
  res.send(userMap);
  
  });
//Create new User
router.post("/",async(req,res)=>{
    try{
        const {error} = validate(req.body);
        if(error)
            return res.status(400).send({message:error.details[0].message});
        const user = await User.findOne({email:req.body.email});
        if(user)
            return res.status(409).send({message:"User with given email already exist!"});
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password,salt);

        await new User({...req.body,password:hashPassword}).save();
        res.status(201).send({message:"User created successfully"})
    }catch(error){
        res.status(500).send({message:"Internal Server Error"})
    }
});

//update User information
router.put("/:id",async(req, res)=>{
  //console.log("user :" + req.body.userId);
 // console.log("id :" + req.params.id);
  if (req.body.userId === req.params.id) {
    try{
    const user = await User.findByIdAndUpdate(req.params.id, {
      username : req.body.username
    });
    const updateduser=await User.findById(user._id);
    //console.log(updateduser);
      const update_token = updateduser.generateAuthToken();
     // console.log("send :"+update_token);
      res.status(200).send({data:update_token,message:"User updated in successfully"})
    }catch(err){
      res.status(500).json(err);
    }
  }else{
    return res.status(403).json("You can update only your account!");
  }
})


module.exports = router;
