// Run from the backend folder:  node seedPayments.js
// Pehle seedInvoices.js chala hona zaroori hai.
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const Admin = require('./src/models/coreModels/Admin');
const Setting = require('./src/models/coreModels/Setting');
const Client = require('./src/models/appModels/Client');
const Invoice = require('./src/models/appModels/Invoice');
const Payment = require('./src/models/appModels/Payment');

const METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Online Transfer'];

async function run() {
  await mongoose.connect(process.env.DATABASE);

  const admin = await Admin.findOne({ removed: false });
  if (!admin) throw new Error('Admin nahi mila. Pehle `npm run setup` chalao.');

  // Sirf wo invoices jin par abhi tak koi payment nahi hui
  const invoices = await Invoice.find({ removed: false }).sort({ number: 1 });
  const candidates = invoices.filter(
    (inv) => (!inv.payment || inv.payment.length === 0) && (inv.credit || 0) === 0
  );

  if (candidates.length === 0) {
    throw new Error('Koi unpaid invoice nahi mila. Pehle seedInvoices.js chalao.');
  }

  const last = await Payment.findOne().sort({ number: -1 });
  let nextNumber = last ? last.number + 1 : 1;
  const startNumber = nextNumber;

  const now = new Date();
  let created = 0;
  let fullPaid = 0;
  let partial = 0;

  for (let i = 0; i < candidates.length; i++) {
    const inv = candidates[i];

    // Har 3 mein se: 1 fully paid, 1 partially paid, 1 unpaid chhor do
    const pattern = i % 3;
    if (pattern === 2) continue;

    const payable = inv.total - (inv.discount || 0);
    if (payable <= 0) continue;

    const amount = pattern === 0 ? payable : Math.round(payable * 0.5);
    if (amount <= 0) continue;

    let payDate = new Date(inv.date);
    payDate.setDate(payDate.getDate() + 2);
    if (payDate > now) payDate = now;

    const clientId = inv.client && inv.client._id ? inv.client._id : inv.client;

    const payment = await Payment.create({
      removed: false,
      createdBy: admin._id,
      number: nextNumber,
      client: clientId,
      invoice: inv._id,
      date: payDate,
      amount,
      currency: inv.currency,
      ref: 'TXN-' + String(nextNumber).padStart(5, '0'),
      description: 'Payment received via ' + METHODS[i % METHODS.length],
    });

    const paymentStatus = amount === payable ? 'paid' : 'partially';

    await Invoice.updateOne(
      { _id: inv._id },
      {
        $push: { payment: payment._id },
        $inc: { credit: amount },
        $set: { paymentStatus },
      }
    );

    nextNumber++;
    created++;
    if (paymentStatus === 'paid') fullPaid++;
    else partial++;
  }

  // App ka agla payment number sahi rahe
  try {
    await Setting.updateOne(
      { settingKey: 'last_payment_number' },
      { $set: { settingValue: nextNumber - 1 } }
    );
  } catch (e) {
    // zaroori nahi, ignore
  }

  console.log(
    'Done! ' + created + ' payments add ho gayi (number ' + startNumber + ' se ' + (nextNumber - 1) + ' tak).'
  );
  console.log('Fully paid invoices: ' + fullPaid + ', partially paid: ' + partial);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.log('Error:', err.message);
  process.exit(1);
});
