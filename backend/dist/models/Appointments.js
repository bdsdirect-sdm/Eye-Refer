"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const uuid_1 = require("uuid");
const User_1 = __importDefault(require("./User"));
const Patient_1 = __importDefault(require("./Patient"));
class Appointment extends sequelize_1.Model {
}
Appointment.init({
    uuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: uuid_1.v4,
        primaryKey: true,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'uuid',
        },
    },
}, {
    sequelize: db_1.default,
    modelName: 'Appointment',
});
User_1.default.hasMany(Appointment, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Appointment.belongsTo(User_1.default, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient_1.default.hasMany(Appointment, { foreignKey: 'patientId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Appointment.belongsTo(Patient_1.default, { foreignKey: 'patientId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
exports.default = Appointment;
