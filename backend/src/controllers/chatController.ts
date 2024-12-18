import { Request, Response } from 'express';
import ChatMessages from '../models/ChatMessage';
import ChatRooms from '../models/ChatRoom';
import { Op } from 'sequelize';
import User from '../models/User';
import Patient from '../models/Patient';

export const getOrCreateChatRoom = async (req: Request, res: Response): Promise<void> => {
    const { referedById, referedToId,patientId, roomId } = req.body;
    try {
        let chatRoom = await ChatRooms.findOne({
            where: {
                referedById,
                referedToId,
                patientId,
            }
        });
        if (!chatRoom) {
            chatRoom = await ChatRooms.create({ referedById, referedToId ,patientId,roomId});
        }
        res.status(200).json(chatRoom); 
    } catch (error) {
        console.error('Error getting or creating chat room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { chatRoomId, senderId, message } = req.body;
  
    try {
      const chatRoomExists = await ChatRooms.findOne({
        where: { roomId: chatRoomId }, 
      });
  
      if (!chatRoomExists) {
        res.status(404).json({ error: 'Chat room not found' });
        return;
      }
  
      const chatMessage = await ChatMessages.create({ chatRoomId, senderId, message });
  
      res.status(201).json(chatMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  
  export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    const { chatRoomId } = req.params;

    try {
       
        const messages = await ChatMessages.findAll({
            where: { chatRoomId },
           
        });

     
        const messagesWithUsers = await Promise.all(
            messages.map(async (message) => {
              
                const user = await User.findOne({ where: { uuid: message.senderId } });

                
                console.log("sender first name", user ? user.firstname : 'Unknown');
                console.log("sender last name", user ? user.lastname : 'Unknown');

              
                return {
                    ...message.toJSON(),
                    senderFirstName: user ? user.firstname : 'Unknown',
                    senderLastName: user ? user.lastname : 'Unknown',
                };
            })
        );

        res.status(200).json(messagesWithUsers);

    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

  
export const getUserChatRooms = async (req: any, res: Response): Promise<void> => {
  try {
    const { uuid } = req.user;

    
    const chatRooms = await ChatRooms.findAll({
      where: {
        [Op.or]: [
          { referedById: uuid },
          { referedToId: uuid },
        ]
      },
    });

  
    if (!chatRooms || chatRooms.length === 0) {
      res.status(404).json({ message: 'No chat rooms found for this user' });
      return;
    }

 
    const chatRoomsWithPatientNames = await Promise.all(chatRooms.map(async (chatRoom) => {
      const patientId = chatRoom.dataValues.patientId;

     
      const patient = await Patient.findOne({ where: { uuid: patientId } });

      if (patient) {
      
        return {
          ...chatRoom.dataValues, 
          patientName: `${patient.firstname} ${patient.lastname}`,  
        };
      }

    
      return chatRoom.dataValues;
    }));

 
    res.status(200).json(chatRoomsWithPatientNames);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};