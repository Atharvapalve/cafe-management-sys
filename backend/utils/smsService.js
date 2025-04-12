import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOrderStatusSMS = async (phoneNumber, status, orderId) => {
    try {
      const getMessageForStatus = (status) => {
        switch (status.toLowerCase()) {
          case "pending":
            return `✅ Order #${orderId.slice(-6)} received!\nWe're getting everything ready for you at Café Delight.`;
          case "preparing":
            return `👨‍🍳 Order #${orderId.slice(-6)} is being prepared!\nYour delicious items are on the way.`;
          case "ready":
            return `📦 Order #${orderId.slice(-6)} is READY!\nPlease pick it up from the counter at Café Delight.\nThank you for visiting Café Delight. Hope to see you again soon!`;
          case "cancelled":
            return `⚠️ Order #${orderId.slice(-6)} was cancelled.\nIf this was a mistake, feel free to reorder or contact us.`;
          default:
            return `📢 Order #${orderId.slice(-6)} status updated: ${status.toUpperCase()}`;
        }
      };
  
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const message = await client.messages.create({
        body: getMessageForStatus(status),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber,
      });
  
      console.log("✅ SMS sent:", message.sid);
      return true;
    } catch (err) {
      console.error("❌ Failed to send SMS:", err.message);
      return false;
    }
  };
  
