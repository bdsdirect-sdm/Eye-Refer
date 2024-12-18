"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const userAuth_1 = __importDefault(require("../middlewares/userAuth"));
const router = (0, express_1.Router)();
router.post('/sendMessage', userAuth_1.default, chatController_1.sendMessage);
router.post('/createRoom', userAuth_1.default, chatController_1.getOrCreateChatRoom);
router.get('/chatRooms', userAuth_1.default, chatController_1.getUserChatRooms);
router.get('/chatMessages/:chatRoomId', userAuth_1.default, chatController_1.getChatHistory);
exports.default = router;
