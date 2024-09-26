const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            firstName,
            lastName,
            email,
            password,
        });

        const activationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Activation Link',
            html: `<h2>Please click on the given link to activate your account</h2>
                   <p>${process.env.CLIENT_URL}/activate/${activationToken}</p>`,
        };

        await transporter.sendMail(mailOptions);

        await user.save();
        res.status(201).json({ message: 'Registration successful. Check your email for activation link.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.activateAccount = async (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({ message: 'Incorrect or Expired link.' });
            }

            const { email } = decodedToken;
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User with this email does not exist.' });
            }

            user.isActive = true;
            await user.save();

            res.status(200).json({ message: 'Account activated successfully!' });
        });
    } else {
        return res.status(400).json({ message: 'Something went wrong!' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !user.isActive) {
            return res.status(400).json({ message: 'Invalid credentials or account not activated' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist.' });
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Link',
            html: `<h2>Please click on the given link to reset your password</h2>
                   <p>${process.env.CLIENT_URL}/reset-password/${resetToken}</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({ message: 'Incorrect or expired link.' });
            }

            const { email } = decodedToken;
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'User with this email does not exist.' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            res.status(200).json({ message: 'Password reset successfully!' });
        });
    } else {
        return res.status(400).json({ message: 'Something went wrong!' });
    }
};