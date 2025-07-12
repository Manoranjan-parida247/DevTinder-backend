const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require('cookie-parser')



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user')

app.use('/', authRouter);
app.use('/profile', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);


//get user by email
// app.get('/user', async (req, res) => {
//     const email = req.body.emailId;

//     try {
//         const user = await User.findOne({ emailId: email }).exec();
//         if (!user) {
//             return res.status(404).json({
//                 statusCode: 404,
//                 message: "User not found"
//             });
//         }

//         res.status(200).json({
//             statusCode: 200,
//             message: "User found",
//             user
//         });
//     } catch (err) {
//         res.status(500).json({
//             statusCode: 500,
//             message: "Error while finding user!!",
//             error: err.message
//         })
//     }
// })

//feed api - GET /feed -> get all thw users from the database
// app.get("/feed", async (req, res) => {
//     try {
//         const users = await User.find({});

//         if (users.length === 0) {
//             return res.status(200).json({
//                 statusCode: 200,
//                 message: "No users available. Please add some users.",
//                 data: []
//             });
//         }

//         res.status(200).json({
//             statusCode: 200,
//             message: "Users fetched successfully.",
//             data: users
//         });

//     } catch (error) {
//         res.status(500).json({
//             statusCode: 500,
//             message: "Error while fetching users!",
//             error: error.message
//         });
//     }
// });


//update api 
// app.patch('/user/:id', async (req, res) => {
//     const userId = req.params?.id;
//     const updateData = req.body;

//     try {
//         const ALLOWED_UPDATES = ["fullName", "age", "photoUrl", "skills", "about", "gender"];
//         const isUpdateAllowed = Object.keys(updateData).every((k) => ALLOWED_UPDATES.includes(k));
//         if (!isUpdateAllowed) {
//             return res.status(400).json({
//                 statusCode: 400,
//                 message: "Updates not allowed"
//             })
//         };

//         if (updateData.skills.length > 10) {
//             return res.status(400).json({
//                 statusCode: 400,
//                 message: "Skills can not be more than 10"
//             })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: "after", runValidators: true, });

//         // console.log("Updated user :", updatedUser);

//         if (!updatedUser) {
//             return res.status(404).json({
//                 statusCode: 404,
//                 message: "User not found"
//             })
//         }

//         res.status(200).json({
//             statusCode: 200,
//             message: "User updated successfully",
//             data: updatedUser
//         })
//     } catch (err) {
//         res.status(500).json({
//             statusCode: 500,
//             message: "Error while fetching users!",
//             error: err.message
//         });
//     }
// })

//delete api
// app.delete('/user/:id', async (req, res) => {
//     try {
//         const deletedUser = await User.findByIdAndDelete(req.params.id);

//         if (!deletedUser) {
//             return res.status(404).json({
//                 statusCode: 404,
//                 message: "User not found"
//             })
//         }

//         res.status(200).json({
//             statusCode: 200,
//             message: "User deleted successfully",
//             deletedUser
//         })
//     } catch (err) {
//         res.status(500).json({
//             statusCode: 500,
//             message: "error while deleting user",
//             error: err.message
//         })
//     }
// })



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