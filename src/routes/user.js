const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

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
    } catch (err) {
        console.error("Error sending connection request:", err);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: err.message
        })
    }
})

//connections api -> the work of the api to see , loggedIn user's accepted request
userRouter.get("/user/get-all-connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" },
            ]
        }).populate("fromUserId", ["firstName", "lastName"])
            .populate("toUserId", ["firstName", "lastName"])


        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.status(200).json({
            message: "Accepted connectionRequests Data fetched successfully!",
            data: data
        })
    } catch (err) {
        console.error("Error sending connection request:", err);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: err.message
        })
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        //user should see all the users card expect
        //his own card
        //his connection
        //ignored peopele
        // already sent the connection request

        const loggedInUser = req.user;

        const page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        limit = limit > 50 ? 50 : limit
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        }).select("fromUserId toUserId");
        // console.log(connectionRequests)

        const hideUserFromFeed = new Set();

        connectionRequests.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        })

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ],

        }).select("fromUserId toUserId").skip(skip).limit(limit);
        // console.log(users)

    } catch (err) {
        console.error("Error sending connection request:", err);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: err.message
        })
    }
})

module.exports = userRouter;