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
exports.httpServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./environment/env");
const db_1 = __importDefault(require("./config/db"));
const User_1 = __importDefault(require("./models/User"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const http_2 = require("http");
const chatRouter_1 = __importDefault(require("./routers/chatRouter"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const Appointments_1 = __importDefault(require("./models/Appointments"));
// import sequelize from 'seq';
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});
exports.httpServer = (0, http_2.createServer)(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const uploadsPath = path_1.default.join(__dirname, "..", "uploads");
app.use("/uploads", express_1.default.static(uploadsPath));
app.use("/", userRouter_1.default);
app.use("/chat", chatRouter_1.default);
io.on("connection", (socket) => {
    console.log(`A Doctor connected:${socket.id}`);
    socket.on("join_room", (room) => {
        console.log(`${socket.id} joined room ${room}`);
        socket.join(room);
    });
    socket.on("leave_room", (room) => {
        console.log(`${socket.id} left room ${room}`);
        socket.leave(room);
    });
    socket.on("send_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, chatRoomId, senderId } = data;
        console.log(`Received message data:`, data);
        if (!chatRoomId || !senderId) {
            console.error("Chat room ID or sender ID is missing.");
            return;
        }
        try {
            const user = yield User_1.default.findOne({ where: { uuid: senderId } });
            if (!user) {
                console.error("User not found.");
                return;
            }
            const messageWithSenderDetails = Object.assign(Object.assign({}, data), { senderFirstName: user.firstname, senderLastName: user.lastname });
            io.to(chatRoomId).emit("receive_message", messageWithSenderDetails);
        }
        catch (error) {
            console.error("Error fetching sender doctor details:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log(`Doctor Disconnected: ${socket.id}`);
    });
});
db_1.default.sync({ alter: true }).then(() => {
    console.log('Database connected...');
    runTable();
    exports.httpServer.listen(env_1.Local.SERVER_PORT, () => {
        console.log(`Server is running on port ${env_1.Local.SERVER_PORT}`);
    });
}).catch((err) => {
    console.log("Error: ", err);
});
const runTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Appointments_1.default.findAll({});
    console.log("...........data : ", data);
});
