const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
require('dotenv').config();

// Disable SSL rejection for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const sampleHotels = [
  {
    name: 'The Taj Mahal Palace',
    destination: 'Mumbai',
    address: {
      street: 'Apollo Bunder',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001'
    },
    location: {
      coordinates: [72.8333, 18.9217]
    },
    description: 'Iconic luxury hotel with Arabian Sea views, multiple restaurants & a spa, plus butler service.',
    rating: 4.7,
    reviewCount: 3421,
    amenities: ['WiFi', 'Spa', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Concierge', 'Business Center'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd'
    ],
    rooms: [
      {
        roomId: 'TAJ001',
        name: 'Superior Room City View',
        type: 'double',
        price: 15000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Safe', 'Coffee Maker'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'],
        availability: 5,
        description: 'Elegant room with city views',
        size: '35 sqm',
        bedType: 'King'
      },
      {
        roomId: 'TAJ002',
        name: 'Luxury Suite Sea View',
        type: 'suite',
        price: 35000,
        capacity: 4,
        amenities: ['AC', 'TV', 'Mini Bar', 'Safe', 'Coffee Maker', 'Bathtub', 'Living Area'],
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32'],
        availability: 3,
        description: 'Spacious suite with panoramic sea views',
        size: '75 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 24 hours before check-in',
      childPolicy: 'Children of all ages are welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 22 6665 3366',
      email: 'reservations@tajhotels.com',
      website: 'www.tajhotels.com'
    },
    featured: true,
    priceRange: { min: 15000, max: 35000 },
    tags: ['luxury', 'heritage', 'business', 'family']
  },
  {
    name: 'The Oberoi Udaivilas',
    destination: 'Udaipur',
    address: {
      street: 'Badi-Gorela-Mulla Talai Rd',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      postalCode: '313001'
    },
    location: {
      coordinates: [73.6807, 24.5759]
    },
    description: 'Palatial resort on Lake Pichola with traditional architecture, courtyards & a spa.',
    rating: 4.9,
    reviewCount: 2156,
    amenities: ['WiFi', 'Spa', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Lake View', 'Boat Service', 'Gardens'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'
    ],
    rooms: [
      {
        roomId: 'OBU001',
        name: 'Premier Room',
        type: 'double',
        price: 28000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Safe', 'Lake View', 'Bathtub'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
        availability: 8,
        description: 'Luxurious room with semi-private pool',
        size: '60 sqm',
        bedType: 'King'
      },
      {
        roomId: 'OBU002',
        name: 'Kohinoor Suite',
        type: 'suite',
        price: 85000,
        capacity: 4,
        amenities: ['AC', 'TV', 'Mini Bar', 'Private Pool', 'Butler Service', 'Living Room'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'],
        availability: 2,
        description: 'Royal suite with private pool and lake views',
        size: '250 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 48 hours before check-in',
      childPolicy: 'Children under 12 stay free',
      petPolicy: 'Small pets allowed on request'
    },
    contact: {
      phone: '+91 294 243 3300',
      email: 'reservations@oberoihotels.com',
      website: 'www.oberoihotels.com'
    },
    featured: true,
    priceRange: { min: 28000, max: 85000 },
    tags: ['luxury', 'palace', 'lake', 'romantic', 'wedding']
  },
  {
    name: 'ITC Grand Chola',
    destination: 'Chennai',
    address: {
      street: '63 Mount Road, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      postalCode: '600032'
    },
    location: {
      coordinates: [80.2209, 13.0108]
    },
    description: 'Grand hotel inspired by Chola dynasty architecture with luxury spa and multiple dining options.',
    rating: 4.6,
    reviewCount: 1876,
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Spa', 'Salon'],
    images: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
      'https://images.unsplash.com/photo-1574643156929-51fa098b0394'
    ],
    rooms: [
      {
        roomId: 'ITC001',
        name: 'Executive Club Room',
        type: 'double',
        price: 12000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Safe', 'Work Desk'],
        images: ['https://images.unsplash.com/photo-1594560913095-8cf34bab82f0'],
        availability: 10,
        description: 'Elegant room with club lounge access',
        size: '40 sqm',
        bedType: 'Queen'
      },
      {
        roomId: 'ITC002',
        name: 'Chola Suite',
        type: 'suite',
        price: 45000,
        capacity: 3,
        amenities: ['AC', 'TV', 'Mini Bar', 'Living Room', 'Dining Area', 'Bathtub'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
        availability: 4,
        description: 'Luxurious suite with traditional decor',
        size: '120 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Non-refundable',
      childPolicy: 'Children welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 44 2220 0000',
      email: 'grandchola@itchotels.in'
    },
    featured: false,
    priceRange: { min: 12000, max: 45000 },
    tags: ['business', 'luxury', 'heritage']
  },
  {
    name: 'The Leela Palace',
    destination: 'Bangalore',
    address: {
      street: '23 Old Airport Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560008'
    },
    location: {
      coordinates: [77.6489, 12.9606]
    },
    description: 'Palatial luxury hotel with lush gardens, world-class spa, and award-winning restaurants.',
    rating: 4.9,
    reviewCount: 2845,
    amenities: ['WiFi', 'Spa', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Garden', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c'
    ],
    rooms: [
      {
        roomId: 'LEE001',
        name: 'Royal Premier Room',
        type: 'deluxe',
        price: 20000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Safe', 'Bathtub'],
        images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061'],
        availability: 7,
        description: 'Regal room with garden views',
        size: '45 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '15:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 72 hours',
      childPolicy: 'Children under 5 stay free',
      petPolicy: 'Pets allowed with prior approval'
    },
    contact: {
      phone: '+91 80 2521 1234',
      email: 'reservations@theleela.com'
    },
    featured: true,
    priceRange: { min: 20000, max: 45000 },
    tags: ['luxury', 'palace', 'spa', 'wedding']
  },
  {
    name: 'Wildflower Hall Shimla',
    destination: 'Shimla',
    address: {
      street: 'Chharabra',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      country: 'India',
      postalCode: '171012'
    },
    location: {
      coordinates: [77.1458, 31.1417]
    },
    description: 'Mountain resort in the Himalayas offering luxury accommodation with spectacular views.',
    rating: 4.8,
    reviewCount: 1234,
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Bar', 'Hiking', 'Library', 'Fireplace', 'Mountain View'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6'
    ],
    rooms: [
      {
        roomId: 'WFH001',
        name: 'Mountain View Room',
        type: 'double',
        price: 22000,
        capacity: 2,
        amenities: ['Heating', 'TV', 'Mini Bar', 'Fireplace', 'Mountain View'],
        images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'],
        availability: 6,
        description: 'Cozy room with Himalayan views',
        size: '42 sqm',
        bedType: 'King'
      },
      {
        roomId: 'WFH002',
        name: 'Lord Kitchener Suite',
        type: 'suite',
        price: 55000,
        capacity: 4,
        amenities: ['Heating', 'TV', 'Mini Bar', 'Fireplace', 'Living Room', 'Dining Area'],
        images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0'],
        availability: 2,
        description: 'Heritage suite with panoramic mountain views',
        size: '140 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 7 days',
      childPolicy: 'Children welcome',
      petPolicy: 'Pets allowed'
    },
    contact: {
      phone: '+91 177 264 8585',
      email: 'wildflower@oberoihotels.com'
    },
    featured: true,
    priceRange: { min: 22000, max: 55000 },
    tags: ['mountain', 'luxury', 'nature', 'romantic']
  },
  {
    name: 'Taj Lake Palace',
    destination: 'Udaipur',
    address: {
      street: 'Pichola Lake',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      postalCode: '313001'
    },
    location: {
      coordinates: [73.6798, 24.5754]
    },
    description: 'Floating marble palace on Lake Pichola, offering royal heritage and unmatched luxury.',
    rating: 4.9,
    reviewCount: 3567,
    amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant', 'Bar', 'Boat Service', 'Heritage Tour', 'Butler Service'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7'
    ],
    rooms: [
      {
        roomId: 'TLP001',
        name: 'Luxury Room Lake View',
        type: 'double',
        price: 40000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Safe', 'Lake View', 'Heritage Decor'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843'],
        availability: 8,
        description: 'Royal room with lake views',
        size: '30 sqm',
        bedType: 'King'
      },
      {
        roomId: 'TLP002',
        name: 'Grand Royal Suite',
        type: 'suite',
        price: 150000,
        capacity: 4,
        amenities: ['AC', 'TV', 'Mini Bar', 'Private Terrace', 'Butler', 'Jacuzzi'],
        images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4c0'],
        availability: 2,
        description: 'Maharaja suite with private terrace',
        size: '180 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 14 days',
      childPolicy: 'Children above 12 allowed',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 294 242 8800',
      email: 'lakepalace.udaipur@tajhotels.com'
    },
    featured: true,
    priceRange: { min: 40000, max: 150000 },
    tags: ['luxury', 'palace', 'lake', 'heritage', 'romantic']
  },
  {
    name: 'The Park Hyderabad',
    destination: 'Hyderabad',
    address: {
      street: '22 Raj Bhavan Road',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500082'
    },
    location: {
      coordinates: [78.4150, 17.4156]
    },
    description: 'Contemporary boutique hotel with modern design, rooftop pool, and trendy nightlife.',
    rating: 4.3,
    reviewCount: 1789,
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Nightclub', 'Business Center'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945'
    ],
    rooms: [
      {
        roomId: 'TPH001',
        name: 'Luxury Room',
        type: 'double',
        price: 8500,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Modern Design'],
        images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c'],
        availability: 12,
        description: 'Stylish room with contemporary decor',
        size: '28 sqm',
        bedType: 'Queen'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 24 hours',
      childPolicy: 'Children welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 40 4949 0000',
      email: 'hyderabad@theparkhotels.com'
    },
    featured: false,
    priceRange: { min: 8500, max: 18000 },
    tags: ['boutique', 'modern', 'nightlife', 'business']
  },
  {
    name: 'Amanbagh Resort',
    destination: 'Jaipur',
    address: {
      street: 'Ajabgarh',
      city: 'Alwar',
      state: 'Rajasthan',
      country: 'India',
      postalCode: '301027'
    },
    location: {
      coordinates: [76.6223, 27.2497]
    },
    description: 'Secluded Mughal-inspired resort in Aravalli Hills with private pools and organic gardens.',
    rating: 4.9,
    reviewCount: 567,
    amenities: ['WiFi', 'Spa', 'Pool', 'Yoga', 'Restaurant', 'Gardens', 'Library', 'Private Pools'],
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'
    ],
    rooms: [
      {
        roomId: 'AMB001',
        name: 'Garden Haveli',
        type: 'villa',
        price: 65000,
        capacity: 2,
        amenities: ['AC', 'Private Pool', 'Garden', 'Butler Service', 'Outdoor Shower'],
        images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7'],
        availability: 4,
        description: 'Private haveli with pool and garden',
        size: '108 sqm',
        bedType: 'King'
      },
      {
        roomId: 'AMB002',
        name: 'Pool Pavilion',
        type: 'villa',
        price: 85000,
        capacity: 2,
        amenities: ['AC', 'Private Pool', 'Terrace', 'Butler Service', 'Living Area'],
        images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'],
        availability: 3,
        description: 'Luxury pavilion with private pool',
        size: '150 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 14 days',
      childPolicy: 'Children above 12 welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 1465 223 333',
      email: 'amanbagh@aman.com'
    },
    featured: true,
    priceRange: { min: 65000, max: 85000 },
    tags: ['luxury', 'resort', 'spa', 'secluded', 'romantic']
  },
  {
    name: 'Vivanta Goa Miramar',
    destination: 'Goa',
    address: {
      street: 'Miramar Beach',
      city: 'Panaji',
      state: 'Goa',
      country: 'India',
      postalCode: '403001'
    },
    location: {
      coordinates: [73.8067, 15.4828]
    },
    description: 'Beach resort with Portuguese heritage, modern amenities, and direct beach access.',
    rating: 4.4,
    reviewCount: 2134,
    amenities: ['WiFi', 'Pool', 'Beach', 'Restaurant', 'Bar', 'Spa', 'Water Sports'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'
    ],
    rooms: [
      {
        roomId: 'VIV001',
        name: 'Superior Charm Garden View',
        type: 'double',
        price: 9000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32'],
        availability: 15,
        description: 'Charming room with garden views',
        size: '33 sqm',
        bedType: 'King or Twin'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 48 hours',
      childPolicy: 'Family friendly',
      petPolicy: 'Pets allowed on request'
    },
    contact: {
      phone: '+91 832 664 5858',
      email: 'vivanta.panaji@tajhotels.com'
    },
    featured: false,
    priceRange: { min: 9000, max: 22000 },
    tags: ['beach', 'resort', 'heritage', 'family']
  },
  {
    name: 'Rambagh Palace',
    destination: 'Jaipur',
    address: {
      street: 'Bhawani Singh Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      postalCode: '302005'
    },
    location: {
      coordinates: [75.8087, 26.8980]
    },
    description: 'Former royal residence turned luxury hotel with ornate rooms, peacock gardens, and polo grounds.',
    rating: 4.8,
    reviewCount: 3890,
    amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant', 'Bar', 'Gardens', 'Polo', 'Heritage Walk'],
    images: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
    ],
    rooms: [
      {
        roomId: 'RBP001',
        name: 'Palace Room',
        type: 'deluxe',
        price: 25000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Heritage Decor', 'Garden View'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
        availability: 10,
        description: 'Royal room with heritage charm',
        size: '40 sqm',
        bedType: 'King'
      },
      {
        roomId: 'RBP002',
        name: 'Historical Suite',
        type: 'suite',
        price: 75000,
        capacity: 3,
        amenities: ['AC', 'TV', 'Mini Bar', 'Living Room', 'Private Terrace', 'Butler'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'],
        availability: 4,
        description: 'Grand suite with royal heritage',
        size: '125 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 7 days',
      childPolicy: 'Children welcome',
      petPolicy: 'Small pets allowed'
    },
    contact: {
      phone: '+91 141 221 1919',
      email: 'rambagh.jaipur@tajhotels.com'
    },
    featured: true,
    priceRange: { min: 25000, max: 75000 },
    tags: ['palace', 'heritage', 'luxury', 'royal', 'wedding']
  },
  {
    name: 'JW Marriott Juhu',
    destination: 'Mumbai',
    address: {
      street: 'Juhu Tara Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400049'
    },
    location: {
      coordinates: [72.8263, 19.1042]
    },
    description: 'Beachfront luxury hotel with Arabian Sea views, multiple restaurants, and outdoor pools.',
    rating: 4.5,
    reviewCount: 2456,
    amenities: ['WiFi', 'Pool', 'Beach', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Business Center'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'
    ],
    rooms: [
      {
        roomId: 'JWM001',
        name: 'Deluxe Sea View',
        type: 'double',
        price: 18000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Sea View', 'Work Desk'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
        availability: 12,
        description: 'Modern room with sea views',
        size: '38 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '15:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 48 hours',
      childPolicy: 'Children stay free',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 22 6693 3000',
      email: 'jwmarriottmumbai@marriott.com'
    },
    featured: false,
    priceRange: { min: 18000, max: 35000 },
    tags: ['beach', 'luxury', 'business', 'family']
  },
  {
    name: 'The Oberoi Amarvilas',
    destination: 'Agra',
    address: {
      street: 'Taj East Gate Road',
      city: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India',
      postalCode: '282001'
    },
    location: {
      coordinates: [78.0421, 27.1585]
    },
    description: 'Luxury hotel 600m from Taj Mahal with uninterrupted views, Mughal gardens, and fountains.',
    rating: 4.9,
    reviewCount: 1890,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Taj View', 'Gardens', 'Golf Cart'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd'
    ],
    rooms: [
      {
        roomId: 'OBA001',
        name: 'Premier Room',
        type: 'double',
        price: 35000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Partial Taj View', 'Bathtub'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'],
        availability: 8,
        description: 'Elegant room with Taj Mahal glimpses',
        size: '40 sqm',
        bedType: 'King'
      },
      {
        roomId: 'OBA002',
        name: 'Kohinoor Suite with Taj View',
        type: 'suite',
        price: 120000,
        capacity: 3,
        amenities: ['AC', 'TV', 'Mini Bar', 'Direct Taj View', 'Private Terrace', 'Butler'],
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32'],
        availability: 2,
        description: 'Luxury suite with unobstructed Taj Mahal views',
        size: '160 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 7 days',
      childPolicy: 'Children under 12 stay free',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 562 223 1515',
      email: 'reservations@oberoiamarvilas.com'
    },
    featured: true,
    priceRange: { min: 35000, max: 120000 },
    tags: ['luxury', 'taj-view', 'heritage', 'romantic']
  },
  {
    name: 'Taj Falaknuma Palace',
    destination: 'Hyderabad',
    address: {
      street: 'Engine Bowli',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500053'
    },
    location: {
      coordinates: [78.4674, 17.3316]
    },
    description: 'Restored Nizam palace on a hilltop with opulent interiors, vintage car collection, and city views.',
    rating: 4.8,
    reviewCount: 1234,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Palace Tour', 'Library', 'Vintage Cars'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6'
    ],
    rooms: [
      {
        roomId: 'TFP001',
        name: 'Palace Room',
        type: 'deluxe',
        price: 30000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Palace Decor', 'City View'],
        images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'],
        availability: 8,
        description: 'Royal room with Nizam-era decor',
        size: '45 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 14 days',
      childPolicy: 'Children welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 40 6629 8585',
      email: 'falaknuma.hyderabad@tajhotels.com'
    },
    featured: true,
    priceRange: { min: 30000, max: 80000 },
    tags: ['palace', 'heritage', 'luxury', 'historic']
  },
  {
    name: 'Kumarakom Lake Resort',
    destination: 'Kumarakom',
    address: {
      street: 'Kumarakom North',
      city: 'Kottayam',
      state: 'Kerala',
      country: 'India',
      postalCode: '686563'
    },
    location: {
      coordinates: [76.4295, 9.6175]
    },
    description: 'Backwater resort with traditional Kerala architecture, houseboat cruises, and Ayurvedic spa.',
    rating: 4.6,
    reviewCount: 2890,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Ayurveda', 'Houseboat', 'Fishing', 'Bird Watching'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7'
    ],
    rooms: [
      {
        roomId: 'KLR001',
        name: 'Heritage Villa',
        type: 'villa',
        price: 16000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Private Garden', 'Traditional Decor'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843'],
        availability: 10,
        description: 'Traditional Kerala villa',
        size: '55 sqm',
        bedType: 'King'
      },
      {
        roomId: 'KLR002',
        name: 'Pool Villa',
        type: 'villa',
        price: 35000,
        capacity: 3,
        amenities: ['AC', 'TV', 'Private Pool', 'Garden', 'Living Area'],
        images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4c0'],
        availability: 5,
        description: 'Luxury villa with private pool',
        size: '120 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 48 hours',
      childPolicy: 'Children welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 481 252 4900',
      email: 'info@kumarakomlakeresort.in'
    },
    featured: false,
    priceRange: { min: 16000, max: 35000 },
    tags: ['backwater', 'resort', 'ayurveda', 'nature']
  },
  {
    name: 'ITC Grand Goa',
    destination: 'Goa',
    address: {
      street: 'Arossim Beach, Cansaulim',
      city: 'South Goa',
      state: 'Goa',
      country: 'India',
      postalCode: '403712'
    },
    location: {
      coordinates: [73.9076, 15.1750]
    },
    description: 'Portuguese-inspired beach resort with lagoons, multiple pools, and direct beach access.',
    rating: 4.5,
    reviewCount: 3456,
    amenities: ['WiFi', 'Pool', 'Beach', 'Spa', 'Restaurant', 'Bar', 'Kids Club', 'Water Sports'],
    images: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
      'https://images.unsplash.com/photo-1574643156929-51fa098b0394'
    ],
    rooms: [
      {
        roomId: 'ITCG001',
        name: 'Tower Ocean View Room',
        type: 'double',
        price: 11000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Balcony', 'Ocean View'],
        images: ['https://images.unsplash.com/photo-1594560913095-8cf34bab82f0'],
        availability: 20,
        description: 'Room with ocean views',
        size: '42 sqm',
        bedType: 'King or Twin'
      }
    ],
    policies: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 24 hours',
      childPolicy: 'Family friendly resort',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 832 672 1234',
      email: 'grandgoa@itchotels.in'
    },
    featured: false,
    priceRange: { min: 11000, max: 28000 },
    tags: ['beach', 'resort', 'family', 'portuguese']
  },
  {
    name: 'The St. Regis Mumbai',
    destination: 'Mumbai',
    address: {
      street: 'Senapati Bapat Marg',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400013'
    },
    location: {
      coordinates: [72.8244, 19.0427]
    },
    description: 'Ultra-luxury hotel in Lower Parel with butler service, rooftop pool, and city views.',
    rating: 4.7,
    reviewCount: 1567,
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Butler Service', 'Business Center'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945'
    ],
    rooms: [
      {
        roomId: 'STR001',
        name: 'Grand Deluxe Room',
        type: 'deluxe',
        price: 22000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Butler Service', 'City View'],
        images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c'],
        availability: 10,
        description: 'Sophisticated room with butler service',
        size: '47 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '15:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 48 hours',
      childPolicy: 'Children welcome',
      petPolicy: 'Small pets allowed'
    },
    contact: {
      phone: '+91 22 6162 8000',
      email: 'stregis.mumbai@stregis.com'
    },
    featured: false,
    priceRange: { min: 22000, max: 55000 },
    tags: ['luxury', 'business', 'butler-service', 'modern']
  },
  {
    name: 'Umaid Bhawan Palace',
    destination: 'Jodhpur',
    address: {
      street: 'Circuit House Road',
      city: 'Jodhpur',
      state: 'Rajasthan',
      country: 'India',
      postalCode: '342006'
    },
    location: {
      coordinates: [73.0478, 26.2809]
    },
    description: 'Art Deco palace hotel with museum, royal suites, and panoramic views of Blue City.',
    rating: 4.9,
    reviewCount: 1123,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Museum', 'Gardens', 'Vintage Cars'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c'
    ],
    rooms: [
      {
        roomId: 'UBP001',
        name: 'Palace Room',
        type: 'deluxe',
        price: 38000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Art Deco Decor', 'Garden View'],
        images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061'],
        availability: 6,
        description: 'Art Deco room in royal palace',
        size: '55 sqm',
        bedType: 'King'
      },
      {
        roomId: 'UBP002',
        name: 'Maharaja Suite',
        type: 'suite',
        price: 150000,
        capacity: 4,
        amenities: ['AC', 'TV', 'Private Terrace', 'Butler', 'Dining Room', 'Study'],
        images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0'],
        availability: 2,
        description: 'Royal suite with Blue City views',
        size: '220 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 14 days',
      childPolicy: 'Children above 12 welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 291 251 0101',
      email: 'reservations@tajhotels.com'
    },
    featured: true,
    priceRange: { min: 38000, max: 150000 },
    tags: ['palace', 'heritage', 'luxury', 'art-deco', 'royal']
  },
  {
    name: 'Evolve Back Coorg',
    destination: 'Coorg',
    address: {
      street: 'Karadigodu Post, Siddapur',
      city: 'Coorg',
      state: 'Karnataka',
      country: 'India',
      postalCode: '571253'
    },
    location: {
      coordinates: [75.9570, 12.3714]
    },
    description: 'Coffee plantation resort with private pool villas, spa, and authentic Kodava experiences.',
    rating: 4.8,
    reviewCount: 2345,
    amenities: ['WiFi', 'Private Pools', 'Spa', 'Restaurant', 'Coffee Plantation', 'Nature Walk', 'Archery'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6'
    ],
    rooms: [
      {
        roomId: 'EVC001',
        name: 'Private Pool Villa',
        type: 'villa',
        price: 28000,
        capacity: 2,
        amenities: ['AC', 'Private Pool', 'Fireplace', 'Coffee Maker', 'Garden'],
        images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'],
        availability: 8,
        description: 'Luxury villa in coffee plantation',
        size: '88 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 7 days',
      childPolicy: 'Children welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 8274 249 800',
      email: 'reservations.coorg@evolveback.com'
    },
    featured: false,
    priceRange: { min: 28000, max: 45000 },
    tags: ['resort', 'nature', 'plantation', 'villa', 'spa']
  },
  {
    name: 'The Lalit New Delhi',
    destination: 'New Delhi',
    address: {
      street: 'Barakhamba Avenue',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001'
    },
    location: {
      coordinates: [77.2195, 28.6328]
    },
    description: 'Central Delhi luxury hotel near Connaught Place with rooftop pool and multiple dining options.',
    rating: 4.3,
    reviewCount: 3678,
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Nightclub'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'
    ],
    rooms: [
      {
        roomId: 'LAL001',
        name: 'Executive Room',
        type: 'double',
        price: 10000,
        capacity: 2,
        amenities: ['AC', 'TV', 'Mini Bar', 'Work Desk', 'City View'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
        availability: 15,
        description: 'Business room near Connaught Place',
        size: '35 sqm',
        bedType: 'Queen'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 24 hours',
      childPolicy: 'Children stay free',
      petPolicy: 'Pets allowed on request'
    },
    contact: {
      phone: '+91 11 4444 7777',
      email: 'delhi@thelalit.com'
    },
    featured: false,
    priceRange: { min: 10000, max: 25000 },
    tags: ['business', 'central', 'nightlife', 'modern']
  },
  {
    name: 'Ananda in the Himalayas',
    destination: 'Rishikesh',
    address: {
      street: 'The Palace Estate, Narendra Nagar',
      city: 'Tehri Garhwal',
      state: 'Uttarakhand',
      country: 'India',
      postalCode: '249175'
    },
    location: {
      coordinates: [78.3870, 30.1573]
    },
    description: 'Himalayan wellness retreat with yoga, meditation, Ayurveda, and panoramic mountain views.',
    rating: 4.9,
    reviewCount: 987,
    amenities: ['WiFi', 'Spa', 'Yoga', 'Meditation', 'Ayurveda', 'Restaurant', 'Library', 'Hiking'],
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'
    ],
    rooms: [
      {
        roomId: 'ANA001',
        name: 'Valley View Room',
        type: 'double',
        price: 32000,
        capacity: 2,
        amenities: ['Heating', 'TV', 'Mini Bar', 'Valley View', 'Yoga Mat'],
        images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'],
        availability: 10,
        description: 'Peaceful room with valley views',
        size: '35 sqm',
        bedType: 'King or Twin'
      },
      {
        roomId: 'ANA002',
        name: 'Palace Suite',
        type: 'suite',
        price: 85000,
        capacity: 2,
        amenities: ['Heating', 'TV', 'Living Room', 'Private Terrace', 'Butler', 'Jacuzzi'],
        images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0'],
        availability: 3,
        description: 'Luxury suite in heritage palace',
        size: '111 sqm',
        bedType: 'King'
      }
    ],
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 14 days',
      childPolicy: 'Children above 14 welcome',
      petPolicy: 'Pets not allowed'
    },
    contact: {
      phone: '+91 1378 227 500',
      email: 'reservations@anandaspa.com'
    },
    featured: true,
    priceRange: { min: 32000, max: 85000 },
    tags: ['wellness', 'spa', 'yoga', 'mountain', 'retreat']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log('Cleared existing hotels');

    // Insert sample hotels
    await Hotel.insertMany(sampleHotels);
    console.log(`${sampleHotels.length} hotels inserted successfully`);

    // Display count
    const count = await Hotel.countDocuments();
    console.log(`Total hotels in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();