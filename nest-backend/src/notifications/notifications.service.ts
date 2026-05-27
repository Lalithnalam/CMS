import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // In a real scenario, you'd initialize Twilio here:
  // private twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  async sendWhatsAppMessage(toPhone: string, message: string) {
    this.logger.log(`[Mock WhatsApp] Sending to ${toPhone}: ${message}`);
    // Real implementation:
    // await this.twilioClient.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   body: message,
    //   to: `whatsapp:${toPhone}`
    // });
    return { success: true, message: 'Message sent successfully (mocked)' };
  }

  async notifyOrderConfirmed(customerPhone: string, orderId: string, amount: number) {
    const msg = `Your order ${orderId} for Rs.${amount} is confirmed and being processed.`;
    return this.sendWhatsAppMessage(customerPhone, msg);
  }

  async notifyOrderDispatched(customerPhone: string, vehicleNumber: string, challanUrl: string) {
    const msg = `Your order is on the way in vehicle ${vehicleNumber}. Track or view challan: ${challanUrl}`;
    return this.sendWhatsAppMessage(customerPhone, msg);
  }
}
