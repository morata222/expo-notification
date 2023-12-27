import { Expo } from "expo-server-sdk";
import cors from "cors";
import express, { json } from "express";
const app = express();
app.use(json());
const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

let expo = new Expo({
  accessToken: "RoS8GCvj9yOGMggqiUk22K1UwEGO5lHlk1LqVqc-",
});
let somePushTokens = ["ExponentPushToken[RdCl4BLYPj-2Y14vemRNZp]"];
// Create the messages that you want to send to clients
let messages = [];
for (let pushToken of somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
  messages.push({
    to: pushToken,
    sound: "default",
    body: "This is a test notification",
    data: { withSome: "data" },
  });
}

let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
const sendNotfication = async (params) => {
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }
};
app.post("/send-notifications", async (req, res) => {
  try {
    await sendNotfication();
    res
      .status(200)
      .json({ success: true, message: "Notifications sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
