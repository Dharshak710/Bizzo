export const CATEGORIES = [
  'Decor',
  'Lights',
  'Furniture',
  'Props',
  'Equipment',
  'Linens',
  'Floral',
  'Audio-Visual',
  'Tableware',
  'Tents & Structure',
]

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Damaged', 'Needs Repair']

export const LOCATIONS = [
  'Warehouse A',
  'Warehouse B',
  'Storage Container 1',
  'Storage Container 2',
  'Main Showroom',
  'Off-site Facility',
]

export const ROLES = ['Admin', 'Staff', 'Viewer']

export const seedUsers = [
  { id: 'u1', name: 'Sarah Mitchell', email: 'admin@events.com', password: 'admin123', role: 'Admin' },
  { id: 'u2', name: 'James Carter', email: 'staff@events.com', password: 'staff123', role: 'Staff' },
  { id: 'u3', name: 'Emily Roberts', email: 'viewer@events.com', password: 'viewer123', role: 'Viewer' },
]

export const seedVendors = [
  { id: 'v1', name: 'Luminosa Lighting Co.', contactPerson: 'Marco Rossi', email: 'marco@luminosa.com', phone: '+1 (555) 100-2000', address: '142 Light Ave, Brooklyn, NY', category: 'Lights', notes: 'Premium uplighting and chandeliers. Net-30 terms.' },
  { id: 'v2', name: 'Bloom & Petal Florals', contactPerson: 'Aisha Khan', email: 'aisha@bloompetal.com', phone: '+1 (555) 200-3000', address: '88 Garden St, Queens, NY', category: 'Floral', notes: 'Fresh and silk arrangements. Same-day delivery available.' },
  { id: 'v3', name: 'Elegant Events Furniture', contactPerson: 'David Chen', email: 'david@elegantfurn.com', phone: '+1 (555) 300-4000', address: '5 Industrial Pkwy, Newark, NJ', category: 'Furniture', notes: 'Chiavari, ghost, and lounge furniture rentals.' },
  { id: 'v4', name: 'StageRight Productions', contactPerson: 'Lisa Park', email: 'lisa@stageright.com', phone: '+1 (555) 400-5000', address: '210 Tech Blvd, Jersey City, NJ', category: 'Audio-Visual', notes: 'PA systems, projectors, LED walls.' },
  { id: 'v5', name: 'Canvas & Crown Tents', contactPerson: 'Tom Baker', email: 'tom@canvascrown.com', phone: '+1 (555) 500-6000', address: '33 Tent Way, Yonkers, NY', category: 'Tents & Structure', notes: 'Sailcloth and pole tents up to 60x120.' },
  { id: 'v6', name: 'Luxe Linen House', contactPerson: 'Nina Patel', email: 'nina@luxelinen.com', phone: '+1 (555) 600-7000', address: '77 Fabric Ln, Bronx, NY', category: 'Linens', notes: 'Tablecloths, runners, napkins, drapery.' },
]

