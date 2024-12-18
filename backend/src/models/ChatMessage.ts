import { Model, DataTypes } from 'sequelize';
import sequelize from "../config/db";

class ChatMessages extends Model {
  public id!: number;
  public chatRoomId!: string;
  public senderId!: string;
  public message!: string;
}

ChatMessages.init(
  {
    chatRoomId: {
      type: DataTypes.STRING,
      allowNull: false,
    
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessages',
  }
);

export default ChatMessages;