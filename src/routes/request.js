const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth')
const User = require('../models/user')
const ConnectionRequest = require('../models/connectionRequest')

//connection request sending api
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // Validate to userId is a mongoDB id
        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({
                statusCode: 400,
                message: "Invalid user ID format"
            });
        }

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                statusCode: 400,
                message: "Invalid status type"

            })
        }

        // check if fromUserId is same as toUserId
        // if (fromUserId.equals(toUserId)) {
        //     return res.status(400).json({
        //         statusCode: 400,
        //         message: "You can not send request to yourself",
        //     })
        // }

        //user should be exist in db to before send  a connetion
        const user = await User.findById(toUserId);
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "user not found !!"
            })
        }

        //check if there is an existing connection request
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ]
        })

        //should send here match, which i will do it later
        if (existingConnectionRequest) {
            return res.status(409).json({
                statusCode: 409,
                message: "Connection request alreadt exist!"
            })
        }



        const newConnectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status
        })

        const data = await newConnectionRequest.save();
        res.status(200).json({
            statusCode: 200,
            message: "Connection request sent successfully",
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

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const status = req.params.status;
        const requestId = req.params.requestId;

        //validate status
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                statusCode: 400,
                message: "Invalid status type"
            })
        }

        //check request id present in the db or not
        const currConnectionRequest = await ConnectionRequest.findOne({ _id: requestId, toUserId: loggedInUser._id, status: "interested" });

        if(!currConnectionRequest){
            return res.status(404).json({
                statusCode: 404,
                message: "Connection request not found!"
            })
        }

        currConnectionRequest.status = status;
        const data = await currConnectionRequest.save();

        res.status(200).json({
            statusCode : 200,
            message: "connection request" + status,
            data: data
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
module.exports = requestRouter;