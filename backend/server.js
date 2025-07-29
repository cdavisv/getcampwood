// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
  credentials: true
}));
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'getcampwood.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table (optional - for tracking active sessions)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized');
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to compare passwords
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'GetCampWood API is running',
    timestamp: new Date().toISOString()
  });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
      }

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password and create user
      try {
        const hashedPassword = await hashPassword(password);
        
        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({
                success: false,
                message: 'Failed to create user account'
              });
            }

            const newUser = {
              id: this.lastID,
              name,
              email
            };

            const token = generateToken(newUser);

            res.status(201).json({
              success: true,
              message: 'User registered successfully',
              user: newUser,
              token
            });
          }
        );
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        res.status(500).json({
          success: false,
          message: 'Error processing password'
        });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      try {
        const isValidPassword = await comparePassword(password, user.password);
        
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Generate token
        const userForToken = {
          id: user.id,
          name: user.name,
          email: user.email
        };

        const token = generateToken(userForToken);

        res.json({
          success: true,
          message: 'Login successful',
          user: userForToken,
          token
        });

      } catch (compareError) {
        console.error('Password comparison error:', compareError);
        res.status(500).json({
          success: false,
          message: 'Error verifying password'
        });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  });
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Get current user data
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, currentUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
      }

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is already taken by another user
      db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], async (err, existingUser) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error occurred'
          });
        }

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email is already taken by another user'
          });
        }

        // Handle password change
        let finalPassword = currentUser.password;
        
        if (newPassword) {
          if (!currentPassword) {
            return res.status(400).json({
              success: false,
              message: 'Current password is required to change password'
            });
          }

          // Verify current password
          const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password);
          if (!isCurrentPasswordValid) {
            return res.status(401).json({
              success: false,
              message: 'Current password is incorrect'
            });
          }

          if (newPassword.length < 6) {
            return res.status(400).json({
              success: false,
              message: 'New password must be at least 6 characters long'
            });
          }

          // Hash new password
          finalPassword = await hashPassword(newPassword);
        }

        // Update user
        db.run(
          'UPDATE users SET name = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [name, email, finalPassword, userId],
          function(err) {
            if (err) {
              console.error('Error updating user:', err);
              return res.status(500).json({
                success: false,
                message: 'Failed to update profile'
              });
            }

            const updatedUser = {
              id: userId,
              name,
              email
            };

            res.json({
              success: true,
              message: 'Profile updated successfully',
              user: updatedUser
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user account
app.delete('/api/user/account', authenticateToken, (req, res) => {
  const userId = req.user.id;

  console.log(`Account deletion requested for user ID: ${userId}`);

  // First, delete any related sessions (if you're tracking them)
  db.run('DELETE FROM user_sessions WHERE user_id = ?', [userId], (err) => {
    if (err) {
      console.error('Error deleting user sessions:', err);
      // Continue anyway, this is not critical
    }

    // Delete the user account
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Error deleting user account:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete account'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'User account not found'
        });
      }

      console.log(`User account ${userId} successfully deleted`);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    });
  });
});

// Logout (optional - mainly for session cleanup)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // Since we're using JWT, logout is mainly handled client-side
  // But we can clean up any server-side sessions if needed
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`GetCampWood API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});