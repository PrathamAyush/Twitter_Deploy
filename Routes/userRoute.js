const { verifyToken } = require("../Middleware/authMiddleWare");
const bcrypt = require("bcryptjs");
const User = require("../Models/userModel");
const Tweet = require("../Models/tweetModel");

const router = require("express").Router();

// get All users
router.get("/", async (req, res) => {
    try {
        const user = await User.find().select('-password');

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a single user detail
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("following followers", "-password")
            .populate({
                path: "tweets",
                populate: {
                    path: "tweetedBy",
                    select: "username image",
                },
            })
            .select("-password")
            .exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Follow user (Tested)
router.put("/:id/follow", verifyToken, async (req, res) => {
    if (req.user.id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user.id);

            if (!user.followers.includes(req.user.id)) {
                await user.updateOne({ $push: { followers: req.user.id } });
                await currentUser.updateOne({ $push: { following: req.params.id } });

                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("you already follow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("you can't follow yourself");
    }
});

// Unfollow user (Tested)
router.put("/:id/unfollow", verifyToken, async (req, res) => {
    if (req.user.id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user.id);

            if (user.followers.includes(req.user.id)) {
                await user.updateOne({ $pull: { followers: req.user.id } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });

                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("you don't follow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("you can't unfollow yourself");
    }
});

// Edit user details (tested)
router.put("/:id/edit", verifyToken, async (req, res) => {
    const { password } = req.body;
    if (password) {
        const hashedpassword = await bcrypt.hash(password, 16);
        req.body.password = hashedpassword;
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get user tweets (Tested)
router.get("/:id/tweets", async (req, res) => {
    try {
        const tweets = await Tweet.find({ tweetedBy: req.params.id })
            .populate("tweetedBy", "fullname image")
            .sort("-createdAt");

        res.status(200).json(tweets);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Search User using Search Query

router.get("/search/:key", async (req, res) => {

    const searchQuery = req.params.key;
    let users;
    try {
        users = await User.find({

            "$or": [
                { fullname: { $regex: searchQuery, $options: "i" } },
                { username: { $regex: searchQuery, $options: "i" } },
            ],

        });
        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: "User Not Found" });
        }
    } catch (error) {
        res.status(400).json({ message: "Error occurred while searching users" });
    }
}
);

module.exports = router;