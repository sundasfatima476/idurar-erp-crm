// Run from the backend folder:  node seedTaxesAndModes.js
// Default Taxes aur Payment Modes add karta hai (jo pehle se hain unhein dobara nahi banata).
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const Taxes = require('./src/models/appModels/Taxes');
const PaymentMode = require('./src/models/appModels/PaymentMode');

const TAXES = [
  { taxName: 'Tax 0%', taxValue: 0, isDefault: true },
  { taxName: 'GST 5%', taxValue: 5 },
  { taxName: 'GST 10%', taxValue: 10 },
  { taxName: 'GST 17%', taxValue: 17 },
  { taxName: 'Withholding Tax 4.5%', taxValue: 4.5 },
];

const MODES = [
  { name: 'Cash', description: 'Cash payment', isDefault: true },
  { name: 'Bank Transfer', description: 'Bank wire transfer / IBFT' },
  { name: 'Cheque', description: 'Payment by cheque' },
  { name: 'JazzCash', description: 'JazzCash mobile wallet' },
  { name: 'Easypaisa', description: 'Easypaisa mobile wallet' },
  { name: 'Credit / Debit Card', description: 'Card payment' },
];

async function run() {
  await mongoose.connect(process.env.DATABASE);

  let taxAdded = 0;
  const hasDefaultTax = (await Taxes.countDocuments({ removed: false, isDefault: true })) > 0;
  for (const t of TAXES) {
    const exists = await Taxes.findOne({ taxName: t.taxName, removed: false });
    if (exists) continue;
    await Taxes.create({ ...t, isDefault: hasDefaultTax ? false : !!t.isDefault });
    taxAdded++;
  }

  let modeAdded = 0;
  const hasDefaultMode = (await PaymentMode.countDocuments({ removed: false, isDefault: true })) > 0;
  for (const m of MODES) {
    const exists = await PaymentMode.findOne({ name: m.name, removed: false });
    if (exists) continue;
    await PaymentMode.create({ ...m, isDefault: hasDefaultMode ? false : !!m.isDefault });
    modeAdded++;
  }

  console.log('Done! ' + taxAdded + ' taxes aur ' + modeAdded + ' payment modes add ho gaye.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.log('Error:', err.message);
  process.exit(1);
});