export const seedItems = [
  { id: 'i1', name: 'Gold Chiavari Chair', category: 'Furniture', sku: 'FUR-CH-001', quantity: 300, available: 245, condition: 'Excellent', location: 'Warehouse A', vendorId: 'v3', minStock: 50, price: 12, description: 'Gold chiavari chairs with ivory cushions.' },
  { id: 'i2', name: 'Round Banquet Table 60"', category: 'Furniture', sku: 'FUR-TB-002', quantity: 80, available: 62, condition: 'Good', location: 'Warehouse A', vendorId: 'v3', minStock: 20, price: 18, description: '60-inch round folding banquet table.' },
  { id: 'i3', name: 'LED Uplight Bar (Wireless)', category: 'Lights', sku: 'LGT-UL-001', quantity: 120, available: 90, condition: 'Excellent', location: 'Warehouse B', vendorId: 'v1', minStock: 30, price: 25, description: 'Wireless DMX LED uplighting bars, battery powered.' },
  { id: 'i4', name: 'Crystal Chandelier (Large)', category: 'Lights', sku: 'LGT-CH-002', quantity: 12, available: 8, condition: 'Excellent', location: 'Main Showroom', vendorId: 'v1', minStock: 3, price: 150, description: 'Large crystal chandelier for ceiling installations.' },
  { id: 'i5', name: 'String Light Canopy (100ft)', category: 'Lights', sku: 'LGT-SL-003', quantity: 40, available: 35, condition: 'Good', location: 'Warehouse B', vendorId: 'v1', minStock: 10, price: 40, description: 'Edison bulb string lights, 100 ft runs.' },
  { id: 'i6', name: 'White Silk Floral Arch', category: 'Floral', sku: 'FLR-AR-001', quantity: 8, available: 6, condition: 'Good', location: 'Storage Container 1', vendorId: 'v2', minStock: 2, price: 85, description: 'Pre-arranged silk floral ceremony arch.' },
  { id: 'i7', name: 'Ceremonial Floral Centerpiece', category: 'Floral', sku: 'FLR-CP-002', quantity: 60, available: 40, condition: 'Fair', location: 'Storage Container 1', vendorId: 'v2', minStock: 15, price: 35, description: 'Mixed floral centerpieces for tables.' },
  { id: 'i8', name: 'Ghost Acrylic Chair', category: 'Furniture', sku: 'FUR-CH-003', quantity: 50, available: 50, condition: 'Excellent', location: 'Warehouse A', vendorId: 'v3', minStock: 10, price: 15, description: 'Clear acrylic ghost chairs.' },
  { id: 'i9', name: 'Velvet Lounge Sofa (Burgundy)', category: 'Furniture', sku: 'FUR-SF-004', quantity: 15, available: 9, condition: 'Good', location: 'Main Showroom', vendorId: 'v3', minStock: 4, price: 60, description: 'Burgundy velvet lounge seating.' },
  { id: 'i10', name: 'PA Speaker System (1000W)', category: 'Audio-Visual', sku: 'AV-SP-001', quantity: 20, available: 16, condition: 'Excellent', location: 'Warehouse B', vendorId: 'v4', minStock: 5, price: 75, description: 'Active 1000W PA speakers with stands.' },
  { id: 'i11', name: 'Wireless Microphone Set', category: 'Audio-Visual', sku: 'AV-MC-002', quantity: 24, available: 20, condition: 'Good', location: 'Warehouse B', vendorId: 'v4', minStock: 6, price: 30, description: 'Handheld + lapel wireless mic systems.' },
  { id: 'i12', name: 'LED Video Wall (3x2m)', category: 'Audio-Visual', sku: 'AV-VW-003', quantity: 4, available: 3, condition: 'Excellent', location: 'Off-site Facility', vendorId: 'v4', minStock: 1, price: 500, description: 'Modular LED video wall panels.' },
  { id: 'i13', name: 'Satin Tablecloth (120" Round)', category: 'Linens', sku: 'LIN-TC-001', quantity: 200, available: 140, condition: 'Good', location: 'Storage Container 2', vendorId: 'v6', minStock: 50, price: 8, description: 'Ivory satin round tablecloths.' },
  { id: 'i14', name: 'Linen Napkins (Set of 100)', category: 'Linens', sku: 'LIN-NP-002', quantity: 1000, available: 850, condition: 'Good', location: 'Storage Container 2', vendorId: 'v6', minStock: 200, price: 45, description: 'Assorted color linen napkin sets.' },
  { id: 'i15', name: 'Gold Charger Plates', category: 'Tableware', sku: 'TBL-CP-001', quantity: 500, available: 420, condition: 'Excellent', location: 'Storage Container 2', vendorId: 'v6', minStock: 100, price: 3, description: 'Gold beaded charger plates.' },
  { id: 'i16', name: 'Crystal Stemware Set (50)', category: 'Tableware', sku: 'TBL-SW-002', quantity: 300, available: 240, condition: 'Good', location: 'Storage Container 2', vendorId: 'v6', minStock: 60, price: 55, description: 'Wine, water, and champagne glasses.' },
  { id: 'i17', name: 'Sailcloth Tent 40x80', category: 'Tents & Structure', sku: 'TNT-ST-001', quantity: 6, available: 4, condition: 'Good', location: 'Off-site Facility', vendorId: 'v5', minStock: 2, price: 1200, description: 'Sailcloth pole tent, 40x80 ft.' },
  { id: 'i18', name: 'Dance Floor (White LED 20x20)', category: 'Props', sku: 'PRP-DF-001', quantity: 8, available: 6, condition: 'Good', location: 'Off-site Facility', vendorId: 'v5', minStock: 2, price: 300, description: 'Modular white LED-lit dance floor.' },
  { id: 'i19', name: 'Geometric Backdrop (Brass)', category: 'Decor', sku: 'DCR-BD-001', quantity: 10, available: 7, condition: 'Excellent', location: 'Main Showroom', vendorId: 'v3', minStock: 3, price: 120, description: 'Brass geometric backdrop panels for photo walls.' },
  { id: 'i20', name: 'Candelabra (5-arm Gold)', category: 'Decor', sku: 'DCR-CD-002', quantity: 30, available: 22, condition: 'Good', location: 'Main Showroom', vendorId: 'v6', minStock: 8, price: 40, description: '5-arm gold candelabras for table decor.' },
  { id: 'i21', name: 'Vintage Rug Set', category: 'Props', sku: 'PRP-RG-002', quantity: 25, available: 18, condition: 'Fair', location: 'Storage Container 1', vendorId: 'v3', minStock: 5, price: 50, description: 'Assorted vintage Persian-style rugs.' },
  { id: 'i22', name: 'Fog/Haze Machine', category: 'Equipment', sku: 'EQP-FG-001', quantity: 8, available: 7, condition: 'Good', location: 'Warehouse B', vendorId: 'v4', minStock: 2, price: 65, description: 'Low-fog and haze machines for lighting effects.' },
  { id: 'i23', name: 'Generator (5kW Silent)', category: 'Equipment', sku: 'EQP-GN-002', quantity: 5, available: 4, condition: 'Good', location: 'Off-site Facility', vendorId: 'v4', minStock: 2, price: 200, description: 'Silent inverter generators for outdoor events.' },
  { id: 'i24', name: 'Pinstripe Table Runner (Set of 20)', category: 'Linens', sku: 'LIN-TR-003', quantity: 150, available: 110, condition: 'Good', location: 'Storage Container 2', vendorId: 'v6', minStock: 30, price: 25, description: 'Black/white pinstripe table runners.' },
]

