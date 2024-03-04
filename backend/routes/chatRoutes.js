const express= require("express");
const asyncHandler=require('express-async-handler');
const { protect } = require("../middleware/authMiddleware");
const { accessChat,fetchChats, createGropChat, renameGroup, removeFromGroup, addToGroup } = require("../Controllers/chatControllers");
const router=express.Router();

router.route('/').post(protect,accessChat).get(protect,fetchChats);
router.route("/group").post(protect,createGropChat);
router.route("/rename").put(protect,renameGroup);
router.route("/groupremove").put(protect,removeFromGroup);
router.route('/groupadd').put(protect,addToGroup);

module.exports=router;