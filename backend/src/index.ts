import express from 'express';
import http from "http";
import cors from 'cors';
import { Local } from './environment/env';
import sequelize from './config/db';
import User from './models/User';
import userRouter from './routers/userRouter';
import {createServer} from 'http';
import chatRouter from './routers/chatRouter';
import { Server,Socket } from 'socket.io';
import path from 'path';
import Appointment from './models/Appointments';
import ChatMessages from './models/ChatMessage';
import Patient from './models/Patient';

// import sequelize from 'seq';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

export const httpServer = createServer(app);
   
app.use(cors());
app.use(express.json());
const uploadsPath=path.join(__dirname, "..","uploads");
app.use("/uploads",express.static(uploadsPath));

app.use("/", userRouter);
app.use("/chat", chatRouter);

io.on("connection",(socket:Socket)=>{
    console.log(`A Doctor connected:${socket.id}`);

    socket.on("join_room", (room: string) => {
        console.log(`${socket.id} joined room ${room}`);
        socket.join(room);  
      });

      socket.on("leave_room", (room: string) => {
        console.log(`${socket.id} left room ${room}`);
        socket.leave(room);
      });
      socket.on("send_message", async (data) => {
        const { message, chatRoomId, senderId } = data;
      
        console.log(`Received message data:`, data);
      
        if (!chatRoomId || !senderId) {
          console.error("Chat room ID or sender ID is missing.");
          return;
        }

        try {
            const user = await User.findOne({ where: { uuid: senderId } });
        
            if (!user) {
              console.error("User not found.");
              return;
            }
                const messageWithSenderDetails = {
              ...data,
              senderFirstName: user.firstname,
              senderLastName: user.lastname
            };
        
            io.to(chatRoomId).emit("receive_message", messageWithSenderDetails);
        
          } catch (error) {
            console.error("Error fetching sender doctor details:", error);
          }
        });
        
        socket.on("disconnect", () => {
          console.log(`Doctor Disconnected: ${socket.id}`);
        });
});
sequelize.sync({alter:true}).then(()=>{
    console.log('Database connected...');
    runTable()
    httpServer.listen(Local.SERVER_PORT,  () => {
        console.log(`Server is running on port ${Local.SERVER_PORT}`);
        });
}).catch((err)=>{
    console.log("Error: ", err);
})

const runTable = async () => {
  const data = await Appointment.findAll({});
  console.log("...........data : ",data)
}