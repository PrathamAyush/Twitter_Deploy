const express = require("express");
const router = express.Router();
const Tweet = require("../Models/tweetModel");
const { verifyToken } = require("../Middleware/authMiddleWare");

// Create a tweet (Tested)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { tweets, tweetedBy, image } = req.body;
        if (!tweets || !tweetedBy) {
            return res.status(400).json({ message: "Somthing left Behind" })
        }
        const tweetText = new Tweet({ tweets, tweetedBy, image });
        await tweetText.save();
        res.status(201).json(tweets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all tweets (Tested)
router.get("/", async (req, res) => {
    try {
        const tweets = await Tweet.find().sort({ createdAt: -1 });
        res.json(tweets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get all my tweets
router.get("/:id/alltweets", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.find({ tweetedBy: req.params.id }).sort({ createdAt: -1 })
            .populate("tweetedBy", "fullname username image")
            .populate({
                path: "comments",
                populate: {
                    path: "commentedBy",
                    select: "fullname username image",
                },
            });
        res.json(tweet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get a tweet by ID (Tested)
router.get("/:tweetId", async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId).populate("tweetedBy", "fullname username image")
            .populate({
                path: "comments",
                populate: {
                    path: "commentedBy",
                    select: "fullname username image",
                },
            });
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        res.json(tweet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update a tweet by ID (Tested)
router.patch("/:id", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        res.json(tweet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a tweet by ID (Tested)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndDelete(req.params.id);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        res.json({ message: "Tweet deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Likes And Dislike Route
router.put("/:id/likes", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet.likes.includes(req.body.id)) {
            await tweet.updateOne({ $push: { likes: req.body.id } })
            res.status(200).json("You like The Tweet")
        } else {
            await tweet.updateOne({ $pull: { likes: req.body.id } })
            res.status(200).json("You Dislike The Tweet");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Retweet or undo retweet a tweet
// Retweet or undo retweet a tweet
router.post("/:id/retweet", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id).populate("retweetedBy.user", "fullname");
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        } else {
            const retweetedByUser = tweet.retweetedBy.some(user => user.user.equals(req.user.id));
            console.log(retweetedByUser)
            if (retweetedByUser) {
                // User has already retweeted the tweet, so undo the retweet
                await tweet.updateOne({ $pull: { retweetedBy: { user: req.user.id, name: req.user.fullname } } });

                // Find the newly created tweet and delete it
                const retweet = await Tweet.findOne({ retweetedBy: { $elemMatch: { user: req.user.id } } });
                if (retweet) {
                    await Tweet.deleteOne({ _id: retweet._id });
                }
                res.status(200).json({ message: "Retweet undone" });
            } else {

                // User has not retweeted the tweet, so retweet it
                const retweet = {
                    tweets: tweet.tweets,
                    originalTweet: req.params.id,
                    tweetedBy: tweet.tweetedBy,
                    image: tweet.image,
                    likes: tweet.likes,
                    comments: tweet.comments,
                    retweetedBy: [{ user: req.user.id, name: req.user.fullname }],
                };
                await tweet.updateOne({ $push: { retweetedBy: { user: req.user.id, name: req.user.fullname } } });
                await Tweet.create(retweet);
                const retweetingUsers = tweet.retweetedBy.map((user) => user.name);
                res.status(201).json({ message: "Tweet retweeted", retweet: retweetingUsers });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});




// Create a comment on a tweet
router.post("/:id/comments", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id).populate("comments", "fullname image username");
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        const comment = {
            text: req.body.text,
            commentedBy: req.user.id,
        };
        await tweet.updateOne({ $push: { comments: comment } });
        res.status(200).json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Reply to a comment on a tweet
// router.post("/:tweetId/comments/:commentId", verifyToken, async (req, res) => {
//     try {
//         const tweet = await Tweet.findById(req.params.tweetId).populate("comments.replies.repliedBy", "fullname username image");
//         if (!tweet) {
//             return res.status(404).json({ message: "Tweet not found" });
//         }
//         const comment = tweet.comments.find(
//             (c) => c._id.toString() === req.params.commentId
//         );
//         if (!comment) {
//             return res.status(404).json({ message: "Comment not found" });
//         }
//         if (!comment.replies) {
//             comment.replies = [];
//         }
//         const reply = {
//             text: req.body.text,
//             repliedBy: req.user.id,
//         };

//         comment.replies.push(reply);
//         await tweet.save();

//         res.status(200).json(reply);


//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

router.post("/:tweetId/comments/:commentId", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId).populate("comments.replies", "fullname username image");
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        const comment = tweet.comments.find(c => c._id.toString() === req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        const reply = {
            text: req.body.text,
            repliedBy: req.user.id
        };
        comment.replies.push(reply);
        await tweet.save();
        res.status(200).json(reply);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Delete a comment on a tweet
router.delete("/:tweetId/comments/:commentId", verifyToken, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        const comment = tweet.comments.find(c => c._id == req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.commentedBy != req.user.id) {
            return res.status(401).json({ message: "You are not authorized to delete this comment" });
        }
        await tweet.updateOne({ $pull: { comments: { _id: req.params.commentId } } });
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
