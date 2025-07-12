const validator = require('validator');

const validateSignUpData = (req) => {
    const { fullName, emailId, password } = req.body;

    if (!fullName) {
        throw new Error("Fullname is required");
    }
    if (fullName.length < 3 || fullName.length > 30) {
        throw new Error("Fullname should be 3-30 characters");
    }
    if (!emailId) {
        throw new Error("Email is required");
    }
    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    }
    if (!password) {
        throw new Error("Password is required");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Password is not strong enough");
    }
};


const validateProfileEditData = (req) => {
    const allowedEditFields = ['fullName', 'age', 'gender', 'photoUrl', 'skills', 'about'];

    const isEditAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));

    return isEditAllowed;
}

const validatePasswordData = (req) => {
    const allowedEditField = ['oldPassword', 'newPassword'];

    const isUpdateAllowed = Object.keys(req.body).every((field) => allowedEditField.includes(field));

    return isUpdateAllowed;
}
module.exports = {
    validateSignUpData,
    validateProfileEditData,
    validatePasswordData
}