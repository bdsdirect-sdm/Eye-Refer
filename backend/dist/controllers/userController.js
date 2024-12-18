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
exports.updateAppointment = exports.getAppointmentDetails = exports.getPatientDetails = exports.getAppointmentList = exports.addAppointment = exports.deleteAddress = exports.getStaffList = exports.addStaff = exports.updateAddress = exports.changePassword = exports.updateprofile = exports.getUserProfile = exports.getDoctorList = exports.addAddress = exports.addPatient = exports.getPatientList = exports.getDocList = exports.getUser = exports.loginUser = exports.verifyUser = exports.registerUser = void 0;
const env_1 = require("../environment/env");
const Address_1 = __importDefault(require("../models/Address"));
const Patient_1 = __importDefault(require("../models/Patient"));
const mailer_1 = __importDefault(require("../utils/mailer"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Staff_1 = __importDefault(require("../models/Staff"));
const Appointments_1 = __importDefault(require("../models/Appointments"));
const Appointments_2 = __importDefault(require("../models/Appointments"));
const Security_Key = env_1.Local.SECRET_KEY;
const otpGenerator = () => {
    return String(Math.round(Math.random() * 10000000000)).slice(0, 6);
};
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, doctype, email, password } = req.body;
        const isExist = yield User_1.default.findOne({ where: { email: email } });
        if (isExist) {
            res.status(401).json({ message: "User already Exist" });
        }
        else {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield User_1.default.create({
                firstname,
                lastname,
                doctype,
                email,
                password: hashedPassword,
            });
            if (user) {
                const OTP = otpGenerator();
                (0, mailer_1.default)(user.email, OTP);
                res.status(201).json({ OTP: OTP, message: "Data Saved Successfully" });
            }
            else {
                res.status(403).json({ message: "Something Went Wrong" });
            }
        }
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
});
exports.registerUser = registerUser;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ where: { email } });
        if (user) {
            user.is_verified = true;
            user.save();
            res.status(200).json({ message: "User Verfied Successfully" });
        }
        else {
            res.status(403).json({ message: "Something Went Wrong" });
        }
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
});
exports.verifyUser = verifyUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ where: { email } });
        if (user) {
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (isMatch) {
                if (user.is_verified) {
                    const token = jsonwebtoken_1.default.sign({ uuid: user.uuid }, Security_Key, {
                        expiresIn: "1hr",
                    });
                    res
                        .status(200)
                        .json({ token: token, user: user, message: "Login Successfull" });
                }
                else {
                    const OTP = otpGenerator();
                    (0, mailer_1.default)(user.email, OTP);
                    res
                        .status(200)
                        .json({ user: user, OTP: OTP, message: "OTP sent Successfully" });
                }
            }
            else {
                res.status(403).json({ message: "Invalid Password" });
            }
        }
        else {
            res.status(403).json({ message: "User doesn't Exist" });
        }
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
});
exports.loginUser = loginUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({
            where: { uuid: uuid },
            include: Address_1.default,
        });
        if (user) {
            const referCount = yield Patient_1.default.count({ where: { referedto: uuid } });
            const referCompleted = yield Patient_1.default.count({
                where: { referedto: uuid, referalstatus: 1 },
            });
            let docCount;
            if (user.doctype == 1) {
                docCount = yield User_1.default.count({ where: { is_verified: 1 } });
            }
            else {
                docCount = yield User_1.default.count({ where: { is_verified: 1, doctype: 1 } });
            }
            res.status(200).json({
                user: user,
                message: "User Found",
                docCount: docCount,
                referCount: referCount,
                referCompleted: referCompleted,
            });
        }
        else {
            res.status(404).json({ message: "User Not Found" });
        }
    }
    catch (err) {
        res.status(500).json({ message: `Error--->${err}` });
    }
});
exports.getUser = getUser;
const getDocList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("11111111111111");
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({ where: { uuid: uuid } });
        let docList;
        if ((user === null || user === void 0 ? void 0 : user.doctype) == 1) {
            docList = yield User_1.default.findAll({
                where: { uuid: { [sequelize_1.Op.ne]: uuid } },
                include: Address_1.default,
            });
        }
        else {
            docList = yield User_1.default.findAll({
                where: { doctype: 1, uuid: { [sequelize_1.Op.ne]: uuid } },
                include: Address_1.default,
            });
        }
        if (docList) {
            res.status(200).json({ docList: docList, message: "Docs List Found" });
        }
        else {
            res.status(404).json({ message: "MD List Not Found" });
        }
    }
    catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});
