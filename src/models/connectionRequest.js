const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: "User"
    },

    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignore", "interested", "accepted", "rejected"],
            message: '{VALUE} is not a valid status type'
        },
    }
}, {
    timestamps: true
});


//compound index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;

    // check if fromUserId is same as toUserId
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        return next(new Error("You cannot send request to yourself"));
    }


    next();
})




const ConnectionRequest = new mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequest;