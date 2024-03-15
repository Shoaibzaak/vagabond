const encrypt = require("bcrypt");
// Function to generate a random password
const generateRandomPassword = (length) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
    // add the special character with every password
  let password = ""+"$";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Function to encrypt password
const encryptPassword = async (password) => {
  return new Promise((resolve, reject) => {
    encrypt.genSalt(10, (error, salt) => {
      if (error) return reject(error);
      encrypt.hash(password, salt, (error, hash) => {
        if (error) return reject(error);
        resolve(hash);
      });
    });
  });
};
module.exports = {
  generateRandomPassword: generateRandomPassword,
  encryptPassword: encryptPassword,
};
