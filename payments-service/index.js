// payments-service/index.js
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== eSewa Payment ===================== */
// .env:
// ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
// ESEWA_PRODUCT_CODE=EPAYTEST
// ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q(
// ESEWA_SUCCESS_URL=http://localhost:3000/payment-success
// ESEWA_FAILURE_URL=http://localhost:3000/payment-failed

const ESEWA_FORM_URL = process.env.ESEWA_FORM_URL;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_SUCCESS_URL =
  process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/payment-success';
const ESEWA_FAILURE_URL =
  process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/payment-failed';

console.log('ESEWA_FORM_URL =', ESEWA_FORM_URL);
console.log('ESEWA_PRODUCT_CODE =', ESEWA_PRODUCT_CODE);
console.log('ESEWA_SECRET_KEY length =', ESEWA_SECRET_KEY?.length);

/**
 * total_amount,transaction_uuid,product_code
 */
function generateEsewaSignature(totalAmountStr, transactionUuid) {
  const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
}

app.post('/payments/esewa/init', (req, res) => {
  const { bookingId, amount } = req.body;
  console.log("Received eSewa init request body:", req.body);

  if (!bookingId || !amount) {
    return res.status(400).json({ message: 'bookingId and amount required' });
  }

  const amountNum = Math.round(Number(amount));
  const taxAmount = 0;
  const serviceCharge = 0;
  const deliveryCharge = 0;
  const totalAmountNum = amountNum + taxAmount + serviceCharge + deliveryCharge;

  const amountStr = amountNum.toString();
  const totalAmountStr = totalAmountNum.toString();

  const transactionUuid = `BK-${bookingId}`.replace(/[^a-zA-Z0-9-]/g, '');
  const signature = generateEsewaSignature(totalAmountStr, transactionUuid);

  const payload = {
    amount: amountStr,
    tax_amount: taxAmount.toString(),
    product_service_charge: serviceCharge.toString(),
    product_delivery_charge: deliveryCharge.toString(),
    product_code: ESEWA_PRODUCT_CODE,
    total_amount: totalAmountStr,
    transaction_uuid: transactionUuid,
    success_url: `${ESEWA_SUCCESS_URL}?bookingId=${bookingId}`,
    failure_url: `${ESEWA_FAILURE_URL}?bookingId=${bookingId}`,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature,
  };

  console.log('--- eSewa debug ---');
  console.log('amount           =', payload.amount);
  console.log('total_amount     =', payload.total_amount);
  console.log('transaction_uuid =', payload.transaction_uuid);
  console.log('product_code     =', payload.product_code);
  console.log('success_url      =', payload.success_url);
  console.log('failure_url      =', payload.failure_url);
  console.log('signature        =', payload.signature);
  console.log('-------------------');

  res.json({ esewa: payload, formUrl: ESEWA_FORM_URL });
});

/* ===================== Khalti Payment ===================== */
// .env:
// KHALTI_BASE_URL=https://test-pay.khalti.com/api/v2
// KHALTI_SECRET_KEY=your_secret_key
// KHALTI_RETURN_URL=http://localhost:3000/payment-success
// KHALTI_WEBSITE_URL=http://localhost:3000

const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_RETURN_URL =
  process.env.KHALTI_RETURN_URL || 'http://localhost:3000/payment-success';
const KHALTI_WEBSITE_URL =
  process.env.KHALTI_WEBSITE_URL || 'http://localhost:3000';

app.post('/payments/khalti/init', async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return res
        .status(400)
        .json({ message: 'bookingId and amount required' });
    }

    const amountNum = Math.round(Number(amount));
    const amountInPaisa = amountNum * 100; // Rs → paisa

    const payload = {
      // IMPORTANT: add bookingId in return_url
      return_url: `${KHALTI_RETURN_URL}?bookingId=${bookingId}`,
      website_url: KHALTI_WEBSITE_URL,
      amount: amountInPaisa,
      purchase_order_id: `BK-${bookingId}`,
      purchase_order_name: 'EV Charge Booking',
      customer_info: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9800000001',
      },
    };

    const resp = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Khalti init error:', data);
      return res
        .status(500)
        .json({ message: 'Failed to initiate Khalti payment', data });
    }

    // data.payment_url and data.pidx
    return res.json({
      paymentUrl: data.payment_url,
      pidx: data.pidx,
    });
  } catch (e) {
    console.error('Khalti init exception', e);
    return res
      .status(500)
      .json({ message: 'Khalti init error' });
  }
});

/* ===================== Server ===================== */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Payments service listening on port ${PORT}`);
});
