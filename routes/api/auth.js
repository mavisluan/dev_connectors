/* eslint-disable no-console */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const router = express.Router();
// use the middleware in the auth route
const auth = require('../../middleware/auth');
const { User } = require('../../models/User');

// @route GET api/auth
// @desc Test route
// @access public
// pass middleware auth as the second param in the request
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post(
    '/',
    [check('email', 'Please include a valid email').isEmail(), check('password', 'Password is required').exists()],
    async (req, res) => {
        const errors = validationResult(req);
        // if the request body is invalid (missing some props or not not meet requirements in check func)
        if (!errors.isEmpty()) {
            console.log('errors', errors.array());

            return res.status(400).json({ errors: errors.array() });
        }

        // if the request body is valid, check if the use exists
        const { email, password } = req.body;
        try {
            // Check if the user exists
            const user = await User.findOne({ email });
            // If user doens't exists, send error messages
            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid credentials' }],
                });
            }
            // match the user's email and password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid credentials' }],
                });
            }
            // return a jswtoken for the frontend when a user registers
            // let the user logged in right away
            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
);
module.exports = router;
