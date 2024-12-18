import { Router } from 'express';
import { sendMessage, getChatHistory, getOrCreateChatRoom, getUserChatRooms } from '../controllers/chatController';
import userAuthMiddleware from "../middlewares/userAuth";


const router = Router();

router.post('/sendMessage', userAuthMiddleware, sendMessage);
router.post('/createRoom', userAuthMiddleware, getOrCreateChatRoom);
router.get('/chatRooms', userAuthMiddleware, getUserChatRooms);

router.get('/chatMessages/:chatRoomId',userAuthMiddleware, getChatHistory);

export default router;