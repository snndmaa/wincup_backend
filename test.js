const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import cors
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  })
);
app.use(cors()); // Enable CORS

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL...');
});

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      (err, result) => {
        if (err) {
          console.error('Error registering user: ', err);
          res.status(500).send('Error registering user');
          return;
        }
        console.log('User registered successfully');
        res.status(200).send('User registered successfully');
      }
    );
  } catch (error) {
    console.error('Error registering user: ', error);
    res.status(500).send('Error registering user');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) {
        console.error('Error logging in: ', err);
        res.status(500).send('Error logging in');
        return;
      }

      if (results.length === 0) {
        res.status(401).send('Invalid username or password');
        return;
      }

      const user = results[0];

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).send('Invalid username or password');
        return;
      }

      // Generate JWT access token
      const accessToken = jwt.sign({ id: user.id }, 'access_secret', { expiresIn: '15m' });

      // Generate refresh token
      const refreshToken = jwt.sign({ id: user.id }, 'refresh_secret', { expiresIn: '7d' });

      // Set refresh token in cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Send access token in response
      res.status(200).json({ accessToken });
    }
  );
});

// Refresh Token Route
app.post('/refresh_token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send('Refresh token not found');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, 'refresh_secret');

    // Generate new access token
    const accessToken = jwt.sign({ id: decoded.id }, 'access_secret', { expiresIn: '15m' });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error refreshing token: ', error);
    res.status(401).send('Invalid refresh token');
  }
});

// Protected Route
app.get('/protected', (req, res) => {
  // Check if user is authenticated
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).send('Refresh token not found');
    return;
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, 'refresh_secret');

    // Send welcome message
    res.status(200).send('Welcome to the protected route');
  } catch (error) {
    console.error('Error decoding token: ', error);
    res.status(401).send('Unauthorized');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});