export type Role = "admin" | "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export type Condition = "excellent" | "good" | "fair" | "damaged";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  // quantity = total owned stock (changed by stock movements).
  // availability is computed: quantity - outstanding event allocations.
  quantity: number;
  location: string;
  condition: Condition;
  unitCost: number;
  vendorId?: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = "in" | "out" | "adjustment";

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  date: string;
  note?: string;
  reference?: string;
  userId: string;
}

export type EventStatus =
  | "planning"
  | "reserved"
  | "allocated"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface EventItem {
  itemId: string;
  quantity: number;
  returned: number;
}

export interface Event {
  id: string;
  name: string;
  client: string;
  date: string;
  endDate?: string;
  venue: string;
  status: EventStatus;
  notes?: string;
  items: EventItem[];
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export interface AppData {
  users: User[];
  categories: Category[];
  items: InventoryItem[];
  movements: StockMovement[];
  events: Event[];
  vendors: Vendor[];
}
