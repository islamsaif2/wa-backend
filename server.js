import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/send', async (req, res) => {
  try {
    const { recipientPhone, messageText } = req.body || {};

    if (!recipientPhone || !messageText) {
      return res.status(400).json({
        success: false,
        message: 'recipientPhone and messageText are required',
      });
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      return res.status(500).json({
        success: false,
        message: 'Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment variables',
      });
    }

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: messageText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.json({
      success: true,
      data: response.data,
      message: 'Message sent successfully',
    });
  } catch (error) {
    const errorMessage =
      error?.response?.data?.error?.message || error.message || 'Unknown error';

    return res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp backend running on http://localhost:${PORT}`);
});
