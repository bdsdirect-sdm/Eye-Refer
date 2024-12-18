"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChatRooms = exports.getChatHistory = exports.sendMessage = exports.getOrCreateChatRoom = void 0;
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const ChatRoom_1 = __importDefault(require("../models/ChatRoom"));
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User"));
const Patient_1 = __importDefault(require("../models/Patient"));
const getOrCreateChatRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { referedById, referedToId, patientId, roomId } = req.body;
    try {
        let chatRoom = yield ChatRoom_1.default.findOne({
            where: {
                referedById,
                referedToId,
                patientId,
            }
        });
        if (!chatRoom) {
            chatRoom = yield ChatRoom_1.default.create({ referedById, referedToId, patientId, roomId });
        }
        res.status(200).json(chatRoom);
    }
    catch (error) {
        console.error('Error getting or creating chat room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getOrCreateChatRoom = getOrCreateChatRoom;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatRoomId, senderId, message } = req.body;
    try {
        const chatRoomExists = yield ChatRoom_1.default.findOne({
            where: { roomId: chatRoomId },
        });
        if (!chatRoomExists) {
            res.status(404).json({ error: 'Chat room not found' });
            return;
        }
        const chatMessage = yield ChatMessage_1.default.create({ chatRoomId, senderId, message });
        res.status(201).json(chatMessage);
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendMessage = sendMessage;
const getChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatRoomId } = req.params;
    try {
        const messages = yield ChatMessage_1.default.findAll({
            where: { chatRoomId },
        });
        const messagesWithUsers = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ where: { uuid: message.senderId } });
            console.log("sender first name", user ? user.firstname : 'Unknown');
            console.log("sender last name", user ? user.lastname : 'Unknown');
            return Object.assign(Object.assign({}, message.toJSON()), { senderFirstName: user ? user.firstname : 'Unknown', senderLastName: user ? user.lastname : 'Unknown' });
        })));
        res.status(200).json(messagesWithUsers);
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getChatHistory = getChatHistory;
const getUserChatRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const chatRooms = yield ChatRoom_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { referedById: uuid },
                    { referedToId: uuid },
                ]
            },
        });
        if (!chatRooms || chatRooms.length === 0) {
            res.status(404).json({ message: 'No chat rooms found for this user' });
            return;
        }
        const chatRoomsWithPatientNames = yield Promise.all(chatRooms.map((chatRoom) => __awaiter(void 0, void 0, void 0, function* () {
            const patientId = chatRoom.dataValues.patientId;
            const patient = yield Patient_1.default.findOne({ where: { uuid: patientId } });
            if (patient) {
                return Object.assign(Object.assign({}, chatRoom.dataValues), { patientName: `${patient.firstname} ${patient.lastname}` });
            }
            return chatRoom.dataValues;
        })));
        res.status(200).json(chatRoomsWithPatientNames);
    }
    catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUserChatRooms = getUserChatRooms;
