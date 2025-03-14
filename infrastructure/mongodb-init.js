db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [{ role: 'root', db: 'admin' }]
});

db = db.getSiblingDB('aws_starter_db');
db.createCollection('messages');
