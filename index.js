const express = require("express");
const admin = require("firebase-admin");
const cron = require("node-cron");
const FormData = require("form-data");
const fcm = require("fcm-notification");
const serviceAccount = require("./tida_firebase_key.json");
const certpath = admin.credential.cert(serviceAccount);
const FCM = new fcm(certpath);
admin.initializeApp({
  credential: certpath,
});

const server = express();
const axios = require("axios");

server.post("/partner_notification", express.json(), async (req, res) => {
  const { userid } = req.body;
  try {
    const form = new FormData();
    form.append("userid", userid);
    const response = await axios.post(
      "https://tidasports.com/secure/api/notification/find_fcm_token",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );
    const fcmToken = response.data.fcm_token;
    const message = {
      to: fcmToken,
      notification: {
        title: "Payment Update",
        body: "You have recevied a payment from a Tida customer ",
      },
    };
    FCM.send(message, (err, response) => {
      if (err) {
        console.error("Error sending FCM notification:", err);
        res.status(500).json({ error: "Error sending FCM notification" });
      } else {
        console.log("FCM notification sent successfully:", response);
        res.status(200).json({ message: "FCM notification sent successfully" });
      }
    });
  } catch (error) {
    console.error("An error occurred while making the API request:", error);
    res
      .status(500)
      .json({ error: "An error occurred while making the API request" });
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const response = await axios.post(
      "https://tidasports.com/secure/api/notification/get_booking_details",
      {}
    );
    console.log("Response from API:", response.data);
    const bookingDetails = response.data.data;
    const currentTime = new Date();

    if (bookingDetails && Array.isArray(bookingDetails)) {
      for (const bookingData of bookingDetails) {
        const startTime = new Date(
          bookingData.date + " " + bookingData.slot_start_time
        );
        const timeDifference = (startTime - currentTime) / 60000;
        if (timeDifference === 5) {
          // If the booking time is exactly 5 minutes before the slot start time,
          // make the additional API request and send a notification
          const fcmResponse = await axios.post(
            "https://tidasports.com/secure/api/notification/find_fcm_token",
            { user_id: bookingData.user_id }
          );
          const fcmToken = fcmResponse.data.fcm_token;
          const message = {
            to: fcmToken,
            notification: {
              title: "Slot Booking Alert",
              body: "Your booking slot is going to start in 5min",
            },
          };
          FCM.send(message, (err, response) => {
            if (err) {
              console.error("Error sending FCM notification:", err);
              res.status(500).json({ error: "Error sending FCM notification" });
            } else {
              console.log("FCM notification sent successfully:", response);
              res
                .status(200)
                .json({ message: "FCM notification sent successfully" });
            }
          });
        }
      }
    }
  } catch (error) {
    console.error("An error occurred while making the API request:", error);
  }
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