export const seedEvents = [
  { id: 'e1', name: 'Anderson Wedding', client: 'Mia & Luke Anderson', eventDate: '2026-07-12', venue: 'The Grand Pavilion, Hamptons', status: 'upcoming', description: 'Outdoor garden wedding, 180 guests, gold & blush theme.' },
  { id: 'e2', name: 'Corporate Gala 2026', client: 'Vortex Technologies', eventDate: '2026-06-28', venue: 'Javits Center, NYC', status: 'upcoming', description: 'Annual corporate gala, 500 guests, LED wall + lounge areas.' },
  { id: 'e3', name: 'Thompson Reception', client: 'Emma Thompson', eventDate: '2026-06-15', venue: 'Brooklyn Botanic Garden', status: 'completed', description: 'Intimate reception, 120 guests, floral-heavy decor.' },
  { id: 'e4', name: 'Patel Sangeet Night', client: 'Priya & Arjun Patel', eventDate: '2026-07-20', venue: 'Royal Palace Banquet, NJ', status: 'upcoming', description: 'Sangeet celebration, 350 guests, vibrant colors, dance floor.' },
  { id: 'e5', name: 'Harbor Summer Launch', client: 'Harbor Yacht Club', eventDate: '2026-06-30', venue: 'Harbor Yacht Club Marina', status: 'upcoming', description: 'Summer launch party, 200 guests, nautical theme, outdoor.' },
]

