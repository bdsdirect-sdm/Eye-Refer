"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const userAuth_1 = __importDefault(require("../middlewares/userAuth"));
const signupValidation_1 = __importDefault(require("../middlewares/formValidation.ts/signupValidation"));
const loginValidation_1 = __importDefault(require("../middlewares/formValidation.ts/loginValidation"));
const router = (0, express_1.Router)();
router.post("/register", signupValidation_1.default, userController_1.registerUser);
router.post("/login", loginValidation_1.default, userController_1.loginUser);
router.put("/verify", userController_1.verifyUser);
router.get("/user", userAuth_1.default, userController_1.getUser);
router.get("/doc-list", userAuth_1.default, userController_1.getDocList);
router.get("/doctor-list", userAuth_1.default, userController_1.getDoctorList);
router.get("/patient-list", userAuth_1.default, userController_1.getPatientList);
router.post("/add-patient", userAuth_1.default, userController_1.addPatient);
router.post("/add-address", userAuth_1.default, userController_1.addAddress);
router.post("/update-profile", userAuth_1.default, userController_1.updateprofile);
router.post("/change-password", userAuth_1.default, userController_1.changePassword);
router.put("/update-address", userAuth_1.default, userController_1.updateAddress);
router.post("/add-staff", userAuth_1.default, userController_1.addStaff);
router.get("/get-staff", userAuth_1.default, userController_1.getStaffList);
router.delete("/delete-address", userAuth_1.default, userController_1.deleteAddress);
router.post("/add-appointment", userAuth_1.default, userController_1.addAppointment);
router.get("/view-appointment/:appointmentId", userAuth_1.default, userController_1.getAppointmentDetails);
router.get("/appointment-list", userAuth_1.default, userController_1.getAppointmentList);
router.get("/patients-details/:patientId", userAuth_1.default, userController_1.getPatientDetails);
router.put("/update-appointment/:appointmentId", userAuth_1.default, userController_1.updateAppointment);
exports.default = router;
