const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const users = []; 

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password dengan saltRounds = 10
        users.push({ username, password: hashedPassword });
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(500).send('Error hashing password');
    }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find((u) => u.username === username);
        if (!user) return res.status(404).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.status(200).send('Login successful!');
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        res.status(500).send('Error verifying password');
    }
});

app.get('/users', (req, res) => {
  res.status(200).json(users);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
