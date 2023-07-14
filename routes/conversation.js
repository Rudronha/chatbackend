const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//new conv
router.post("/", async (req, res) => {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
  
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
});
  
//get conv of a user
router.get("/:userId", async (req, res) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
});

//delete conversation
router.delete("/:id",async(req,res)=>{
  if(req.params.id){
    try {
      //await Conversation.findByIdAndDelete(req.params.id);
      await Message.findOneAndDelete({conversationId:req.params.id});
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  }else{
    return res.status(403).json("Enter valid Coversation");
  }
})

module.exports = router;