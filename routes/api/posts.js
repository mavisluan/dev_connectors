/* eslint-disable no-console */
const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const { Post } = require('../../models/Post');
const { User } = require('../../models/User');

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is require')
                .not()
                .isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            const post = await newPost.save();

            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route Get api/posts/:postId
// @desc Get a post by postId
// @access Private
router.get('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        return res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route DELETE api/posts/:postId
// @desc Delete a post by postId
// @access Private
router.delete('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check if the user is the creator of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        res.json({ msg: 'Post deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/posts/like/:postId
// @desc     Like a post
// @access   Private
router.put('/like/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        // check if the post has been liked by the user
        if (post.likes.find(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
router.put('/unlike/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        // check if the user liked the post
        const findUser = post.likes.find(like => like.user.toString() === req.user.id);

        if (!findUser) {
            return res.status(400).json('You did not like the post');
        }

        // remove the user.id from post.likes list
        const filteredLikes = post.likes.filter(like => like.user.toString() !== req.user.id);
        post.likes = filteredLikes;

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/posts/comments/:id
// @desc     Comment on a post
// @access   Private
router.post(
    '/comments/:postId',
    [
        auth,
        [
            check('text', 'Text is required')
                .not()
                .isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // get user instance to access user avatar
            const user = await User.findById(req.user.id).select('-password');
            console.log('user', user);

            const post = await Post.findById(req.params.postId);
            // const { text, name } = req.body;
            const { text } = req.body;
            console.log('requesttext', text);
            const comment = {
                user: req.user.id,
                avatar: user.avatar,
                text,
                name: user.name,
            };

            post.comments.unshift(comment);

            await post.save();

            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    DELETE api/posts/:postId/comments/:commentId
// @desc     Delete comment
// @access   Private
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
    const { postId, commentId } = req.params;
    try {
        const post = await Post.findById(postId);
        // check if the comment exist in post.comments
        const findComment = post.comments.find(comment => comment.id.toString() === commentId);

        if (!findComment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }
        // check if the user is the comment's creator
        if (req.user.id !== findComment.user.toString()) {
            return res.status(400).json({ msg: 'User not authorized' });
        }

        // Remove the comment from post.comments
        const filteredComments = post.comments.filter(comment => comment.id.toString() !== commentId);

        post.comments = filteredComments;

        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
