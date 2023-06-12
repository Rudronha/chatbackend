const router = require("express").Router();
const {User,validate} = require("../models/user");
const bcrypt = require("bcrypt");

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



module.exports = router;
