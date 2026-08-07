const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('./config/aws');
const config = require('./config/config');

const PRODUCTS = [
  { 
    id: '3bb89cc7-fe95-453c-a64f-2c43b23ec124', 
    name: "Aviator Sunglasses", 
    price: 50.00, 
    rating: 4.5, 
    reviews: 12, 
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80", 
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80"
    ],
    category: "Accessories",
    description: "Classic aviator sunglasses featuring polarized lenses and a lightweight metal frame for all-day comfort.",
    specs: [
      { label: 'Frame Material', value: 'Stainless Steel' },
      { label: 'Lens', value: 'Polarized UV400' },
      { label: 'Weight', value: '25g' }
    ]
  },
  { 
    id: '93e208d3-466b-4560-8634-1143c2e28b9c', 
    name: "Silk Scarf", 
    price: 30.00, 
    rating: 4.8, 
    reviews: 24, 
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80", 
    images: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80"
    ],
    category: "Fashion",
    description: "Luxurious 100% pure silk scarf with hand-rolled edges. Perfect for adding a touch of elegance to any outfit.",
    specs: [
      { label: 'Material', value: '100% Mulberry Silk' },
      { label: 'Dimensions', value: '90x90 cm' },
      { label: 'Care', value: 'Dry Clean Only' }
    ]
  },
  { 
    id: 'b57f72b3-38fa-4319-b186-1aee897e0f6e', 
    name: "Classic Baseball Cap", 
    price: 20.00, 
    rating: 4.2, 
    reviews: 56, 
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80", 
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80"
    ],
    category: "Accessories",
    description: "Everyday classic baseball cap made from breathable cotton twill with an adjustable strap.",
    specs: [
      { label: 'Material', value: '100% Cotton' },
      { label: 'Size', value: 'Adjustable' }
    ]
  },
  { 
    id: '83058328-eeef-4c97-be53-e581faf9bf59', 
    name: "Minimalist Watch", 
    price: 120.00, 
    rating: 4.9, 
    reviews: 89, 
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80", 
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80"
    ],
    category: "Accessories",
    description: "Sleek and minimalist timepiece featuring a matte black dial and genuine leather strap.",
    specs: [
      { label: 'Movement', value: 'Japanese Quartz' },
      { label: 'Water Resistance', value: '3 ATM' },
      { label: 'Strap', value: 'Genuine Leather' }
    ]
  },
  { 
    id: 'c48ff070-4e2a-4216-b2d9-bf89bad29114', 
    name: "Leather Tote", 
    price: 85.00, 
    rating: 4.7, 
    reviews: 34, 
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80", 
    images: [
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80"
    ],
    category: "Fashion",
    description: "Spacious everyday leather tote bag with interior pockets and premium hardware.",
    specs: [
      { label: 'Material', value: 'Full Grain Leather' },
      { label: 'Dimensions', value: '14" x 12" x 6"' }
    ]
  },
  { 
    id: '0333da9e-e179-4002-adc3-0671aa09f628', 
    name: "Premium Wireless Headphones", 
    price: 150.00, 
    rating: 4.6, 
    reviews: 124, 
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80", 
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80"
    ],
    category: "Electronics",
    description: "Experience pure high-fidelity audio with our true wireless earbuds. Features active noise cancellation.",
    specs: [
      { label: 'Battery Life', value: '24 Hours' },
      { label: 'Bluetooth', value: 'v5.2' },
      { label: 'Noise Cancellation', value: 'Active (ANC)' }
    ]
  },
  {
    id: 'ab06c984-5459-433b-9f55-a503a204ed5d',
    name: "Classic White Sneakers",
    price: 89.99,
    rating: 4.8,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80"
    ],
    category: "Footwear",
    description: "Versatile, comfortable, and timeless white sneakers. Perfect for any casual outfit.",
    specs: [
      { label: 'Material', value: 'Premium Leather' },
      { label: 'Sole', value: 'Rubber' }
    ]
  },
  {
    id: 'a4286325-dfea-4733-b3f4-a83001cb23d8',
    name: "Mechanical Keyboard",
    price: 135.00,
    rating: 4.9,
    reviews: 342,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80"
    ],
    category: "Electronics",
    description: "Enhance your productivity and gaming with this tactile, RGB-backlit mechanical keyboard.",
    specs: [
      { label: 'Switches', value: 'Cherry MX Brown' },
      { label: 'Connectivity', value: 'Bluetooth & USB-C' }
    ]
  },
  {
    id: 'f5ab3f34-a02f-4656-a8c1-e82f59c5eb1f',
    name: "Vintage Denim Jacket",
    price: 110.00,
    rating: 4.5,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80"
    ],
    category: "Fashion",
    description: "A timeless vintage denim jacket with a relaxed fit. The ultimate layering piece.",
    specs: [
      { label: 'Material', value: '100% Cotton Denim' },
      { label: 'Care', value: 'Machine Wash Cold' }
    ]
  },
  {
    id: 'd1a1027b-93c5-43e4-911d-703d9e5bf81c',
    name: "Smart Fitness Ring",
    price: 299.00,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1599643477874-95859e4d1fb2?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1599643477874-95859e4d1fb2?auto=format&fit=crop&q=80"
    ],
    category: "Electronics",
    description: "Track your sleep, heart rate, and activity levels discreetly with this titanium smart ring.",
    specs: [
      { label: 'Material', value: 'Titanium' },
      { label: 'Battery Life', value: 'Up to 7 days' },
      { label: 'Waterproof', value: '100m' }
    ]
  },
  {
    id: '4616e0fa-64d0-4ace-aea4-199a65ea753b',
    name: "Noise-Cancelling Earbuds",
    price: 129.99,
    rating: 4.6,
    reviews: 412,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80"],
    category: "Electronics",
    description: "Compact wireless earbuds with active noise cancellation and deep bass.",
    specs: [
      { label: 'Battery', value: '8 hours (24h with case)' },
      { label: 'Water Resistance', value: 'IPX4' }
    ]
  },
  {
    id: '30732eef-8312-41a6-ba5c-98986fd3f555',
    name: "Luxury Leather Wallet",
    price: 65.00,
    rating: 4.8,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80"],
    category: "Accessories",
    description: "Handcrafted full-grain leather wallet with RFID blocking technology.",
    specs: [
      { label: 'Material', value: 'Full-grain Leather' },
      { label: 'Features', value: 'RFID Blocking, 8 Card Slots' }
    ]
  },
  {
    id: '308da2ad-e587-4cb7-a5f9-0ed27158cc93',
    name: "Polaroid Instant Camera",
    price: 99.00,
    rating: 4.5,
    reviews: 304,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80"],
    category: "Electronics",
    description: "Capture memories instantly with this retro-styled analog instant camera.",
    specs: [
      { label: 'Film Type', value: 'i-Type Film' },
      { label: 'Flash', value: 'Built-in automatic flash' }
    ]
  },
  {
    id: 'c3ff7f4e-05f0-46b8-96ab-baa196083e03',
    name: "Oversized Cotton Hoodie",
    price: 55.00,
    rating: 4.7,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80"],
    category: "Fashion",
    description: "Premium heavy-weight cotton hoodie for ultimate comfort and streetwear style.",
    specs: [
      { label: 'Material', value: '100% Organic Cotton' },
      { label: 'Fit', value: 'Oversized Boxy Fit' }
    ]
  },
  {
    id: '06e22fee-253d-4896-ba2a-8bbd72b0cd13',
    name: "Gaming Mouse Pro",
    price: 79.99,
    rating: 4.9,
    reviews: 589,
    image: "https://images.unsplash.com/photo-1527814050087-379381547962?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1527814050087-379381547962?auto=format&fit=crop&q=80"],
    category: "Electronics",
    description: "Ultra-lightweight wireless gaming mouse with a 25K DPI optical sensor.",
    specs: [
      { label: 'Weight', value: '63 grams' },
      { label: 'Sensor', value: '25,600 DPI Optical' }
    ]
  },
  {
    id: 'c6aebab0-ee45-42c4-979d-0f9b5dbe4b41',
    name: "Running Shoes",
    price: 130.00,
    rating: 4.6,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80"],
    category: "Footwear",
    description: "High-performance running shoes with breathable mesh and responsive cushioning.",
    specs: [
      { label: 'Upper', value: 'Breathable Engineered Mesh' },
      { label: 'Sole', value: 'Responsive Foam' }
    ]
  },
  {
    id: '5059e491-911a-4eaf-b22c-f451c847e43f',
    name: "Classic Sunglasses",
    price: 45.00,
    rating: 4.4,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80"],
    category: "Accessories",
    description: "Timeless wayfarer style sunglasses with UV400 protection.",
    specs: [
      { label: 'Lenses', value: 'UV400 Polycarbonate' },
      { label: 'Frame', value: 'Acetate' }
    ]
  },
  {
    id: '46e160dd-693e-48fd-b320-c198e164bf83',
    name: "Smart Speaker App",
    price: 149.00,
    rating: 4.8,
    reviews: 672,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80"],
    category: "Electronics",
    description: "Room-filling sound with a smart voice assistant built-in.",
    specs: [
      { label: 'Audio', value: '360-degree sound' },
      { label: 'Smart Home', value: 'Compatible with IoT devices' }
    ]
  },
  {
    id: 'c90cb532-aae5-4d09-8af2-94e4425395de',
    name: "Leather Chelsea Boots",
    price: 185.00,
    rating: 4.7,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80"],
    category: "Footwear",
    description: "Premium handcrafted leather Chelsea boots for formal or casual wear.",
    specs: [
      { label: 'Material', value: 'Calfskin Leather' },
      { label: 'Construction', value: 'Goodyear Welted' }
    ]
  },
  {
    id: '80ac090a-7f5d-492c-9272-362ccb2532f6',
    name: "Travel Backpack",
    price: 120.00,
    rating: 4.9,
    reviews: 432,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80"],
    category: "Accessories",
    description: "Water-resistant, durable travel backpack with a dedicated laptop sleeve and anti-theft zippers.",
    specs: [
      { label: 'Capacity', value: '35 Liters' },
      { label: 'Material', value: 'Ballistic Nylon' }
    ]
  }
];

async function seedDatabase() {
  console.log(`Starting to seed DynamoDB Table: ${config.aws.dynamodb.productsTable}...`);
  for (const product of PRODUCTS) {
    const params = {
      TableName: config.aws.dynamodb.productsTable,
      Item: {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    try {
      await ddbDocClient.send(new PutCommand(params));
      console.log(`Successfully added product: ${product.name}`);
    } catch (error) {
      console.error(`Failed to add product: ${product.name}`, error);
    }
  }
  console.log('Seeding completed!');
}

seedDatabase();
