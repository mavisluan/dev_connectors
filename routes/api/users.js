/* eslint-disable no-console */
const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// import the model
const { User } = require('../../models/User');

// @route POST api/users
// @desc Register user
// @access public
router.post(
    '/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        // if the request body is invalid (missing some props or not not meet requirements in check func)
        if (!errors.isEmpty()) {
            console.log('errors', errors.array());

            return res.status(400).json({ errors: errors.array() });
        }

        // if the request body is valid, check if the email is unique
        const { name, email, password } = req.body;
        try {
            // Email must be unique --> check if the user exists
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({
                    errors: [{ msg: 'User already exists' }],
                });
            }

            // if user doesn't exist, get gravatar, create and save the user
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm',
            });

            user = new User({
                name,
                email,
                avatar,
                password,
            });

            // Ecrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

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
