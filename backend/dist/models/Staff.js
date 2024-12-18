"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const uuid_1 = require("uuid");
const User_1 = __importDefault(require("./User"));
class Staff extends sequelize_1.Model {
}
Staff.init({
    uuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: uuid_1.v4,
        primaryKey: true,
        allowNull: false,
    },
    staffName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    // lastname: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // lastname: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    }
}, {
    sequelize: db_1.default,
    modelName: 'Staff',
});
User_1.default.hasMany(Staff, { foreignKey: 'referedby', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Staff.belongsTo(User_1.default, { foreignKey: 'referedby', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
exports.default = Staff;
