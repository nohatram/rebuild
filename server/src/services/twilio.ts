import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;

export async function sendVerificationCode(phone: string): Promise<void> {
  await client.verify.v2.services(SERVICE_SID).verifications.create({
    to: phone,
    channel: 'sms',
  });
}

export async function checkVerificationCode(
  phone: string,
  code: string
): Promise<boolean> {
  const check = await client.verify.v2
    .services(SERVICE_SID)
    .verificationChecks.create({ to: phone, code });
  return check.status === 'approved';
}
