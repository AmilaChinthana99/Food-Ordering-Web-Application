import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing records
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.itemVariant.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned database tables.');

  // Create Passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // 1. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@foodie.com',
      password: adminPassword,
      phone: '+94 77 123 4567',
      role: 'SUPER_ADMIN',
    },
  });

  const adminSpicy = await prisma.user.create({
    data: {
      name: 'Kumara Perera',
      email: 'admin.spicy@foodie.com',
      password: adminPassword,
      phone: '+94 71 987 6543',
      role: 'RESTAURANT_ADMIN',
    },
  });

  const adminCeylon = await prisma.user.create({
    data: {
      name: 'Dilshan Silva',
      email: 'admin.ceylon@foodie.com',
      password: adminPassword,
      phone: '+94 76 555 1234',
      role: 'RESTAURANT_ADMIN',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Amila Fernando',
      email: 'customer@foodie.com',
      password: userPassword,
      phone: '+94 70 111 2233',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@foodie.com',
      password: userPassword,
      phone: '+94 77 999 8877',
      role: 'CUSTOMER',
    },
  });

  console.log('👤 Created users.');

  // Saved addresses for Customer 1
  const addr1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Home',
      street: '45 Galle Road, Bambalapitiya',
      city: 'Colombo 04',
      phone: '+94 70 111 2233',
      isDefault: true,
    },
  });

  const addr2 = await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Office',
      street: '120 Union Place, Access Towers',
      city: 'Colombo 02',
      phone: '+94 70 111 2233',
    },
  });

  // 2. Categories
  const categoriesData = [
    { name: 'Kottu & Street Food', slug: 'kottu-street-food', order: 1, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
    { name: 'Rice & Curry', slug: 'rice-curry', order: 2, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' },
    { name: 'Pizza & Italian', slug: 'pizza-italian', order: 3, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop' },
    { name: 'Burgers & Sandwiches', slug: 'burgers-sandwiches', order: 4, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop' },
    { name: 'Healthy & Salads', slug: 'healthy-salads', order: 5, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop' },
    { name: 'Desserts & Sweets', slug: 'desserts-sweets', order: 6, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop' },
    { name: 'Beverages & Juices', slug: 'beverages-juices', order: 7, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  console.log('📂 Created categories.');

  // 3. Restaurants
  const restaurantsData = [
    {
      ownerId: adminCeylon.id,
      name: 'Ceylon Spice Bistro',
      slug: 'ceylon-spice-bistro',
      description: 'Authentic Sri Lankan delicacies, traditional Dutch Lamprais, and aromatic rice & curry cooked with fresh herbs and organic coconut milk.',
      cuisine: 'Sri Lankan, Traditional, Rice & Curry',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop',
      rating: 4.8,
      reviewCount: 142,
      deliveryFee: 250,
      minOrder: 600,
      preparationTime: '25-35 min',
      address: '78 Marine Drive, Colombo 03',
      phone: '+94 11 254 8899',
      openingHours: 'Mon - Sun: 11:00 AM - 10:00 PM',
      isApproved: true,
      isFeatured: true,
    },
    {
      ownerId: adminSpicy.id,
      name: 'Colombo Kottu House',
      slug: 'colombo-kottu-house',
      description: 'The home of sizzlin night kottu! Savor famous Cheese Chicken Kottu, Seafood Palandi Kottu, and crispy String Hopper Kottu.',
      cuisine: 'Sri Lankan Street Food, Kottu, Fast Food',
      logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&auto=format&fit=crop',
      rating: 4.7,
      reviewCount: 230,
      deliveryFee: 200,
      minOrder: 500,
      preparationTime: '20-30 min',
      address: '142 Duplication Road, Colombo 04',
      phone: '+94 11 489 3322',
      openingHours: 'Mon - Sun: 12:00 PM - 11:30 PM',
      isApproved: true,
      isFeatured: true,
    },
    {
      ownerId: adminSpicy.id,
      name: 'Royal Diner & Grill',
      slug: 'royal-diner-grill',
      description: 'Juicy handcrafted gourmet beef burgers, flame-grilled BBQ chicken, crispy fries, and thick malt milkshakes.',
      cuisine: 'Burgers, American, Grill',
      logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&auto=format&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop',
      rating: 4.6,
      reviewCount: 98,
      deliveryFee: 300,
      minOrder: 800,
      preparationTime: '30-40 min',
      address: '22 Ward Place, Colombo 07',
      phone: '+94 11 772 1100',
      openingHours: 'Mon - Sun: 11:30 AM - 11:00 PM',
      isApproved: true,
      isFeatured: true,
    },
    {
      ownerId: adminCeylon.id,
      name: 'Pizza Artisan',
      slug: 'pizza-artisan',
      description: 'Hand-tossed Italian wood-fired pizzas, creamy pasta fettuccine, garlic breadsticks, and authentic gelato.',
      cuisine: 'Italian, Pizza, Pasta',
      logo: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=200&auto=format&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop',
      rating: 4.9,
      reviewCount: 310,
      deliveryFee: 250,
      minOrder: 1000,
      preparationTime: '25-35 min',
      address: '15 Horton Place, Colombo 07',
      phone: '+94 11 889 0044',
      openingHours: 'Mon - Sun: 12:00 PM - 10:30 PM',
      isApproved: true,
      isFeatured: false,
    },
    {
      ownerId: adminCeylon.id,
      name: 'Green Bowl Salad Co',
      slug: 'green-bowl-salad-co',
      description: 'Nutritious quinoa bowls, fresh avocado green salads, cold-pressed fruit juices, and vegan smoothie bowls.',
      cuisine: 'Healthy, Salad, Vegan, Smoothies',
      logo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop',
      rating: 4.5,
      reviewCount: 64,
      deliveryFee: 200,
      minOrder: 600,
      preparationTime: '15-25 min',
      address: '90 Thimbirigasyaya Road, Colombo 05',
      phone: '+94 11 345 6789',
      openingHours: 'Mon - Sun: 08:30 AM - 09:00 PM',
      isApproved: true,
      isFeatured: false,
    },
    {
      ownerId: adminSpicy.id,
      name: 'Sweet Treats Bakery',
      slug: 'sweet-treats-bakery',
      description: 'Delectable Wattalappam, Belgian chocolate brownies, Sri Lankan Faluda, and freshly brewed Ceylon artisan tea.',
      cuisine: 'Desserts, Bakery, Drinks',
      logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&auto=format&fit=crop',
      rating: 4.7,
      reviewCount: 115,
      deliveryFee: 150,
      minOrder: 400,
      preparationTime: '15-20 min',
      address: '50 Nawala Road, Rajagiriya',
      phone: '+94 11 222 3344',
      openingHours: 'Mon - Sun: 09:00 AM - 10:00 PM',
      isApproved: true,
      isFeatured: true,
    },
  ];

  const restaurants: Record<string, any> = {};
  for (const r of restaurantsData) {
    restaurants[r.slug] = await prisma.restaurant.create({ data: r });
  }

  console.log('🏪 Created 6 restaurants.');

  // 4. Menu Items (40+ items with rich descriptions, variants, add-ons)
  const menuItemsData = [
    // --- Ceylon Spice Bistro ---
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['rice-curry'].id,
      name: 'Special Chicken Rice & Curry',
      description: 'Steamed Samba rice served with spicy devilled chicken, coconut sambal, dhal curry, brinjal pahi, fried papadam, and dried chilli.',
      price: 950,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
      variants: [
        { name: 'Regular Portion', price: 950 },
        { name: 'Large / Double Chicken', price: 1350 },
      ],
      addOns: [
        { name: 'Extra Fried Egg', price: 100 },
        { name: 'Extra papadam portion', price: 80 },
        { name: 'Fried Fish Slice', price: 250 },
      ],
    },
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['rice-curry'].id,
      name: 'Authentic Dutch Lamprais (Chicken)',
      description: 'Fragrant ghee rice boiled in stock, served with mixed meat curry, lamb meatballs (frikkadels), blachan, and ash plantain wrapped in banana leaf.',
      price: 1650,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
      variants: [
        { name: 'Chicken Lamprais', price: 1650 },
        { name: 'Special Mutton Lamprais', price: 2100 },
      ],
      addOns: [{ name: 'Extra Frikkadel Meatball (2pcs)', price: 200 }],
    },
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['rice-curry'].id,
      name: 'Seafood Yellow Rice Platter',
      description: 'Fragrant yellow spice rice with spicy prawn curry, fried cuttlefish, fried fish, cashew curry, and katta sambal.',
      price: 1850,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['rice-curry'].id,
      name: 'Polos & Cashew Vegetarian Thali',
      description: 'Tender baby jackfruit (Polos) curry, creamy cashew curry, spicy coconut sambal, gotukola mallum, and red rice.',
      price: 850,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'Ceylon Devilled Pork Rice',
      description: 'Wok-fried red rice with crispy devilled pork chunks, capsicum, onions, and spicy tomato reduction.',
      price: 1400,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: false,
    },
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['beverages-juices'].id,
      name: 'Fresh Woodapple Juice',
      description: 'Classic Sri Lankan fresh woodapple juice sweetened with organic jaggery and coconut milk.',
      price: 350,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
    },
    {
      restaurantId: restaurants['ceylon-spice-bistro'].id,
      categoryId: categories['beverages-juices'].id,
      name: 'King Coconut (Thambili)',
      description: 'Chilled natural fresh king coconut water served directly in the coconut shell.',
      price: 250,
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },

    // --- Colombo Kottu House ---
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'Famous Cheese Chicken Kottu',
      description: 'Shredded godamba roti chopped on griddle with roast chicken, egg, veggies, and drenched in rich mozzarella & cheddar cheese sauce.',
      price: 1250,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
      variants: [
        { name: 'Regular', price: 1250 },
        { name: 'Large (Serves 2)', price: 1950 },
      ],
      addOns: [
        { name: 'Extra Cheese Melt', price: 250 },
        { name: 'Extra Bullseye Fried Egg', price: 100 },
        { name: 'Spicy Chicken Gravy Dip', price: 120 },
      ],
    },
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'Seafood Palandi Kottu',
      description: 'Crispy roti tossed with fresh prawns, cuttlefish, fish fillet, coconut cream gravy, and green chilies.',
      price: 1550,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'String Hopper Roast Chicken Kottu',
      description: 'Tender steamed string hoppers chopped with roast chicken, egg, leeks, carrots, and spicy gravy.',
      price: 1100,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'Dolphin Beef & Cheese Kottu',
      description: 'Cube-cut Godamba roti cooked with slow-cooked tender beef curry, melted cheese, and capsicum.',
      price: 1450,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: false,
    },
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'Vegetable & Cheese Kottu',
      description: 'Fresh seasonal vegetables, mushrooms, paneer cubes, and rich garlic cheese sauce.',
      price: 950,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['kottu-street-food'].id,
      name: 'Hot Butter Cuttlefish (HBC)',
      description: 'Crispy fried cuttlefish rings tossed with butter, dried chilli flakes, spring onion, and capsicum.',
      price: 1650,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['colombo-kottu-house'].id,
      categoryId: categories['beverages-juices'].id,
      name: 'Milo Dinosaur Milkshake',
      description: 'Rich thick iced chocolate Milo smoothie topped with extra Milo powder and chocolate syrup.',
      price: 450,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
    },

    // --- Royal Diner & Grill ---
    {
      restaurantId: restaurants['royal-diner-grill'].id,
      categoryId: categories['burgers-sandwiches'].id,
      name: 'Double Bacon Smash Burger',
      description: 'Two smashed grass-fed beef patties, crispy bacon, melted American cheese, caramelized onions, and secret diner sauce in toasted brioche.',
      price: 1750,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
      variants: [
        { name: 'Single Patty', price: 1350 },
        { name: 'Double Smash Patty', price: 1750 },
        { name: 'Triple Smash Beast', price: 2200 },
      ],
      addOns: [
        { name: 'Extra Cheddar Cheese Slice', price: 150 },
        { name: 'Crispy Fries Combo', price: 300 },
        { name: 'Onion Rings Dip', price: 250 },
      ],
    },
    {
      restaurantId: restaurants['royal-diner-grill'].id,
      categoryId: categories['burgers-sandwiches'].id,
      name: 'Crispy Zinger Chicken Burger',
      description: 'Golden fried spicy chicken breast, coleslaw, jalapenos, and spicy mayo served with a side of seasoned skin-on fries.',
      price: 1450,
      image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['royal-diner-grill'].id,
      categoryId: categories['burgers-sandwiches'].id,
      name: 'Flame Grilled BBQ Chicken (Half)',
      description: 'Half chicken marinated in smoky BBQ marinade, grilled to perfection, served with garlic bread and potato wedges.',
      price: 2100,
      image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['royal-diner-grill'].id,
      categoryId: categories['burgers-sandwiches'].id,
      name: 'Plant-Based Veggie Supreme Burger',
      description: 'Beyond meat patty, grilled mushroom, avocado, vegan mayo, lettuce, tomato in artisanal bun.',
      price: 1600,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
    {
      restaurantId: restaurants['royal-diner-grill'].id,
      categoryId: categories['burgers-sandwiches'].id,
      name: 'Loaded Loaded Fries with Cheese & Chili',
      description: 'Crispy fries smothered in warm cheese sauce, spicy minced beef chili, jalapenos, and sour cream.',
      price: 980,
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['royal-diner-grill'].id,
      categoryId: categories['beverages-juices'].id,
      name: 'Thick Salted Caramel Milkshake',
      description: 'Hand-spun vanilla ice cream, salted caramel drizzle, topped with whipped cream and caramel crunch.',
      price: 550,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },

    // --- Pizza Artisan ---
    {
      restaurantId: restaurants['pizza-artisan'].id,
      categoryId: categories['pizza-italian'].id,
      name: 'Wood-Fired Pepperoni Passion',
      description: 'Neapolitan sourdough crust, San Marzano tomato sauce, double spicy pepperoni, and fresh buffalo mozzarella.',
      price: 2400,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
      variants: [
        { name: 'Medium 10"', price: 2400 },
        { name: 'Large 14"', price: 3400 },
      ],
      addOns: [
        { name: 'Stuffed Cheese Crust', price: 400 },
        { name: 'Extra Pepperoni', price: 350 },
        { name: 'Garlic Butter Dip', price: 150 },
      ],
    },
    {
      restaurantId: restaurants['pizza-artisan'].id,
      categoryId: categories['pizza-italian'].id,
      name: 'Truffle Mushroom & Four Cheese Pizza',
      description: 'White base with black truffle paste, wild button mushrooms, mozzarella, gorgonzola, parmesan, and basil.',
      price: 2600,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
      variants: [
        { name: 'Medium 10"', price: 2600 },
        { name: 'Large 14"', price: 3600 },
      ],
    },
    {
      restaurantId: restaurants['pizza-artisan'].id,
      categoryId: categories['pizza-italian'].id,
      name: 'Spicy Ceylon Devilled Chicken Pizza',
      description: 'Fusion pizza with spicy devilled chicken, onions, green chilies, capsicum, tomato sauce, and double mozzarella.',
      price: 2200,
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['pizza-artisan'].id,
      categoryId: categories['pizza-italian'].id,
      name: 'Classic Margherita Supreme',
      description: 'San Marzano tomato sauce, fresh mozzarella fior di latte, extra virgin olive oil, and fresh basil leaves.',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
    {
      restaurantId: restaurants['pizza-artisan'].id,
      categoryId: categories['pizza-italian'].id,
      name: 'Creamy Prawn Fettuccine Alfredo',
      description: 'Al dente fettuccine pasta tossed in rich parmesan butter cream sauce with sauteed garlic prawns.',
      price: 2100,
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['pizza-artisan'].id,
      categoryId: categories['pizza-italian'].id,
      name: 'Cheesy Garlic Breadsticks',
      description: 'Warm freshly baked sourdough breadsticks brushed with garlic herb butter and melted mozzarella.',
      price: 750,
      image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },

    // --- Green Bowl Salad Co ---
    {
      restaurantId: restaurants['green-bowl-salad-co'].id,
      categoryId: categories['healthy-salads'].id,
      name: 'Avocado & Grilled Chicken Quinoa Bowl',
      description: 'Organic quinoa base topped with sliced Hass avocado, herb marinated grilled chicken breast, cherry tomatoes, cucumbers, corn, and lemon tahini dressing.',
      price: 1450,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
      addOns: [
        { name: 'Extra Avocado Scoop', price: 200 },
        { name: 'Extra Grilled Chicken', price: 300 },
        { name: 'Boiled Egg', price: 80 },
      ],
    },
    {
      restaurantId: restaurants['green-bowl-salad-co'].id,
      categoryId: categories['healthy-salads'].id,
      name: 'Mediterranean Salmon Poke Bowl',
      description: 'Fresh Norwegian raw salmon cubes, edamame, pickled ginger, wakame seaweed, and brown rice with spicy ponzu dressing.',
      price: 2200,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
      isVeg: false,
      isPopular: true,
    },
    {
      restaurantId: restaurants['green-bowl-salad-co'].id,
      categoryId: categories['healthy-salads'].id,
      name: 'Superfood Kale & Roasted Beetroot Salad',
      description: 'Fresh kale, roasted beetroot, feta cheese, walnuts, pomegranate seeds, and honey mustard dressing.',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
    {
      restaurantId: restaurants['green-bowl-salad-co'].id,
      categoryId: categories['beverages-juices'].id,
      name: 'Green Detox Cold Pressed Juice',
      description: '100% natural blend of spinach, cucumber, green apple, celery, lemon, and ginger. No added sugar.',
      price: 550,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
    },

    // --- Sweet Treats Bakery ---
    {
      restaurantId: restaurants['sweet-treats-bakery'].id,
      categoryId: categories['desserts-sweets'].id,
      name: 'Traditional Sri Lankan Wattalappam',
      description: 'Rich baked coconut milk and kitul jaggery pudding infused with cardamoms, nutmeg, and topped with toasted cashews.',
      price: 450,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
      variants: [
        { name: 'Single Portion Cup', price: 450 },
        { name: 'Family Tub (Serves 4)', price: 1600 },
      ],
    },
    {
      restaurantId: restaurants['sweet-treats-bakery'].id,
      categoryId: categories['desserts-sweets'].id,
      name: 'Royal Sri Lankan Faluda Special',
      description: 'Chilled rose syrup drink with sweet basil seeds (kasakasa), grass jelly cubes, chilled milk, and a scoop of vanilla ice cream.',
      price: 550,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
    },
    {
      restaurantId: restaurants['sweet-treats-bakery'].id,
      categoryId: categories['desserts-sweets'].id,
      name: 'Warm Belgian Chocolate Brownie',
      description: 'Fudgy dark Belgian chocolate brownie served warm with a scoop of artisanal vanilla bean ice cream.',
      price: 650,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: true,
    },
    {
      restaurantId: restaurants['sweet-treats-bakery'].id,
      categoryId: categories['desserts-sweets'].id,
      name: 'New York Cheesecake Slice',
      description: 'Classic creamy baked cheesecake on a graham cracker crust with sweet strawberry compote.',
      price: 850,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
    {
      restaurantId: restaurants['sweet-treats-bakery'].id,
      categoryId: categories['beverages-juices'].id,
      name: 'Iced Ceylon Cardamom Chai Latte',
      description: 'Freshly brewed strong Ceylon black tea spiced with fresh cardamom and steamed creamy condensed milk.',
      price: 380,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop',
      isVeg: true,
      isPopular: false,
    },
  ];

  for (const item of menuItemsData) {
    const { variants, addOns, ...itemData } = item;
    await prisma.menuItem.create({
      data: {
        ...itemData,
        variants: variants?.length ? { create: variants } : undefined,
        addOns: addOns?.length ? { create: addOns } : undefined,
      },
    });
  }

  console.log('🍔 Created 40+ menu items with variants and add-ons.');

  // 5. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 500,
        maxDiscount: 300,
        isActive: true,
      },
      {
        code: 'CEYLON20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 1000,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: 'FREEDEL',
        discountType: 'FIXED',
        discountValue: 250,
        minOrderValue: 800,
        isActive: true,
      },
    ],
  });

  console.log('🎟️ Created sample coupons.');

  // 6. Sample Orders & Reviews
  const firstRestaurant = restaurants['colombo-kottu-house'];
  const sampleMenuItem = await prisma.menuItem.findFirst({
    where: { restaurantId: firstRestaurant.id },
  });

  if (sampleMenuItem) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-789012',
        userId: customer1.id,
        restaurantId: firstRestaurant.id,
        addressId: addr1.id,
        orderType: 'DELIVERY',
        paymentMethod: 'COD',
        paymentStatus: 'COMPLETED',
        orderStatus: 'DELIVERED',
        subtotal: 1250,
        deliveryFee: 200,
        tax: 62,
        discount: 0,
        totalAmount: 1512,
        specialInstructions: 'Please deliver to the 2nd floor.',
        items: {
          create: [
            {
              menuItemId: sampleMenuItem.id,
              name: sampleMenuItem.name,
              price: sampleMenuItem.price,
              quantity: 1,
              variantName: 'Regular',
              addOnsJson: JSON.stringify([{ name: 'Extra Cheese Melt', price: 250 }]),
            },
          ],
        },
      },
    });

    await prisma.review.create({
      data: {
        userId: customer1.id,
        restaurantId: firstRestaurant.id,
        orderId: sampleOrder.id,
        rating: 5,
        comment: 'Absolutely amazing Cheese Chicken Kottu! Arrived super fast and hot.',
        reply: 'Thank you so much Amila! Glad you loved our signature cheese kottu!',
      },
    });
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
