import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

// Validate Twilio credentials
const validateTwilioCredentials = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    console.error("❌ Missing Twilio credentials in environment variables");
    return false;
  }

  if (!accountSid.startsWith('AC')) {
    console.error("❌ Invalid Twilio Account SID format");
    return false;
  }

  return true;
};

// Initialize Twilio client only if credentials are valid
let client;
if (validateTwilioCredentials()) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.error("❌ Twilio client not initialized due to invalid credentials");
}

export const sendOrderStatusSMS = async (phoneNumber, status, orderId) => {
    try {
      if (!client) {
        throw new Error("Twilio client not initialized. Check your credentials.");
      }

      // Validate inputs
      if (!phoneNumber) {
        console.error("❌ No phone number provided");
        return false;
      }

      if (!status) {
        console.error("❌ No status provided");
        return false;
      }

      // Log Twilio configuration (without exposing sensitive data)
      console.log("🔧 Twilio Configuration Check:", {
        hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
      });

      const getMessageForStatus = (status) => {
        switch (status.toLowerCase()) {
          case "pending":
            return `✅ Order #${String(orderId).slice(-6)} received!\nWe're getting everything ready for you at Café Delight.`;
          case "preparing":
            return `👨‍🍳 Order #${String(orderId).slice(-6)} is being prepared!\nYour delicious items are on the way.`;
          case "ready":
            return `📦 Order #${String(orderId).slice(-6)} is READY!\nPlease pick it up from the counter at Café Delight.\nThank you for visiting Café Delight. Hope to see you again soon!`;
          case "cancelled":
            return `⚠️ Order #${String(orderId).slice(-6)} was cancelled.\nIf this was a mistake, feel free to reorder or contact us.`;
          default:
            return `📢 Order #${String(orderId).slice(-6)} status updated: ${status.toUpperCase()}`;
        }
      };
  
      // Format phone number
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      console.log("📱 Attempting to send SMS to:", formattedNumber);

      const message = await client.messages.create({
        body: getMessageForStatus(status),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber,
      });
  
      console.log("✅ SMS sent successfully:", message.sid);
      return true;
    } catch (err) {
      console.error("❌ SMS Error Details:", {
        error: err.message,
        code: err.code,
        moreInfo: err.moreInfo,
        phoneNumber,
        status,
        orderId
      });

      // Specific error handling
      if (err.code === 20003) {
        console.error("❌ Twilio Authentication Error. Please check your credentials.");
        console.error("   Make sure your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct.");
        console.error("   You can find these in your Twilio Console: https://www.twilio.com/console");
      }
      
      return false;
    }
};
  
