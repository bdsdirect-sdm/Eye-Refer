import { Model, DataTypes } from 'sequelize';
import sequelize from "../config/db";
import { v4 as UUIDV4 } from "uuid";

class ChatRooms extends Model {
  public id!: string;
  public referedById!: string;
  public referedToId!: string;
  public patientId!: string;
  public roomId!:string
}

ChatRooms.init(
  {
    roomId:{
        type: DataTypes.UUID,
        allowNull:false,
        primaryKey: true
    },
    referedById: {
      type: DataTypes.UUID,
      allowNull: false,
  
    },
    referedToId: {
      type: DataTypes.UUID,
      allowNull: false,
  
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull:false
    }
  },
  {
    sequelize,
    modelName: 'ChatRooms',
  }
);

export default ChatRooms;