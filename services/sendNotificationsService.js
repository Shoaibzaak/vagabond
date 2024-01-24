// firebaseMessaging.js
const admin = require('firebase-admin');
// Initialize Firebase Admin SDK with your credentials
// const serviceAccount = require('./path/to/your/serviceAccountKey.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });


// Function to send a notification to an Android device using Firebase Messaging
const  sendNotification = async (deviceToken, title, body)=> {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: deviceToken,
  };

  try {
    // const response = await admin.messaging().send(message);
    // console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

module.exports = {
    sendNotification,
};
