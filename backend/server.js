const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

// SECRET KEY
const JWT_SECRET = "supersecretkey123";

// MIDDLEWARE
app.use(express.json());

// --------------------
// IN-MEMORY DATABASE
// --------------------
let users = [];

let posts = [
    {
        id: 1,
        title: "First Post",
        author: "Amina"
    },
    {
        id: 2,
        title: "Second Post",
        author: "Diego"
    }
];

// --------------------
// HOME ROUTE
// --------------------
app.get("/", (req, res) => {
    res.send("API is running...");
});

// --------------------
// REGISTER ROUTE
// --------------------
app.post("/api/auth/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // validation
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // check existing user
        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword
        };

        // save user
        users.push(newUser);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});

// --------------------
// LOGIN ROUTE
// --------------------
app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // find user
        const user = users.find(
            user => user.email === email
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // CREATE TOKEN
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});

// --------------------
// AUTH MIDDLEWARE
// --------------------
function authMiddleware(req, res, next) {

    // get authorization header
    const authHeader = req.headers.authorization;

    // check if token exists
    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    // extract token
    const token = authHeader.split(" ")[1];

    try {

        // verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // store user data
        req.user = decoded;

        // continue
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }

}

// --------------------
// PROTECTED POSTS ROUTE
// --------------------
app.get("/api/posts", authMiddleware, (req, res) => {

    res.json({
        message: "Protected route accessed",
        loggedInUser: req.user,
        posts
    });

});

// --------------------
// SERVER START
// --------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
