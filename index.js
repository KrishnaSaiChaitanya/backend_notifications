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

// function getDifferenceInDays(date) {
//   console.log("hello", date);
//   const givenDate = new Date(date.toISOString().substring(0, 10));
//   const currentDate = new Date(new Date().toISOString().substring(0, 10));
//   const differenceInMs = currentDate - givenDate;
//   const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
//   return differenceInDays;
// }
function getDifferenceInDays(dateStr) {
  if (typeof dateStr !== "string") {
    throw new Error("Invalid date string");
  }
  const date = new Date(dateStr);
  if (isNaN(date)) {
    throw new Error("Invalid date");
  }
  const givenDate = new Date(date.toISOString().substring(0, 10));
  const currentDate = new Date(new Date().toISOString().substring(0, 10));
  const differenceInMs = currentDate - givenDate;
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  return differenceInDays;
}

const cronExpression = `* * * * *`;
cron.schedule(cronExpression, async () => {
  try {
    let currentHour = new Date().getHours();
    var res = await axios.get(`http://ehoa.app/api/get-reminders/5`);
    console.log(res.data);
    for (let i = res.data.length - 1; i >= 0; i--) {
      if (res.data[i].r_type === 1) {
        var number =
          (getDifferenceInDays(res.data[i].period_day) %
            res.data[i].period_length) +
          1;
        if (number < 1 || number > 3) {
          console.log("The number is not in the range 1 to 3.");
          res.data.splice(i, 1);
        }
      } else if (res.data[i].r_type === 2) {
        var number =
          (getDifferenceInDays(res.data[i].period_day) %
            res.data[i].period_length) +
          1;
        if (number < 4 || number > 6) {
          console.log("The number is not in the range 1 to 3.");
          res.data.splice(i, 1);
        }
      } else if (res.data[i].r_type === 3) {
        var number =
          (getDifferenceInDays(res.data[i].period_day) %
            res.data[i].period_length) +
          1;
        if (number < 7 || number > 12) {
          console.log("The number is not in the range 1 to 3.");
          res.data.splice(i, 1);
        }
      } else if (res.data[i].r_type === 4) {
        var number =
          (getDifferenceInDays(res.data[i].period_day) %
            res.data[i].period_length) +
          1;
        if (number < 13 || number > 17) {
          console.log("The number is not in the range 13 to 17.");
          res.data.splice(i, 1);
        }
      } else if (res.data[i].r_type === 5) {
        var number =
          (getDifferenceInDays(res.data[i].period_day) %
            res.data[i].period_length) +
          1;
        if (number < 17 || number > 23) {
          console.log("The number is not in the range 1 to 3.");
          res.data.splice(i, 1);
        }
      } else if (res.data[i].r_type === 6) {
        var number =
          (getDifferenceInDays(res.data[i].period_day) %
            res.data[i].period_length) +
          1;
        if (number < 24 || number > 35) {
          console.log("The number is not in the range 24 to 35.");
          res.data.splice(i, 1);
        }
        // } else {
        //   var number =
        //     (getDifferenceInDays(res.data[i].period_day) % res[i].period_length) + 1;
        //   if (number < 1 || number > 3) {
        //     console.log("The number is not in the range 1 to 3.");
        //     res.splice(i, 1);
        //   }
      }
    }
    res.data.forEach((user) => {
      let body = "";
      if (user.r_type == 0) {
        body = "Custom Message";
      } else if (user.r_type == 1) {
        body = "1";
      } else if (user.r_type == 2) {
        body = "2";
      } else if (user.r_type == 3) {
        body = "3";
      } else if (user.r_type == 4) {
        body = "4";
      } else {
        body = "i don't have any content yet";
      }
      let message = {
        notification: {
          title: "You have notification from ehoa",
          body: body,
        },
        token:
          "dMguij_EQFq-gnxMGwiMqy:APA91bEQIUWAQlDFwSnLcpfHmkGbjSQPgSXKu32PUdJcQj-Ju8UprQ97nAG096DaKmAxYsRRl7PBSrKriLelsc2c8fAk7iPUWjzPZg6qpXlYCNx2Qkbh6QOLJ-nNAcqm0i-bwZ-VvADR",
      };
      console.log("message is :- ", message);
      try {
        FCM.send(message, function (err, resp) {
          if (err) {
            console.log(err);
          } else {
            console.log("Notificat");
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
    // console.log("hello i working yahooooo.....");
  } catch (error) {
    console.error("Error retrieving data from API:", error);
  }
});
// }

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
