const twilio = require("twilio");
const { validateTwilioPhone } = require("./validation");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const { COUNTRY_CODE } = require('../models/Constants')

/**
 * Send an SMS through Twilio
 * @param {string} destinationNumber 
 * @returns 
 */
async function sendTwilioMessage(destinationNumber, code) {
  if (!validateTwilioPhone(destinationNumber))
    throw new Error(`Teléfono en mal formato: debe ser +${COUNTRY_CODE}12345678`);

  const text = `LogiEvents: su palabra de confirmado es: ${code}`;

  const message = await client.messages.create({
    body: text,
    from: process.env.TWILIO_PHONE,
    to: destinationNumber,
  });

  return message.body;
}

module.exports = { sendTwilioMessage }