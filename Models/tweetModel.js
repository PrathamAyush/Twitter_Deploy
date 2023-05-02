const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const TweetSchema = new mongoose.Schema({
    tweets: {
        type: String,
        require: true,
    },
    tweetedBy: {
        type: ObjectId,
        ref: "User",
        required: true,
    },
    likes: [
        {
            type: ObjectId,
            ref: "User",
        }
    ],
    retweetedBy: [
        {
            user: {
                type: ObjectId,
                ref: "User",
            },
            name: {
                type: String,
                required: true,
            },
        }
    ],
    image: {
        type: String,

    },

    comments: [
        {
            text: {
                type: String,
                required: true
            },
            commentedBy: {
                type: ObjectId,
                ref: "User"
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            cmtLike: [{
                type: ObjectId,
                ref: "User",
            }],
            replies: [
                {
                    text: {
                        type: String,
                        required: true
                    },
                    repliedBy: {
                        type: ObjectId,
                        ref: "User"
                    },
                    parentComment: {
                        type: ObjectId,
                        ref: "Comments"
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
        }
    ]
}, { timestamps: true });
module.exports = mongoose.model("Tweet", TweetSchema);