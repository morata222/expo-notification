import { Expo } from 'expo-server-sdk';
import cors from 'cors';
import express, { json } from 'express';

const app = express();
app.use(json());
const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

let expo = new Expo({
  accessToken: 'RoS8GCvj9yOGMggqiUk22K1UwEGO5lHlk1LqVqc-',
});

const sendNotification = async (pushTokens) => {
  let messages = [];
  
  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      body: 'This is a test notification',
      data: { withSome: 'data' },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
};

app.post('/send-notifications', async (req, res) => {
  try {
    const { pushTokens } = req.body;
    await sendNotification(pushTokens);
    res.status(200).json({ success: true, message: 'Notifications sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Hey, this is my API running 🥳');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
