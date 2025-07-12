const express = require('express');
const {validateSignUpData} = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');



const authRouter = express.Router();


// Signup api - post /signup
authRouter.post("/signup", async (req, res) => {
    // console.log(req.body);
    try {
        //validation of data
        validateSignUpData(req);

        const {fullName, emailId, password} = req.body;

        //encrypt the password and store to the database
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({fullName, emailId, password: passwordHash});
        await user.save();
        // res.send("user added successfully!!!!!!");
        res.status(201).json({
            statusCode: 201,
            message: "User added successfully!!"
        })
    } catch (err) {
        res.status(400).json({
            statusCode: 400,
            message: "Error saving user!!",
            error: err.message
        })
    }

})


//login api
authRouter.post("/login", async (req, res) => {
    try {
      // console.log(req.body)
      const { emailId, password } = req.body;
  
      // Check for empty inputs
      if (!emailId || !password) {
        return res.status(400).json({
          statusCode: 400,
          message: "Email and password are required"
        });
      }
  
      // Find user by email
      const user = await User.findOne({ emailId });
      if (!user) {
        return res.status(401).json({
          statusCode: 401,
          message: "Invalid credentials"
        });
      }
  
      // Compare password
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          statusCode: 401,
          message: "Invalid credentials"
        });
      }
  
      // Generate JWT token
      // const token2 = await jwt.sign({_id: user._id}, "Manoranjan@247", {expiresIn: "7d"});
      const token = await user.getJWT();
  
      // Set token in cookie (optional)
      // res.cookie("token", token);
      res.cookie("token", token, {
        // httpOnly: true, // prevents access via JavaScript
        // secure: process.env.NODE_ENV === "production", // send over HTTPS in prod
        // sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 day
      });
  
      // Send success response
      res.status(200).json({
        statusCode: 200,
        message: "Login successful",
        token // optionally send in body if needed by frontend
      });
  
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        message: "Error while logging in",
        error: err.message
      });
    }
  });


//logout api
authRouter.post("/logout", async(req, res) => {

  try {
    res.cookie('token', null, {
      maxAge: 0
    })
  
    res.status(200).json({
      statusCode: 200,
      message: "logout successfully"
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Error while logging out!",
      error: err.message
    })
  }
  


})

module.exports = authRouter;
