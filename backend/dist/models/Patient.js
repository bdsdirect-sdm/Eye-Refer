"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const uuid_1 = require("uuid");
const Address_1 = __importDefault(require("./Address"));
const User_1 = __importDefault(require("./User"));
class Patient extends sequelize_1.Model {
}
Patient.init({
    uuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: uuid_1.v4,
        primaryKey: true,
        allowNull: false,
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dob: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    disease: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    referalstatus: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    referback: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    policyStartingDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    policyExpireDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    laterality: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    timing: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    speciality: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Patient'
});
User_1.default.hasMany(Patient, { foreignKey: 'referedby', as: 'referedbyUser', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient.belongsTo(User_1.default, { foreignKey: 'referedby', as: 'referedbyUser', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User_1.default.hasMany(Patient, { foreignKey: 'referedto', as: 'referedtoUser', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient.belongsTo(User_1.default, { foreignKey: 'referedto', as: 'referedtoUser', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Address_1.default.hasMany(Patient, { foreignKey: "address", onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient.belongsTo(Address_1.default, { foreignKey: "address", onDelete: 'CASCADE', onUpdate: 'CASCADE' });
exports.default = Patient;
