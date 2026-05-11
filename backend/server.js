const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 


const app = express();
const port = 3000;

const JWT_SECRET = "supersecretkey123"; 

// Middleware
app.use(express.json());

// --------------------
// IN-MEMORY DATABASE
// --------------------
let users = [];
let posts = [
    { id: 1, title: "First Post", author: "Amina" },
    { id: 2, title: "Second Post", author: "Diego" }
];

// --------------------
// TEST ROUTE
// --------------------
app.get("/", (req, res) => {
    res.send("API is running...");
});

// --------------------
// AUTH ROUTES
// --------------------

// REGISTER
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
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
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// --------------------
// POSTS (from your earlier code)
// --------------------
app.get("/api/posts", (req, res) => {

    
    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json(posts);
    
});

// --------------------
// START SERVER
// --------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

