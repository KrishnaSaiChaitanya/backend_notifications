const express = require("express");
const admin = require("firebase-admin");
const cron = require("node-cron");
var fcm = require("fcm-notification");
var serviceAccount = require("./ehoa_firebase_key.json");
var certpath = admin.credential.cert(serviceAccount);
var FCM = new fcm(certpath);
admin.initializeApp({
  credential: certpath,
});

const server = express();
const axios = require("axios");

// for (let hour = 1; hour <= 24; hour++) {
const cronExpression = `* * * * *`;
cron.schedule(cronExpression, async () => {
  try {
    let currentHour = new Date().getHours();
    var res = await axios.get(`http://ehoa.app/api/get-reminders/0/2`);
    console.log(res.data);
    res.data.reminders.forEach((user) => {
      let body = "";
      if (user.r_id == 0) {
        body = "Custom Message";
      }
      if (user.r_id == 1) {
        body = "1";
      } else if (user.r_id == 2) {
        body = "2";
      } else if (user.r_id == 3) {
        body = "3";
      } else if (user.r_id == 4) {
        body = "4";
      }
      let message = {
        notification: {
          title: "You have notification from ehoa",
          body: body,
        },
        token:
          "dMguij_EQFq-gnxMGwiMqy:APA91bEQIUWAQlDFwSnLcpfHmkGbjSQPgSXKu32PUdJcQj-Ju8UprQ97nAG096DaKmAxYsRRl7PBSrKriLelsc2c8fAk7iPUWjzPZg6qpXlYCNx2Qkbh6QOLJ-nNAcqm0i-bwZ-VvADR",
      };
      FCM.send(message, function (err, resp) {
        if (err) {
          console.log(err);
        } else {
          console.log("NOtficat");
        }
      });
    });
    console.log("hello i working yahooooo.....");
  } catch (error) {
    console.error("Error retrieving data from API:", error);
  }
});
// }

// -----> testing

// for (let minute = 0; minute < 60; minute++) {
//   const cronExpression = `${minute} * * * *`;

//   cron.schedule(cronExpression, () => {
//     const currentTime = new Date();
//     console.log(`Current time: ${currentTime}`);
//   });
// }

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
