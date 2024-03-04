const asyncHandler = require("express-async-handler");
const Chat = require('../models/chatModel');
const User = require('../models/userModel'); // Assuming this is the correct path for your User model

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User not found");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  }).populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email"
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender", // Fixed the syntax here
      isGroupChat: false,
      users: [req.user._id, userId]
    };
    
    try {
      const newChat = await Chat.create(chatData);

      const FullChat= await Chat.findOne({
        _id:newChat._id
      }).populate("users", "-password")
      res.status(200).send(FullChat);
    } catch (error) {
      console.error("Error creating new chat:", error);
      res.status(500).send("Error creating new chat");
    }
  }
});
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const result = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).populate("users","-password").populate("groupAdmin","-password").populate("latestMessage").sort({
      updatedAt:-1
    }).then(async(results)=>{
       results= await User.populate(results,{
        path:"latestMessage.sender",
        select:"name pic email",
       });
       res.status(200).send(results);
    });
    
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).send("Error fetching chats");
  }
});
const createGropChat=asyncHandler(async(req,res)=>{
   if(!req.body.users || !req.body.name){
     return res.status(400).send({message:"Plaese Fill All Feilds"});
   }
    var users=JSON.parse(req.body.users);
    users.push(req.user);
    if(users.length<2){
      res.status(400).
      send("More Than 2 Users are Requiree to form a Group Chat") ;
    }
   
    try{
       const groupchat= await Chat.create({
         chatName:req.body.name,
         users:users,
         isGroupChat:true,
         groupAdmin:req.user,
       });
       const FullGroupChat =await Chat.findOne({_id:groupchat._id}).populate("users","-password").populate("groupAdmin","-password");

       res.status(200).json(FullGroupChat);
    }
    catch(error){
       res.status(400).send(error.message)
    }

})
const renameGroup=asyncHandler(async(req,res)=>{
   const { chatId,chatName}=req.body;
   const updatedChat=await Chat.findByIdAndUpdate(chatId,{chatName:chatName},{
    new :true,
   }).populate("users","-password").populate("groupAdmin","-password");

   if(!updatedChat){
    res.status(404);
    throw new Error("Chat Not Found");
   }
   else{
     res.status(200).json(updatedChat);
   }
})
const addToGroup=asyncHandler(async(req,res)=>{
   const {chatId,userId}=req.body;

   const added= await Chat.findByIdAndUpdate(chatId,{
    $push:{users:userId}
   },{new:true}).populate("users","-password").populate("groupAdmin","-password");
     
   if(!added){
    res.status(400);
    throw  new   Error("Chat Not  Found");
   }else {
    res.json({ message: "User added to group successfully", chat: added }); 
  }
})
const removeFromGroup=asyncHandler(async(req,res)=>{
  const {chatId,userId}=req.body;

  const remove= await Chat.findByIdAndUpdate(chatId,{
   $pull:{users:userId}
  }, {new:true}).populate("users","-password").populate("groupAdmin","-password");

  if(!remove){
   res.status(400);
   throw  new   Error("Chat Not  Found")
;  }
  else{
    res.status(200).json({ message: "User Removed From group successfully", chat: remove });
  }
})
module.exports={accessChat,fetchChats,createGropChat,renameGroup,addToGroup,removeFromGroup}
