import type { AppData } from "../types";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysFromNow = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const seedData: AppData = {
  users: [
    {
      id: "u1",
      name: "Sarah Mitchell",
      email: "admin@bizzo.com",
      password: "admin123",
      role: "admin",
      active: true,
      createdAt: iso(now),
    },
    {
      id: "u2",
      name: "James Carter",
      email: "manager@bizzo.com",
      password: "manager123",
      role: "manager",
      active: true,
      createdAt: iso(now),
    },
    {
      id: "u3",
      name: "Priya Sharma",
      email: "staff@bizzo.com",
      password: "staff123",
      role: "staff",
      active: true,
      createdAt: iso(now),
    },
  ],
  categories: [
    { id: "c1", name: "Decor", description: "Florals, vases, centerpieces, drapery", color: "#ec4899" },
    { id: "c2", name: "Lights", description: "Lighting fixtures and effects", color: "#f59e0b" },
    { id: "c3", name: "Furniture", description: "Tables, chairs, lounges", color: "#10b981" },
    { id: "c4", name: "Props", description: "Thematic props and backdrops", color: "#6366f1" },
    { id: "c5", name: "Equipment", description: "AV, staging, rigging", color: "#ef4444" },
    { id: "c6", name: "Tableware", description: "Crockery, glassware, cutlery", color: "#14b8a6" },
  ],
  vendors: [
    { id: "v1", name: "Luminosa Lighting Co.", contactPerson: "Marco Diaz", email: "sales@luminosa.com", phone: "+1 555-0101", address: "210 Glow Ave, Austin TX", category: "Lights", notes: "Net-30 terms", createdAt: iso(now) },
    { id: "v2", name: "Petal & Stem Florals", contactPerson: "Ava Green", email: "ava@petalstem.com", phone: "+1 555-0102", address: "88 Blossom Rd, Austin TX", category: "Decor", createdAt: iso(now) },
    { id: "v3", name: "Elegance Rentals", contactPerson: "Tom Hardy", email: "rent@elegance.com", phone: "+1 555-0103", address: "12 Warehouse Blvd, Dallas TX", category: "Furniture", createdAt: iso(now) },
    { id: "v4", name: "StagePro AV", contactPerson: "Lena Wu", email: "info@stagepro.com", phone: "+1 555-0104", address: "500 Sound St, Houston TX", category: "Equipment", createdAt: iso(now) },
    { id: "v5", name: "Crystal Finery Supply", contactPerson: "Bob Lee", email: "orders@crystalfinery.com", phone: "+1 555-0105", address: "7 Shine Ln, Austin TX", category: "Tableware", createdAt: iso(now) },
  ],
  items: [
    { id: "i1", name: "Gold Candelabra 24\"", sku: "DEC-CDL-024", categoryId: "c1", description: "Tall gold candelabra centerpiece", quantity: 60, location: "Warehouse A — Shelf 3", condition: "excellent", unitCost: 85, vendorId: "v2", lowStockThreshold: 15, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i2", name: "Glass Cylinder Vase 12\"", sku: "DEC-VAS-012", categoryId: "c1", description: "Clear cylinder vase for florals", quantity: 200, location: "Warehouse A — Shelf 1", condition: "good", unitCost: 12, vendorId: "v2", lowStockThreshold: 50, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i3", name: "Ivory Chiffon Drape Panel", sku: "DEC-DRP-IVY", categoryId: "c1", description: "10ft chiffon drape panel", quantity: 120, location: "Warehouse B — Rack 2", condition: "good", unitCost: 35, vendorId: "v2", lowStockThreshold: 30, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i4", name: "String Light Bistro 100ft", sku: "LGT-STR-100", categoryId: "c2", description: "Warm white bistro string lights", quantity: 80, location: "Warehouse B — Bin 5", condition: "excellent", unitCost: 45, vendorId: "v1", lowStockThreshold: 20, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i5", name: "LED Uplight RGB Par", sku: "LGT-LED-PAR", categoryId: "c2", description: "Wireless DMX uplight", quantity: 100, location: "Warehouse C — Case 1", condition: "excellent", unitCost: 120, vendorId: "v1", lowStockThreshold: 25, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i6", name: "Moving Head Spot 150W", sku: "LGT-MVH-150", categoryId: "c2", description: "DMX moving head spotlight", quantity: 24, location: "Warehouse C — Case 3", condition: "good", unitCost: 450, vendorId: "v1", lowStockThreshold: 6, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i7", name: "Round Banquet Table 60\"", sku: "FRN-TBL-060", categoryId: "c3", description: "60 inch round banquet table", quantity: 150, location: "Warehouse D — Stack 1", condition: "good", unitCost: 90, vendorId: "v3", lowStockThreshold: 40, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i8", name: "Chiavari Chair Gold", sku: "FRN-CHR-CHV", categoryId: "c3", description: "Gold chiavari chair with cushion", quantity: 600, location: "Warehouse D — Stack 2-4", condition: "good", unitCost: 40, vendorId: "v3", lowStockThreshold: 150, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i9", name: "Velvet Lounge Sofa", sku: "FRN-SOF-VLV", categoryId: "c3", description: "Emerald velvet lounge sofa", quantity: 12, location: "Warehouse D — Lounge Zone", condition: "excellent", unitCost: 320, vendorId: "v3", lowStockThreshold: 4, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i10", name: "Circular Floral Arch", sku: "PRP-ARC-CIR", categoryId: "c4", description: "8ft circular ceremony arch", quantity: 6, location: "Warehouse B — Rack 8", condition: "good", unitCost: 280, vendorId: "v2", lowStockThreshold: 2, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i11", name: "Sequin Backdrop Gold 10x8", sku: "PRP-BDP-SEQ", categoryId: "c4", description: "Gold sequin photo backdrop", quantity: 10, location: "Warehouse B — Rack 6", condition: "fair", unitCost: 150, vendorId: "v3", lowStockThreshold: 3, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i12", name: "Portable PA Speaker", sku: "EQP-PA-450", categoryId: "c5", description: "450W active PA speaker", quantity: 16, location: "Warehouse C — Case 7", condition: "excellent", unitCost: 380, vendorId: "v4", lowStockThreshold: 4, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i13", name: "Truss Section 2.5m", sku: "EQP-TRS-250", categoryId: "c5", description: "Aluminium lighting truss", quantity: 40, location: "Warehouse C — Rack 1", condition: "good", unitCost: 95, vendorId: "v4", lowStockThreshold: 10, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i14", name: "Crystal Champagne Flute", sku: "TBL-FLT-CHM", categoryId: "c6", description: "Crystal champagne flute", quantity: 500, location: "Warehouse A — Shelf 5", condition: "excellent", unitCost: 6, vendorId: "v5", lowStockThreshold: 120, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i15", name: "Gold Rim Dinner Plate", sku: "TBL-PLT-GRM", categoryId: "c6", description: "12\" gold rim porcelain plate", quantity: 400, location: "Warehouse A — Shelf 4", condition: "good", unitCost: 9, vendorId: "v5", lowStockThreshold: 100, createdAt: iso(now), updatedAt: iso(now) },
    { id: "i16", name: "Vintage Brass Lantern", sku: "DEC-LNT-VTG", categoryId: "c1", description: "Hanging brass lantern", quantity: 30, location: "Warehouse A — Shelf 2", condition: "fair", unitCost: 55, vendorId: "v2", lowStockThreshold: 10, createdAt: iso(now), updatedAt: iso(now) },
  ],
  movements: [
    { id: "m1", itemId: "i5", type: "in", quantity: 100, date: daysFromNow(-30), note: "Initial purchase — Luminosa Lighting", reference: "PO-1001", userId: "u1" },
    { id: "m2", itemId: "i8", type: "in", quantity: 600, date: daysFromNow(-28), note: "Initial purchase — Elegance Rentals", reference: "PO-1002", userId: "u1" },
    { id: "m3", itemId: "i8", type: "out", quantity: 24, date: daysFromNow(-6), note: "Damaged in transit — written off", reference: "WR-001", userId: "u2" },
    { id: "m4", itemId: "i14", type: "in", quantity: 500, date: daysFromNow(-25), note: "Restock — Crystal Finery", reference: "PO-1003", userId: "u1" },
    { id: "m5", itemId: "i4", type: "in", quantity: 80, date: daysFromNow(-20), note: "Initial purchase", reference: "PO-1004", userId: "u1" },
    { id: "m6", itemId: "i1", type: "in", quantity: 60, date: daysFromNow(-22), note: "Initial purchase", reference: "PO-1005", userId: "u1" },
    { id: "m7", itemId: "i7", type: "in", quantity: 150, date: daysFromNow(-18), note: "Initial purchase", reference: "PO-1006", userId: "u1" },
    { id: "m8", itemId: "i15", type: "adjustment", quantity: 400, date: daysFromNow(-4), note: "Stock count reconciliation", reference: "ADJ-001", userId: "u2" },
  ],
  events: [
    {
      id: "e1",
      name: "Thompson Garden Wedding",
      client: "Emily & David Thompson",
      date: daysFromNow(14),
      endDate: daysFromNow(15),
      venue: "Riverside Botanical Gardens",
      status: "allocated",
      notes: "Outdoor ceremony + reception for 180 guests",
      items: [
        { itemId: "i8", quantity: 120, returned: 0 },
        { itemId: "i5", quantity: 24, returned: 0 },
        { itemId: "i7", quantity: 20, returned: 0 },
        { itemId: "i4", quantity: 12, returned: 0 },
      ],
      createdAt: iso(now),
    },
    {
      id: "e2",
      name: "Patel Engagement Soirée",
      client: "Ananya & Raj Patel",
      date: daysFromNow(7),
      venue: "The Grand Ballroom, Downtown",
      status: "reserved",
      notes: "Elegant indoor engagement, 120 guests",
      items: [
        { itemId: "i1", quantity: 18, returned: 0 },
        { itemId: "i4", quantity: 16, returned: 0 },
        { itemId: "i16", quantity: 18, returned: 0 },
        { itemId: "i15", quantity: 120, returned: 0 },
      ],
      createdAt: iso(now),
    },
    {
      id: "e3",
      name: "Aurora Corporate Gala",
      client: "Aurora Technologies Inc.",
      date: daysFromNow(21),
      venue: "Skyline Convention Center",
      status: "planning",
      notes: "Annual gala for 400 attendees",
      items: [
        { itemId: "i13", quantity: 8, returned: 0 },
        { itemId: "i6", quantity: 8, returned: 0 },
      ],
      createdAt: iso(now),
    },
    {
      id: "e4",
      name: "Garcia Quinceañera",
      client: "Sofia Garcia",
      date: daysFromNow(-12),
      venue: "Casa Linda Hacienda",
      status: "completed",
      notes: "Quinceañera celebration, 200 guests",
      items: [
        { itemId: "i8", quantity: 200, returned: 200 },
        { itemId: "i5", quantity: 16, returned: 16 },
        { itemId: "i11", quantity: 4, returned: 4 },
      ],
      createdAt: iso(now),
    },
  ],
};