export const seedBookings = [
  { id: 'b1', eventId: 'e1', itemId: 'i1', quantity: 180, status: 'reserved', bookedAt: '2026-06-01', returnDate: '2026-07-13', condition: 'Excellent', notes: 'All chairs with cushions.' },
  { id: 'b2', eventId: 'e1', itemId: 'i3', quantity: 40, status: 'reserved', bookedAt: '2026-06-01', returnDate: '2026-07-13', condition: 'Excellent', notes: 'Warm amber wash around perimeter.' },
  { id: 'b3', eventId: 'e1', itemId: 'i13', quantity: 20, status: 'reserved', bookedAt: '2026-06-02', returnDate: '2026-07-13', condition: 'Good', notes: '' },
  { id: 'b4', eventId: 'e1', itemId: 'i6', quantity: 1, status: 'reserved', bookedAt: '2026-06-02', returnDate: '2026-07-13', condition: 'Good', notes: 'Ceremony arch.' },
  { id: 'b5', eventId: 'e2', itemId: 'i12', quantity: 1, status: 'allocated', bookedAt: '2026-06-10', returnDate: '2026-06-29', condition: 'Excellent', notes: 'Main stage video wall.' },
  { id: 'b6', eventId: 'e2', itemId: 'i10', quantity: 4, status: 'allocated', bookedAt: '2026-06-10', returnDate: '2026-06-29', condition: 'Good', notes: 'Main PA array.' },
  { id: 'b7', eventId: 'e2', itemId: 'i9', quantity: 6, status: 'allocated', bookedAt: '2026-06-11', returnDate: '2026-06-29', condition: 'Good', notes: 'VIP lounge area.' },
  { id: 'b8', eventId: 'e3', itemId: 'i1', quantity: 120, status: 'returned', bookedAt: '2026-06-01', returnDate: '2026-06-16', condition: 'Good', notes: 'All returned, 2 chairs need cleaning.' },
  { id: 'b9', eventId: 'e3', itemId: 'i7', quantity: 15, status: 'returned', bookedAt: '2026-06-01', returnDate: '2026-06-16', condition: 'Fair', notes: 'Some floral replacements needed.' },
  { id: 'b10', eventId: 'e3', itemId: 'i20', quantity: 8, status: 'partial-return', bookedAt: '2026-06-01', returnDate: '2026-06-16', condition: 'Damaged', notes: '2 candelabras damaged in transit.' },
  { id: 'b11', eventId: 'e4', itemId: 'i18', quantity: 1, status: 'reserved', bookedAt: '2026-06-15', returnDate: '2026-07-21', condition: 'Good', notes: 'Main dance floor.' },
  { id: 'b12', eventId: 'e4', itemId: 'i3', quantity: 30, status: 'reserved', bookedAt: '2026-06-15', returnDate: '2026-07-21', condition: 'Excellent', notes: 'Color-changing for dance sets.' },
  { id: 'b13', eventId: 'e5', itemId: 'i5', quantity: 5, status: 'reserved', bookedAt: '2026-06-12', returnDate: '2026-07-01', condition: 'Good', notes: 'Marina string light canopy.' },
  { id: 'b14', eventId: 'e5', itemId: 'i17', quantity: 2, status: 'reserved', bookedAt: '2026-06-12', returnDate: '2026-07-01', condition: 'Good', notes: 'Main dining tent.' },
]

export const seedTransactions = [
  { id: 't1', itemId: 'i1', type: 'in', quantity: 300, date: '2026-01-15', note: 'Initial stock purchase', eventId: '' },
  { id: 't2', itemId: 'i3', type: 'in', quantity: 120, date: '2026-01-20', note: 'Initial stock purchase', eventId: '' },
  { id: 't3', itemId: 'i1', type: 'out', quantity: 55, date: '2026-06-01', note: 'Allocated to Anderson Wedding', eventId: 'e1' },
  { id: 't4', itemId: 'i1', type: 'out', quantity: 0, date: '2026-06-15', note: 'Thompson Reception returned', eventId: 'e3' },
  { id: 't5', itemId: 'i3', type: 'out', quantity: 30, date: '2026-06-01', note: 'Allocated to Anderson Wedding', eventId: 'e1' },
  { id: 't6', itemId: 'i12', type: 'out', quantity: 1, date: '2026-06-10', note: 'Allocated to Corporate Gala', eventId: 'e2' },
  { id: 't7', itemId: 'i10', type: 'out', quantity: 4, date: '2026-06-10', note: 'Allocated to Corporate Gala', eventId: 'e2' },
  { id: 't8', itemId: 'i1', type: 'in', quantity: 0, date: '2026-06-16', note: 'Thompson Reception return processed', eventId: 'e3' },
]
