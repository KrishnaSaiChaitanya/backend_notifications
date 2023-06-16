const express = require("express");
const admin = require("firebase-admin");
const cron = require("node-cron");

const serviceAccount = require("./ehoa_firebase_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const server = express();
const axios = require("axios");

// for (let hour = 1; hour <= 24; hour++) {
const cronExpression = `0 * * * *`;
cron.schedule(cronExpression, async () => {
  try {
    const currentHour = new Date().getHours();
    for (let i = 1; i <= 4; i++) {
      const response = await axios.get(
        `http://ehoa.app/api/get-reminders/${i}/${currentHour}`
      );
      console.log(response);
      response.forEach((user) => {
        const body = "";
        if (user.r_id == 1) {
          body = "1";
        } else if (user.r_id == 2) {
          body = "2";
        } else if (user.r_id == 3) {
          body = "3";
        } else if (user.r_id == 4) {
          body = "4";
        }
        const message = {
          token: user.fcm_token,
          notification: {
            title: "Your Reminder from ehoa",
            body: body,
          },
        };
        admin
          .messaging()
          .send(message)
          .then((response) => {
            console.log("Notification sent successfully:", response);
          })
          .catch((error) => {
            console.log("Error sending notification:", error);
          });
      });
    }
    console.log("hello i working yahooooo.....");
  } catch (error) {
    console.error("Error retrieving data from API:", error);
  }
});
// }

// -----> testing

for (let minute = 0; minute < 60; minute++) {
  const cronExpression = `${minute} * * * *`;

  cron.schedule(cronExpression, () => {
    const currentTime = new Date();
    console.log(`Current time: ${currentTime}`);
  });
}

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
