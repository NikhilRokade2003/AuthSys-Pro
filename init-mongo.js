// MongoDB initialization script for Docker
db = db.getSiblingDB('hackerauth');

// Create admin user
db.createUser({
  user: 'hackerauth_admin',
  pwd: 'hackerauth_password',
  roles: [
    { role: 'readWrite', db: 'hackerauth' },
    { role: 'dbAdmin', db: 'hackerauth' }
  ]
});

// Create collections with indexes
db.createCollection('users');

// Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 });
db.users.createIndex({ "oauth.google.id": 1 });
db.users.createIndex({ "oauth.facebook.id": 1 });
db.users.createIndex({ "emailVerificationToken": 1 });
db.users.createIndex({ "passwordResetToken": 1 });
db.users.createIndex({ "otp.expires": 1 }, { expireAfterSeconds: 0 });
db.users.createIndex({ "isActive": 1, "isBlocked": 1 });
db.users.createIndex({ "createdAt": -1 });

// Insert demo user (optional)
db.users.insertOne({
  name: "Demo Hacker",
  email: "demo@hackerauth.com",
  password: "$2b$12$LQv3c1yqBWVHxkd0cKVnDe/K9gqHm0Qi5D6KpJ8mJ8eH4f1FjO2K2", // Demo123!
  isEmailVerified: true,
  isActive: true,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date()
});

print('HackerAuth database initialized successfully!');