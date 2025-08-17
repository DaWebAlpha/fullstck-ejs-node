import { ensureUser, ensureAdmin } from '../middleware/auth.js';
import { autoCatchFn } from '../lib/autoCatchFn.js';
import validator from 'validator';
import { User } from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { blackListToken } from '../utils/blackListToken.js';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const adminPassword = process.env.ADMIN_PASSWORD;
const isProduction = process.env.NODE_ENV === 'production';



/**
 * Renders the registration page.
 * 
 * Uses autoCatchFn to handle any asynchronous errors automatically.
 * Passes `error: null` to the view initially since no error has occurred yet.
 */
export const showRegister = autoCatchFn(async (req, res) => {
    return res.render('register', { error: null });
});




/**
 * Handles user registration:
 * - Validates required fields (username, email, password)
 * - Creates a new user in the database
 * - Redirects to login page on success
 * - Returns appropriate error messages for validation or duplicate email
 */
export const register = autoCatchFn(async (req, res) => {
    const { username, email, password } = req.body || {}

    if (!username || !email || !password) {
        return res.status(400).render('register', {
            error: "None of the fields should be empty"
        })
    }

     // ✅ Strong password validation using validator.js
    const isStrong = validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    });

    if (!isStrong) {
        return res.status(400).render("register", {
            error:
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
        });
    }

    try {
        await User.create({
            username,
            email,
            password,
        })

        res.redirect('/login');
    } catch (err) {
        let errorMessage = "Something went wrong";

        if (err.name === 'ValidationError') {
            errorMessage = Object.values(err.errors).map(e => e.message).join(', ')
        } else if (err.code === 11000) {
            errorMessage = "Email already exists";
        }
        res.status(400).render('register', { error: errorMessage })
    }
})




/**
 * Renders the login page.
 *
 * Uses autoCatchFn to handle asynchronous errors automatically.
 * Initially passes `error: null` since no login error has occurred yet.
 */
export const showLogin = autoCatchFn((req, res) => {
    res.render('login', { error: null });
});

/**
 * Handles user login.
 * 
 * Steps:
 * 1. Extracts username and password from request body.
 * 2. Validates that both fields are provided.
 * 3. Checks if the login is for admin and verifies admin password.
 *    - If admin, signs a JWT, sets it in a secure cookie, and redirects to admin dashboard.
 * 4. For normal users, converts username to lowercase and finds user in database.
 * 5. Validates user existence and compares provided password with hashed password.
 * 6. Signs a JWT token for authenticated users and sets it in a secure cookie.
 * 7. Redirects authenticated users to their dashboard.
 * 8. Handles invalid credentials with appropriate error messages rendered on login page.
 */
export const login = autoCatchFn(async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).render('login', { error: "None of the fields should be empty" });
    }

    // Admin check
    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
        return res.redirect('/admin/home');
    }

    // Normal user login
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
        return res.status(401).render('login', { error: "User cannot be found" });
    }

    // Compare password using mongoose-bcrypt
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
        return res.status(401).render('login', { error: "Invalid password" });
    }

    const token = jwt.sign({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: 'user',
    }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    return res.redirect('/dashboard');
});




/**
 * Logout Controller
 *
 * - Retrieves JWT token from cookies
 * - Adds token to blacklist to prevent reuse
 * - Clears cookie from client
 * - Redirects user back to login page
 */
export const logout = autoCatchFn((req, res) => {
    const token = req.cookies?.token;

    if (token) {
        blackListToken(token); // prevent further use of this token
    }

    res.clearCookie('token'); // remove token cookie from client
    return res.redirect('/login');
});
