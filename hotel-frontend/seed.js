const hotels = [
  'LuxeStay Chennai', 'LuxeStay Bangalore', 'LuxeStay Kochi',
  'LuxeStay Hyderabad', 'LuxeStay Munnar', 'LuxeStay Ooty'
];

const roomConfig = [
  { type: 'Single', basePrice: 2000 },
  { type: 'Double', basePrice: 3500 },
  { type: 'Deluxe', basePrice: 5500 },
  { type: 'Suite', basePrice: 8500 },
  { type: 'Royal Suite', basePrice: 15000 },
  { type: 'Ocean Villa', basePrice: 25000 }
];

async function seed() {
  console.log('Starting seed process...');
  for (const hotel of hotels) {
    console.log(`Seeding 15 rooms for ${hotel}...`);
    for (let i = 0; i < 15; i++) {
      // Pick a room type based on index (mix them up)
      const config = roomConfig[i % roomConfig.length];
      
      const payload = {
        hotelName: hotel,
        roomType: config.type,
        // Add a slight realistic price variance
        price: config.basePrice + (Math.floor(Math.random() * 4) * 500),
        available: true
      };

      try {
        const res = await fetch('http://127.0.0.1:8082/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          console.error(`Failed to insert room ${i+1} for ${hotel}`);
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
      }
    }
  }
  console.log('Successfully seeded 78 rooms across 6 hotels!');
}

seed();
