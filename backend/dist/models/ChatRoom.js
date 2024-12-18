"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ChatRooms extends sequelize_1.Model {
}
ChatRooms.init({
    roomId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    referedById: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    referedToId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize: db_1.default,
    modelName: 'ChatRooms',
});
exports.default = ChatRooms;
