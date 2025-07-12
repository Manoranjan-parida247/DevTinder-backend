const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest')

const userRouter = express.Router();


//user rrquest api-> get all the pending connection request for loggedIn use
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;


        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName"]);
        // populate("fromUserId", "firstName lastName");

        res.status(200).json({
            message: "Data fetched successfully!",
            data: connectionRequests
        })
    } catch (error) {
        console.error("Error sending connection request:", err);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: err.message
        })
    }
})



module.exports = userRouter;