exports.getDocList = getDocList;
const getPatientList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({ where: { uuid: uuid } });
        if (user) {
            // Fetching the patient list with additional Appointments data
            let patientList = yield Patient_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [{ referedby: uuid }, { referedto: uuid }],
                },
                include: [
                    {
                        model: Appointments_1.default,
                        attributes: ["date", "type"], // Include the attributes you need from the Appointments model
                    },
                ],
            });
            if (patientList) {
                const plist = [];
                for (const patient of patientList) {
                    const [referedtoUser, referedbyUser, address] = yield Promise.all([
                        User_1.default.findOne({ where: { uuid: patient.referedto } }),
                        User_1.default.findOne({ where: { uuid: patient.referedby } }),
                        Address_1.default.findOne({ where: { uuid: patient.address } }),
                    ]);
                    // You can get the appointment data directly from the patient object as it's included in the query
                    const appointmentData = patient.Appointments
                        ? patient.Appointments[0]
                        : null;
                    // Prepare the patient data to be added to the response
                    const newPatientList = {
                        uuid: patient.uuid,
                        firstname: patient.firstname,
                        lastname: patient.lastname,
                        disease: patient.disease,
                        referalstatus: patient.referalstatus,
                        referback: patient.referback,
                        createdAt: patient.createdAt,
                        updatedAt: patient.updatedAt,
                        referedto: referedtoUser,
                        referedby: referedbyUser,
                        address: address,
                        dob: patient.dob,
                        notes: patient.notes,
                        appointmentDate: appointmentData ? appointmentData.date : null, // If an appointment exists, include the date
                        appointmentType: appointmentData ? appointmentData.type : null, // Include the type if available
                    };
                    plist.push(newPatientList);
                }
                console.log("Data----->", plist);
                res
                    .status(200)
                    .json({ patientList: plist, message: "Patient List Found" });
            }
            else {
                res.status(404).json({ message: "Patient List Not Found" });
            }
        }
        else {
            res.status(404).json({ message: "User Not Found" });
        }
    }
    catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});
exports.getPatientList = getPatientList;
const addPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({ where: { uuid: uuid } });
        if (user) {
            const { firstname, lastname, gender, email, dob, disease, address, referedto, referback, companyName, policyStartingDate, policyExpireDate, notes, phoneNumber, laterality, timing, speciality, } = req.body;
            const patient = yield Patient_1.default.create({
                firstname,
                lastname,
                gender,
                email,
                dob,
                disease,
                address,
                referedto,
                referback,
                companyName,
                policyStartingDate,
                policyExpireDate,
                notes,
                phoneNumber,
                laterality,
                timing,
                speciality,
                referedby: uuid,
            });
            if (patient) {
                res.status(200).json({ message: "Patient added Successfully" });
            }
        }
        else {
            res.status(401).json({ message: "you're not Authorised" });
        }
    }
    catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});
exports.addPatient = addPatient;
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({ where: { uuid: uuid } });
        if (user) {
            const { street, district, city, state, pincode, phone, title } = req.body;
            const address = yield Address_1.default.create({
                street,
                district,
                city,
                state,
                pincode,
                phone,
                title,
                user: uuid,
            });
            if (address) {
                res.status(200).json({ message: "Address added Successfully" });
            }
            else {
                res.status(400).json({ message: "Error in Saving Address" });
            }
        }
        else {
            res.status(401).json({ message: "you're not Authorised" });
        }
    }
    catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});
