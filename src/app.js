const express = require("express");
const connectDB = require("./config/database");
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// Signup api - post /signup
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
  try {
    console.log(req.body)
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user.id }, "Manoranjan@247", {
      expiresIn: "1d" // optional expiry
    });

    // Set token in cookie (optional)
    res.cookie("token", token, {
      httpOnly: true, // prevents access via JavaScript
      secure: process.env.NODE_ENV === "production", // send over HTTPS in prod
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
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


//profile
app.get('/profile', async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized: No token provided"
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, "Manoranjan@247"); // sync is fine here
    const { _id } = decoded;

    // Fetch the user
    const user = await User.findById(_id).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found"
      });
    }

    // Respond with user data
    res.status(200).json({
      statusCode: 200,
      message: "Fetched profile data successfully",
      data: user
    });

  } catch (error) {
    console.error("Error fetching profile:", error.message);

    // Token error types
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid or expired token"
      });
    }

    // Generic server error
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while fetching profile",
      error: error.message
    });
  }
});


//get user by email
app.get('/user', async (req, res) => {
    const email = req.body.emailId;

    try {
        const user = await User.findOne({ emailId: email }).exec();
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: "User found",
            user
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: "Error while finding user!!",
            error: err.message
        })
    }
})

//feed api - GET /feed -> get all thw users from the database
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});

        if (users.length === 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "No users available. Please add some users.",
                data: []
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: "Users fetched successfully.",
            data: users
        });

    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Error while fetching users!",
            error: error.message
        });
    }
});


//update api 
app.patch('/user/:id', async (req, res) => {
    const userId = req.params?.id;
    const updateData = req.body;

    try {
        const ALLOWED_UPDATES = ["fullName", "age", "photoUrl", "skills", "about", "gender"];
        const isUpdateAllowed = Object.keys(updateData).every((k) => ALLOWED_UPDATES.includes(k));
        if (!isUpdateAllowed) {
            return res.status(400).json({
                statusCode: 400,
                message: "Updates not allowed"
            })
        };

        if (updateData.skills.length > 10) {
            return res.status(400).json({
                statusCode: 400,
                message: "Skills can not be more than 10"
            })
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: "after", runValidators: true, });

        // console.log("Updated user :", updatedUser);

        if (!updatedUser) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        res.status(200).json({
            statusCode: 200,
            message: "User updated successfully",
            data: updatedUser
        })
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: "Error while fetching users!",
            error: err.message
        });
    }
})

//delete api

app.delete('/user/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        res.status(200).json({
            statusCode: 200,
            message: "User deleted successfully",
            deletedUser
        })
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: "error while deleting user",
            error: err.message
        })
    }
})

connectDB()
    .then(() => {
        console.log("Database connection established");

        app.listen(7777, () => {
            console.log("Server is successfully running on server 7777....");
        });


    })
    .catch((err) => {
        console.error("Database can not be connected!!!");
    });