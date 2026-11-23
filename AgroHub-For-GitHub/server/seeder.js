const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Machinery = require('./models/Machinery');
const Worker = require('./models/Worker');
const Expense = require('./models/Expense');
const Inventory = require('./models/Inventory');
const Income = require('./models/Income');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrohub';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    // Clear existing data cleanly
    console.log('Clearing existing records...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Machinery.deleteMany({});
    await Worker.deleteMany({});
    await Expense.deleteMany({});
    await Inventory.deleteMany({});
    await Income.deleteMany({});

    // 1. Seed Users
    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const farmerPassword = await bcrypt.hash('Farmer@123', salt);
    const buyerPassword = await bcrypt.hash('Buyer@123', salt);
    const adminPassword = await bcrypt.hash('Admin@123', salt);

    const farmer = await User.create({
      name: 'Ramesh Patel',
      email: 'farmer@agrohub.com',
      password: farmerPassword,
      role: 'farmer',
      phone: '+91 98765 12345',
      location: 'Gandhinagar, Gujarat',
    });

    const buyer = await User.create({
      name: 'Anita Sharma',
      email: 'buyer@agrohub.com',
      password: buyerPassword,
      role: 'buyer',
      phone: '+91 98765 54321',
      location: 'Ahmedabad, Gujarat',
    });

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@agrohub.com',
      password: adminPassword,
      role: 'admin',
      phone: '+91 98765 00000',
      location: 'Gandhinagar, Gujarat',
    });

    console.log('Demo users created.');

    // 2. Seed Crop Products
    console.log('Seeding products...');
    await Product.insertMany([
      {
        name: 'Chickpea (Kabuli Chana)',
        category: 'Grains',
        price: 2700,
        quantity: 70,
        unit: 'kg',
        description: 'Freshly harvested desi chickpeas available directly from farm.',
        location: 'Gandhinagar',
        imageUrl: '/uploads/image-1794662428822-912608963.webp',
        farmer: farmer._id,
      },
      {
        name: 'Groundnut (Organic Peanuts)',
        category: 'Grains',
        price: 100,
        quantity: 50,
        unit: 'kg',
        description: 'Sun-dried high oil content groundnuts grown in Saurashtra soil.',
        location: 'Gandhinagar',
        imageUrl: '/uploads/image-1794758952476-247067514.webp',
        farmer: farmer._id,
      },
      {
        name: 'Organic Basmati Rice',
        category: 'Grains',
        price: 95,
        quantity: 500,
        unit: 'kg',
        description: 'Aromatic traditional 1121 basmati paddy processed without chemicals.',
        location: 'Gandhinagar',
        imageUrl: '/uploads/image-1794747730622-466029850.jpg',
        farmer: farmer._id,
      },
      {
        name: 'Fresh Farm Tomatoes',
        category: 'Vegetables',
        price: 35,
        quantity: 300,
        unit: 'kg',
        description: 'Vine-ripened red firm hybrid tomatoes ideal for wholesale purchase.',
        location: 'Gandhinagar',
        imageUrl: '',
        farmer: farmer._id,
      },
    ]);

    // 3. Seed Machinery
    console.log('Seeding agricultural machinery...');
    await Machinery.insertMany([
      {
        name: 'Mahindra 575 DI Tractor (45 HP)',
        category: 'Tractor',
        description: 'Dual clutch, power steering, equipped for rotavator and trolley haulage.',
        rentalPricePerDay: 1200,
        location: 'Gandhinagar',
        owner: farmer._id,
        isAvailable: true,
        imageUrl: '/uploads/machinery/mahindra-tractor.jpg',
      },
      {
        name: 'John Deere Multi-Crop Combine Harvester',
        category: 'Harvester',
        description: 'Advanced straw management, minimal grain loss for paddy and wheat harvesting.',
        rentalPricePerDay: 2800,
        location: 'Gandhinagar',
        owner: farmer._id,
        isAvailable: true,
        imageUrl: '/uploads/machinery/combine-harvester.jpg',
      },
      {
        name: 'Shaktiman Rotary Tiller / Rotavator (7 Feet)',
        category: 'Tillage',
        description: 'Boron steel blades, high efficiency single-pass seedbed preparation.',
        rentalPricePerDay: 650,
        location: 'Gandhinagar',
        owner: farmer._id,
        isAvailable: true,
        imageUrl: '/uploads/machinery/rotary-tiller.jpg',
      },
      {
        name: 'John Deere Tractor 5310',
        category: 'Tractor',
        description: '55 HP heavy-duty tractor for commercial tillage and deep subsoiling.',
        rentalPricePerDay: 2500,
        location: 'Gandhinagar',
        owner: farmer._id,
        isAvailable: true,
        imageUrl: '/uploads/machinery/john-deere-tractor.jpg',
      },
      {
        name: 'Sonalika DI 745 III Tractor',
        category: 'Tractor',
        description: '50 HP fuel-efficient tractor suitable for all regional farming tasks.',
        rentalPricePerDay: 1700,
        location: 'Gandhinagar',
        owner: farmer._id,
        isAvailable: true,
        imageUrl: '/uploads/machinery/sonalika-tractor.jpg',
      },
    ]);

    // 4. Seed Agricultural Workers
    console.log('Seeding workers...');
    await Worker.insertMany([
      {
        name: 'Bhavesh Prajapati (Field Cultivation & Harvesting)',
        skills: ['Harvesting', 'Tractor Operation', 'Planting'],
        experienceYears: 6,
        dailyWage: 650,
        location: 'Gandhinagar',
        phone: '+91 98765 43210',
        owner: farmer._id,
        isAvailable: true,
      },
      {
        name: 'Hitesh Solanki (Agricultural Specialist)',
        skills: ['Harvesting', 'Tractor Operation', 'Irrigation'],
        experienceYears: 6,
        dailyWage: 650,
        location: 'Gandhinagar',
        phone: '+91 98765 43210',
        owner: farmer._id,
        isAvailable: true,
      },
      {
        name: 'Gandhinagar Sowing & Transplantation Crew (8 Members)',
        skills: ['Planting', 'Harvesting', 'Irrigation'],
        experienceYears: 6,
        dailyWage: 550,
        location: 'Gandhinagar',
        phone: '+91 98450 12345',
        owner: farmer._id,
        isAvailable: true,
      },
      {
        name: 'Pareshbhai Vaghela (Irrigation & Water Management)',
        skills: ['Irrigation', 'Pesticide Spraying'],
        experienceYears: 4,
        dailyWage: 500,
        location: 'Gandhinagar',
        phone: '+91 98251 23456',
        owner: farmer._id,
        isAvailable: true,
      },
      {
        name: 'Maheshbhai Chauhan (Organic Farming & Crop Pruning)',
        skills: ['Planting', 'Crop Bundling', 'Weeding'],
        experienceYears: 5,
        dailyWage: 600,
        location: 'Gandhinagar',
        phone: '+91 98250 12345',
        owner: farmer._id,
        isAvailable: true,
      },
    ]);

    // 5. Seed Farm Expenses
    console.log('Seeding expenses...');
    await Expense.insertMany([
      {
        title: 'Certified Organic Wheat Seeds',
        category: 'Seeds',
        amount: 4500,
        date: new Date(Date.now() - 15 * 86400000),
        description: 'Purchase of 3 quintals certified HD-3086 wheat seed.',
        owner: farmer._id,
      },
      {
        title: 'NPK Balanced Bio-Fertilizer',
        category: 'Fertilizers',
        amount: 3200,
        date: new Date(Date.now() - 10 * 86400000),
        description: '8 bags of organic fertilizer for basal dose application.',
        owner: farmer._id,
      },
      {
        title: 'Seasonal Sowing Labor Wages',
        category: 'Labour',
        amount: 6000,
        date: new Date(Date.now() - 5 * 86400000),
        description: 'Payment to sowing crew for 5 days transplantation.',
        owner: farmer._id,
      },
      {
        title: 'Drip Irrigation Tube Repair',
        category: 'Irrigation',
        amount: 1800,
        date: new Date(Date.now() - 2 * 86400000),
        description: 'Replaced main lateral sub-lines and inline filters.',
        owner: farmer._id,
      },
    ]);

    // 6. Seed Farm Inventory
    console.log('Seeding inventory...');
    await Inventory.insertMany([
      {
        name: 'Hybrid Wheat Seeds HD-3086',
        category: 'Seeds',
        quantity: 18,
        unit: 'bags',
        minStockLevel: 5,
        description: 'High-yield rust resistant wheat seeds.',
        owner: farmer._id,
      },
      {
        name: 'Organic Neem Oil Spray',
        category: 'Pesticides',
        quantity: 2,
        unit: 'litres',
        minStockLevel: 5,
        description: 'Natural pest deterrent for vegetable crops.',
        owner: farmer._id,
      },
      {
        name: 'Bio-Potash Fertilizer',
        category: 'Fertilizers',
        quantity: 12,
        unit: 'bags',
        minStockLevel: 4,
        description: 'Potassium nutrient for grain hardening.',
        owner: farmer._id,
      },
      {
        name: 'Micro-Sprinkler Nozzles',
        category: 'Equipment',
        quantity: 35,
        unit: 'pieces',
        minStockLevel: 10,
        description: 'Spare 360-degree spray nozzles for orchard lines.',
        owner: farmer._id,
      },
    ]);

    // 7. Seed Farm Income
    console.log('Seeding income records...');
    await Income.insertMany([
      {
        cropName: 'Organic Wheat',
        quantity: 45,
        unit: 'quintal',
        sellingPrice: 125000,
        buyerName: 'Gujarat Agro Trade Corp',
        date: new Date(Date.now() - 20 * 86400000),
        description: 'Grade-A wheat harvested and delivered directly.',
        owner: farmer._id,
      },
      {
        cropName: 'Fresh Tomatoes',
        quantity: 35,
        unit: 'quintal',
        sellingPrice: 52500,
        buyerName: 'APMC Wholesale Mandi Gandhinagar',
        date: new Date(Date.now() - 7 * 86400000),
        description: 'First batch of tomatoes sold at wholesale market rate.',
        owner: farmer._id,
      },
    ]);

    console.log('\n========================================');
    console.log('  AGROHUB DATABASE SEEDED SUCCESSFULLY! ');
    console.log('========================================');
    console.log('\nDemo Logins for Evaluation:');
    console.log('  Farmer: farmer@agrohub.com | Password: Farmer@123');
    console.log('  Buyer:  buyer@agrohub.com  | Password: Buyer@123');
    console.log('  Admin:  admin@agrohub.com  | Password: Admin@123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
