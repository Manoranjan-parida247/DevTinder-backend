const express = require('express');
const { userAuth } = require('../middlewares/auth')
const { validateProfileEditData, validatePasswordData } = require('../utils/validation')
const bcrypt = require('bcrypt');


const profileRouter = express.Router();

// GET /profile - Protected route
profileRouter.get('/view', userAuth, async (req, res) => {
  try {
    const user = req.user;

    // Optional: remove sensitive fields before sending the user object
    const { password, ...safeUser } = user.toObject ? user.toObject() : user;

    res.status(200).json({
      statusCode: 200,
      message: "Fetched profile data successfully",
      data: safeUser,
    });

  } catch (error) {
    console.error("Error fetching profile:", error.message);

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while fetching profile",
      error: error.message,
    });
  }
});

//profile edit api
profileRouter.patch("/edit", userAuth, async (req, res) => {

  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Request body cannot be empty"
      })
    }
    //data sanitization 
    if (!validateProfileEditData(req)) {
      return res.status(400).json({
        statusCode: 400,
        message: " Invalid edit request"
      })
    }

    const loggedInUser = req.user;
    // console.log(loggedInUser);

    // Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    loggedInUser.set(req.body);

    // console.log(loggedInUser);

    await loggedInUser.save();

    res.status(200).json({
      statusCode: 200,
      message: "Profile updated successfully!",
      data: loggedInUser
    })
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        statusCode: 400,
        message: " Invalid edit request"
      })
    }
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while updating profile!!",
      error: err.message
    })
  }

})

profileRouter.patch('/updatePassword', userAuth, async (req, res) => {
  try {
    if (!validatePasswordData(req)) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid password update request"
      })
    }

    const { oldPassword, newPassword } = req.body;
    const loggedInUser = req.user;

    const isPasswordSame = await bcrypt.compare(oldPassword, loggedInUser.password);

    if (!isPasswordSame) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid current password!"
      })
    }

    // Prevent reusing the same password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        statusCode: 400,
        message: "New password must be different from old password"
      });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    loggedInUser.password = passwordHash;

    await loggedInUser.save();
    return res.status(200).json({
      statusCode: 200,
      message: "Password updated successfully!"
    })



  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        statusCode: 400,
        message: " Invalid update request"
      })
    }
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while updating password!!",
      error: err.message,
      errorName: err.name
    })
  }
})

module.exports = profileRouter;