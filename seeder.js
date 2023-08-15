const mongoose = require('mongoose');
const Student = require('./models/userSchema'); // Adjust the path to your Student model
const bcrypt = require('bcrypt');

const adminData = {
  username: 'admin',
  password: 'adminpassword', // Change this to a secure password
  isAdmin: true,
};

// Connect to the MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/counselling', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');

  // Check if an admin user already exists
  const existingAdmin = await Student.findOne({ isAdmin: true });

  if (existingAdmin) {
    console.log('Admin user already exists');
    mongoose.connection.close();
    return;
  }

  // Hash the admin's password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

  // Create the admin user
  const adminUser = new Student({
    username: adminData.username,
    password: hashedPassword,
    isAdmin: true,
  });

  // Save the admin user to the database
  await adminUser.save();

  console.log('Admin user created successfully');
  mongoose.connection.close();
})
.catch(error => {
  console.error('Error:', error);
});
