// Run from the backend folder:  node seedInvoices.js
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const Admin = require('./src/models/coreModels/Admin');
const Setting = require('./src/models/coreModels/Setting');
const Client = require('./src/models/appModels/Client');
const Invoice = require('./src/models/appModels/Invoice');

const PRODUCTS = [
  ['Website Design', 45000],
  ['Logo Design', 12000],
  ['Monthly Hosting', 3500],
  ['SEO Package', 25000],
  ['Mobile App Development', 120000],
  ['Office Supplies', 8000],
  ['Computer Repair', 4500],
  ['Printing Services', 6000],
  ['Consultation (per hour)', 5000],
  ['Software License', 30000],
  ['Delivery Charges', 1500],
  ['Maintenance Contract', 20000],
];

const STATUSES = ['draft', 'pending', 'sent', 'sent', 'sent'];

const pick = (arr, i) => arr[i % arr.length];

async function run() {
  await mongoose.connect(process.env.DATABASE);

  const admin = await Admin.findOne({ removed: false });
  if (!admin) throw new Error('Admin nahi mila. Pehle `npm run setup` chalao.');

  const clients = await Client.find({ removed: false }).limit(30);
  if (clients.length === 0) throw new Error('Koi client nahi mila. Pehle clients add karo.');

  const last = await Invoice.findOne().sort({ number: -1 });
  let nextNumber = last ? last.number + 1 : 1;
  const startNumber = nextNumber;

  const docs = [];
  for (let i = 0; i < 30; i++) {
    const client = clients[i % clients.length];

    const itemCount = (i % 3) + 1;
    const items = [];
    for (let k = 0; k < itemCount; k++) {
      const [itemName, price] = pick(PRODUCTS, i + k * 3);
      const quantity = ((i + k) % 4) + 1;
      items.push({
        itemName,
        description: itemName + ' for ' + client.name,
        quantity,
        price,
        total: price * quantity,
      });
    }

    const subTotal = items.reduce((sum, it) => sum + it.total, 0);

    const date = new Date();
    date.setDate(date.getDate() - (i * 3 + 2));
    const expiredDate = new Date(date);
    expiredDate.setDate(expiredDate.getDate() + 30);

    docs.push({
      removed: false,
      createdBy: admin._id,
      number: nextNumber++,
      year: date.getFullYear(),
      date,
      expiredDate,
      client: client._id,
      items,
      taxRate: 0,
      subTotal,
      taxTotal: 0,
      total: subTotal,
      currency: 'PKR',
      credit: 0,
      discount: 0,
      payment: [],
      paymentStatus: 'unpaid',
      isOverdue: expiredDate < new Date(),
      approved: true,
      notes: 'Thank you for your business.',
      status: pick(STATUSES, i),
    });
  }

  await Invoice.insertMany(docs);

  // App ka agla invoice number sahi rahe, is liye setting update karo
  try {
    await Setting.updateOne(
      { settingKey: 'last_invoice_number' },
      { $set: { settingValue: nextNumber - 1 } }
    );
  } catch (e) {
    // zaroori nahi, ignore
  }

  console.log('Done! ' + docs.length + ' invoices add ho gaye (number ' + startNumber + ' se ' + (nextNumber - 1) + ' tak).');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.log('Error:', err.message);
  process.exit(1);
});
