const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address! " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Please enter a strong password!");
            }
        }
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error ("Gender data is not valid !!");
            }
        }
    }, 
    photoUrl: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid photo url! ")
            }
        }
    },
    skills: {
        type: [String]
    },
    about: {
        type: String,
        default: "This is a default about description of the user!",
        maxLength: 200
    }
}, {timestamps: true});


userSchema.methods.getJWT = async function(){
    const user = this;

    const token = await jwt.sign({_id: user._id}, "Manoranjan@247", {expiresIn: "7d"});
    return token;
}

userSchema.methods.validatePassword = async function(password){
    const user = this;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid; 
}
const User = mongoose.model("User", userSchema);
module.exports = User;

// module.exports = mongoose.model("User", userSchema); // same meaning  of above two line