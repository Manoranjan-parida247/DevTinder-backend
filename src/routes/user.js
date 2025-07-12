const express = require('express');
const { userAuth } = require('../middlewares/auth');


const userRouter = express.Router();


//user rrquest api-> get all the pending connection request for loggedIn use
userRouter.get("/user/request", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
    } catch (error) {
        
    }
})



module.exports = userRouter;