exports.addAddress = addAddress;
const getDoctorList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        console.log("User UUID:", req.user);
        const user = yield User_1.default.findOne({
            where: { uuid: uuid },
            include: Address_1.default,
        });
        if (user) {
            const referCount = yield Patient_1.default.count({ where: { referedto: uuid } });
            const referCompleted = yield Patient_1.default.count({
                where: { referedto: uuid, referalstatus: 1 },
            });
            const docCount = yield User_1.default.count({
                where: {
                    is_verified: 1,
                    doctype: [1, 2],
                },
            });
            const doctorList = yield User_1.default.findAll({
                where: {
                    doctype: [1, 2],
                    is_verified: 1,
                },
                include: Address_1.default,
            });
            res.status(200).json({
                user,
                message: "User Found",
                docCount,
                referCount,
                referCompleted,
                doctorList,
            });
        }
        else {
            res.status(404).json({ message: "User Not Found" });
        }
    }
    catch (err) {
        console.error("Error fetching doctor list:", err);
        res.status(500).json({ message: `Error: ${err}` });
    }
});
exports.getDoctorList = getDoctorList;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({
            where: { uuid: uuid },
            include: Address_1.default,
        });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        // Fetch additional counts or data based on the user type
        let profileDetails = {
            user: user,
            message: "User Found",
        };
        if (user.doctype === 1) {
            // If user is a Doctor
            // Doctor-specific data
            const patientCount = yield Patient_1.default.count({ where: { referedto: uuid } });
            const referredPatients = yield Patient_1.default.findAll({
                where: { referedto: uuid },
            });
            profileDetails = Object.assign(Object.assign({}, profileDetails), { patientCount: patientCount, referredPatients: referredPatients });
        }
        else if (user.doctype === 2) {
            // If user is a Patient
            // Patient-specific data
            const referredDoctors = yield User_1.default.findAll({
                where: { uuid: { [sequelize_1.Op.in]: user.referredby } },
                include: Address_1.default,
            });
            profileDetails = Object.assign(Object.assign({}, profileDetails), { referredDoctors: referredDoctors });
        }
        else {
            profileDetails = Object.assign(Object.assign({}, profileDetails), { additionalData: "Custom data for Admin or other types" });
        }
        res.status(200).json(profileDetails);
    }
    catch (err) {
        res.status(500).json({ message: `Error--->${err}` });
    }
});
exports.getUserProfile = getUserProfile;
const updateprofile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const { firstname, lastname, phone, email, gender } = req.body;
        const user = yield User_1.default.findOne({ where: { uuid: uuid } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.phone = phone || user.phone;
        user.email = email || user.email;
        user.gender = gender || user.gender;
        yield user.save();
        return res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating profile" });
    }
});
exports.updateprofile = updateprofile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const { currentPassword, newPassword } = req.body;
        const user = yield User_1.default.findOne({ where: { uuid } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(403).json({ message: "Current password is incorrect" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        return res.status(200).json({ message: "Password updated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating password" });
    }
});
exports.changePassword = changePassword;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const { street, district, city, state, pincode, phone } = req.body;
        const user = yield User_1.default.findOne({ where: { uuid: uuid } });
        if (!user) {
            return res.status(401).json({ message: "You're not authorized" });
        }
        const address = yield Address_1.default.findOne({ where: { user: uuid } });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        address.street = street || address.street;
        address.district = district || address.district;
        address.city = city || address.city;
        address.state = state || address.state;
        address.pincode = pincode || address.pincode;
        address.phone = phone || address.phone;
        yield address.save();
        return res.status(200).json({ message: "Address updated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating address" });
    }
});
exports.updateAddress = updateAddress;
const addStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const user = yield User_1.default.findOne({ where: { uuid } });
        console.log("USER????????????????????", user);
        const { staffName, gender, email, phone } = req.body;
        if (!staffName || !email || !phone || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const staff = yield Staff_1.default.create({
            staffName,
            gender,
            email,
            phone,
            userId: uuid,
        });
        console.log("STAFF??????????", staff);
        if (staff) {
            return res.status(201).json({ message: "Staff added successfully" });
        }
        else {
            return res.status(400).json({ message: "Error in adding staff" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Error: ${err || err}` });
    }
});
exports.addStaff = addStaff;
const getStaffList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("testin");
        const { uuid } = req.user;
        const staffList = yield Staff_1.default.findAll({
            where: { userId: uuid },
            attributes: ["uuid", "staffName", "email", "phone", "gender"],
        });
        console.log("stafff list ---------------->", staffList);
        if (staffList.length > 0) {
            res.status(200).json(staffList);
            return;
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error, please try again later." });
        return;
    }
});
exports.getStaffList = getStaffList;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const address = yield Address_1.default.findOne({ where: { user: uuid } });
        if (address) {
            yield address.destroy();
            return res.status(200).json({ message: "Address deleted successfully" });
        }
        else {
            return res
                .status(404)
                .json({ message: "Address not found for this user" });
        }
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ message: "Server error, please try again later" });
    }
});
exports.deleteAddress = deleteAddress;
const addAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const { patientId, type, date } = req.body;
        const user = yield User_1.default.findOne({ where: { uuid } });
        if (!user || user.doctype !== 1) {
            return res
                .status(403)
                .json({ message: "Only doctors can create appointments" });
        }
        const patient = yield Patient_1.default.findOne({ where: { uuid: patientId } });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        const appointment = yield Appointments_1.default.create({
            patientId,
            userId: uuid,
            type,
            date,
        });
        res.status(201).json({
            message: "Appointment added successfully",
            appointment,
        });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error while adding appointment", error: err.message });
    }
});
exports.addAppointment = addAppointment;
// export const viewAppointment = async (req: any, res: any) => {
//   try {
//     const { uuid } = req.user;
//     const { appointmentId, patientId, type, date } = req.body;
//     const appointment = await Appointments.findOne({
//       where: { id: appointmentId },
//       attributes: ["uuid"],
//       include: [
//         {
//           model: Patient,
//           attributes: ["firstname", "lastname"],
//         },
//       ],
//     });
//     console.log("aaaaa", appointment);
//     if (!appointment) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }
//     const patient = await Patient.findOne({ where: { uuid: patientId } });
//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }
//   } catch (err: any) {
//     console.error(err);
//     res
//       .status(500)
//       .json({
//         message: "Error while  appointment",
//         error: err.message,
//       });
//   }
// };
const getAppointmentList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid: userId } = req.user;
        const appointments = yield Appointments_2.default.findAll({
            where: {
                userId: userId,
            },
            attributes: ["uuid", "date", "type"],
            include: [
                {
                    model: Patient_1.default,
                    attributes: [
                        "uuid",
                        "firstname",
                        "lastname",
                        "gender",
                        "email",
                        "dob",
                        "disease",
                        "referalstatus",
                        "notes",
                        "policyStartingDate",
                        "policyExpireDate",
                        "laterality",
                    ],
                },
                {
                    model: User_1.default,
                    attributes: ["uuid", "firstname", "lastname", "email"],
                },
            ],
        });
        console.log("apponmtsbdhgfye", appointments);
        // if (!appointments || appointments.length === 0) {
        //     res.status(404).json({ message: 'No appointments found for this user.' });
        //     return;
        // }
        res.status(200).json(appointments);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.getAppointmentList = getAppointmentList;
const getPatientDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patientId = req.params.patientId;
        const patient = yield Patient_1.default.findOne({
            where: { uuid: patientId },
            include: [
                {
                    model: User_1.default,
                    as: "referedtoUser",
                    attributes: ["firstname", "lastname", "doctype"],
                },
                {
                    model: User_1.default,
                    as: "referedbyUser",
                    attributes: ["firstname", "lastname", "doctype"],
                },
                {
                    model: Address_1.default,
                    attributes: ["street", "city", "state", "pincode"],
                },
                {
                    model: Appointments_1.default,
                    attributes: ["date", "type"],
                },
            ],
        });
        const appoinment = yield Appointments_2.default.findOne({ where: { patientId } });
        if (patient) {
            // Construct the response object
            const patientDetails = {
                uuid: patient.uuid,
                firstname: patient.firstname,
                lastname: patient.lastname,
                gender: patient.gender,
                email: patient.email,
                dob: patient.dob,
                disease: patient.disease,
                referalstatus: patient.referalstatus,
                referback: patient.referback,
                companyName: patient.companyName,
                policyStartingDate: patient.policyStartingDate,
                policyExpireDate: patient.policyExpireDate,
                notes: patient.notes,
                phoneNumber: patient.phoneNumber,
                laterality: patient.laterality,
                timing: patient.timing,
                speciality: patient.speciality,
                // createdAt: patient.createdAt,
                // updatedAt: patient.updatedAt,
                referedto: patient.referedtoUser,
                referedby: patient.referedbyUser,
                address: patient.Address,
                appointment: appoinment,
            };
            res.status(200).json({
                patientDetails,
                message: "Patient Details Found",
            });
        }
        else {
            res.status(404).json({ message: "Patient Not Found" });
        }
    }
    catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});
exports.getPatientDetails = getPatientDetails;
const getAppointmentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointmentId = req.params.appointmentId;
        const appoinment = yield Appointments_2.default.findOne({
            where: { uuid: appointmentId },
        });
        const patient = yield Patient_1.default.findOne({
            where: { uuid: appoinment === null || appoinment === void 0 ? void 0 : appoinment.patientId },
        });
        res.status(200).json({
            appoinment,
            patient,
            message: "Patient Details Found",
        });
    }
    catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});
exports.getAppointmentDetails = getAppointmentDetails;
// export const updateAppointment = async (req: any, res: Response) => {
//     try {
//       const appointmentId = req.params.appointmentId;
//       const appoinment = await Appointment.findOne({
//         where: { uuid: appointmentId },
//       });
//       const patient = await Patient.findOne({
//         where: { uuid: appoinment?.patientId },
//       });
//       res.status(200).json({
//         appoinment,
//         patient,
//         message: "Patient Details Found",
//       });
//     } catch (err) {
//       res.status(500).json({ message: `${err}` });
//     }
//   };
const updateAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uuid } = req.user;
        const appointmentId = req.params.appointmentId;
        const { appointmentDate, appointmentType } = req.body;
        const appoinment = yield Appointments_2.default.findOne({ where: { uuid: appointmentId } });
        if (!appoinment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        appoinment.date = appointmentDate || appoinment.date;
        appoinment.type = appointmentType || appoinment.type;
        yield appoinment.save();
        return res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating profile" });
    }
});
exports.updateAppointment = updateAppointment;
