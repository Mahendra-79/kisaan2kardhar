import fs from 'fs';
import path from 'path';
import {
  User,
  ProduceListing,
  FpoMember,
  FpoAggregation,
  Order,
  BuyerRequirement,
  LogisticsProvider,
  MarketPrice,
  DemandPrediction,
  AppNotification
} from './types';

export function calculateLogisticsCharge(distanceKm: number): number {
  if (distanceKm <= 3) return 20;
  if (distanceKm <= 5) return 30;
  if (distanceKm <= 10) return 50;
  if (distanceKm <= 15) return 80;
  return 100;
}

export interface DbSchema {
  users: User[];
  produceListings: ProduceListing[];
  fpoMembers: FpoMember[];
  orders: Order[];
  buyerRequirements: BuyerRequirement[];
  logisticsProviders: LogisticsProvider[];
  marketPrices: MarketPrice[];
  demandPredictions: DemandPrediction[];
  notifications: AppNotification[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'store.json');

const INITIAL_DATA: DbSchema = {
  users: [
    {
      id: 'farmer-1',
      email: 'farmer@kisaan.com',
      name: 'Ramesh Reddy',
      role: 'farmer',
      phone: '+91 98480 12345',
      address: 'Plot 14, Santhanuthalapadu Road',
      location: 'Ongole, Andhra Pradesh'
    },
    {
      id: 'fpo-1',
      email: 'fpo@kisaan.com',
      name: 'Prakasam Rythu Mitra FPO',
      role: 'fpo',
      phone: '+91 98480 23456',
      address: 'APMC Market Yard Complex',
      location: 'Ongole, Andhra Pradesh',
      fpoName: 'Prakasam Rythu Mitra Farmer Producer Co.'
    },
    {
      id: 'cust-1',
      email: 'customer@kisaan.com',
      name: 'Priya Sharma',
      role: 'customer',
      phone: '+91 98480 34567',
      address: 'Flat 402, Green Meadows, Trunk Road',
      location: 'Ongole, Andhra Pradesh'
    },
    {
      id: 'bulk-1',
      email: 'bulkbuyer@kisaan.com',
      name: 'Ananya Foods & Agro Processing',
      role: 'bulkBuyer',
      phone: '+91 98480 45678',
      address: 'Industrial Estate, Cherlapally',
      location: 'Hyderabad, Telangana'
    },
    {
      id: 'logistics-1',
      email: 'logistics@kisaan.com',
      name: 'Suresh Express Logistics',
      role: 'logisticsProvider',
      phone: '+91 98480 56789',
      address: 'Transport Nagar, NH 16 Bypass',
      location: 'Ongole Hub, Andhra Pradesh',
      vehicleType: 'Mini Truck',
      vehicleNumber: 'AP 27 XY 1024'
    },
    {
      id: 'admin-1',
      email: 'admin@kisaan2karidhar.gov.in',
      name: 'Central Admin Controller',
      role: 'admin',
      phone: '+91 98480 99999',
      address: 'State Agri Center',
      location: 'Ongole Central'
    }
  ],
  produceListings: [
    {
      id: 'prod-1',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Reddy',
      farmerPhone: '+91 98480 12345',
      product: 'Tomato',
      quantity: 450,
      unit: 'kg',
      grade: 'Grade A',
      askingPrice: 28,
      expectedHarvestDate: '2026-09-12',
      farmAddress: 'Plot 14, Santhanuthalapadu Road, Ongole',
      pickupLocation: 'Ongole South Gate',
      availability: 'Available',
      distanceKm: 2.4,
      coordinates: { lat: 15.5057, lng: 80.0499 },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-2',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Reddy',
      farmerPhone: '+91 98480 12345',
      product: 'Tomato',
      quantity: 600,
      unit: 'kg',
      grade: 'Grade B',
      askingPrice: 22,
      expectedHarvestDate: '2026-09-14',
      farmAddress: 'Kandukur Road Farm 2',
      pickupLocation: 'Kandukur Junction, Ongole',
      availability: 'Available',
      distanceKm: 4.2,
      coordinates: { lat: 15.4857, lng: 80.0321 },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-3',
      farmerId: 'farmer-2',
      farmerName: 'Koteswara Rao',
      farmerPhone: '+91 98480 67890',
      product: 'Potato',
      quantity: 1200,
      unit: 'kg',
      grade: 'Grade A',
      askingPrice: 26,
      expectedHarvestDate: '2026-09-15',
      farmAddress: 'Santhanuthalapadu Village',
      pickupLocation: 'SN Padu Market Point',
      availability: 'Available',
      distanceKm: 7.8,
      coordinates: { lat: 15.5678, lng: 80.0123 },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-4',
      farmerId: 'farmer-3',
      farmerName: 'Subba Reddy',
      farmerPhone: '+91 98480 78901',
      product: 'Onion',
      quantity: 800,
      unit: 'kg',
      grade: 'Grade A',
      askingPrice: 32,
      expectedHarvestDate: '2026-09-18',
      farmAddress: 'Tangutur Agro Lands',
      pickupLocation: 'Tangutur Highway Hub',
      availability: 'Available',
      distanceKm: 12.5,
      coordinates: { lat: 15.4211, lng: 80.0456 },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-5',
      farmerId: 'farmer-4',
      farmerName: 'Venkaiah Chowdary',
      farmerPhone: '+91 98480 89012',
      product: 'Chilli',
      quantity: 500,
      unit: 'kg',
      grade: 'Grade A',
      askingPrice: 185,
      expectedHarvestDate: '2026-09-20',
      farmAddress: 'Guntur Rural Spice Belt',
      pickupLocation: 'Mirchi Yard Gate 3, Guntur',
      availability: 'Available',
      distanceKm: 26.0,
      coordinates: { lat: 16.3067, lng: 80.4365 },
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-6',
      farmerId: 'farmer-5',
      farmerName: 'Gopala Krishna',
      farmerPhone: '+91 98480 90123',
      product: 'Rice',
      quantity: 5000,
      unit: 'kg',
      grade: 'Grade A',
      askingPrice: 54,
      expectedHarvestDate: '2026-09-25',
      farmAddress: 'Bapatla Paddy Fields',
      pickupLocation: 'Bapatla Rice Mill Road',
      availability: 'Available',
      distanceKm: 38.0,
      coordinates: { lat: 15.9042, lng: 80.4674 },
      createdAt: new Date().toISOString()
    }
  ],
  fpoMembers: [
    {
      id: 'mem-1',
      fpoId: 'fpo-1',
      farmerName: 'Farmer A (Rama Rao)',
      phone: '+91 98481 11111',
      village: 'Santhanuthalapadu',
      crop: 'Tomato',
      quantityKg: 1000,
      grade: 'Grade A'
    },
    {
      id: 'mem-2',
      fpoId: 'fpo-1',
      farmerName: 'Farmer B (Venkat Reddy)',
      phone: '+91 98481 22222',
      village: 'Maddipadu',
      crop: 'Tomato',
      quantityKg: 1500,
      grade: 'Grade A'
    },
    {
      id: 'mem-3',
      fpoId: 'fpo-1',
      farmerName: 'Farmer C (Srinivas)',
      phone: '+91 98481 33333',
      village: 'Naguluppalapadu',
      crop: 'Tomato',
      quantityKg: 2500,
      grade: 'Grade A'
    },
    {
      id: 'mem-4',
      fpoId: 'fpo-1',
      farmerName: 'Farmer D (Narayana)',
      phone: '+91 98481 44444',
      village: 'Tangutur',
      crop: 'Chilli',
      quantityKg: 1200,
      grade: 'Grade A'
    },
    {
      id: 'mem-5',
      fpoId: 'fpo-1',
      farmerName: 'Farmer E (Krishna Murthy)',
      phone: '+91 98481 55555',
      village: 'Kandukur',
      crop: 'Maize',
      quantityKg: 3000,
      grade: 'Grade B'
    }
  ],
  orders: [
    {
      id: 'K2K1024',
      customerId: 'cust-1',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98480 34567',
      customerAddress: 'Flat 402, Green Meadows, Trunk Road',
      customerDeliveryLocation: 'Ongole Central',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Reddy',
      farmerPhone: '+91 98480 12345',
      farmerAddress: 'Plot 14, Santhanuthalapadu Road',
      farmerPickupLocation: 'Ongole South Gate',
      productId: 'prod-1',
      productName: 'Tomato',
      grade: 'Grade A',
      quantity: 2,
      unit: 'kg',
      pricePerUnit: 28,
      productAmount: 56,
      distanceKm: 8.0,
      logisticsCharge: 50,
      totalAmount: 106,
      paymentMethod: 'UPI',
      paymentStatus: 'SUCCESS',
      orderStatus: 'ASSIGNED',
      assignedLogisticsId: 'logistics-1',
      assignedLogisticsName: 'Suresh Express Logistics',
      assignedLogisticsPhone: '+91 98480 56789',
      assignedVehicleType: 'Mini Truck',
      vehicleNumber: 'AP 27 XY 1024',
      estimatedTravelMinutes: 22,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Order placed by customer' },
        { status: 'ASSIGNED', timestamp: new Date(Date.now() - 1800000).toISOString(), note: 'Assigned to Suresh Express Logistics' }
      ]
    },
    {
      id: 'K2K1020',
      customerId: 'cust-1',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98480 34567',
      customerAddress: 'Flat 402, Green Meadows, Trunk Road',
      customerDeliveryLocation: 'Ongole Central',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Reddy',
      farmerPhone: '+91 98480 12345',
      farmerAddress: 'Plot 14, Santhanuthalapadu Road',
      farmerPickupLocation: 'Ongole South Gate',
      productId: 'prod-1',
      productName: 'Tomato',
      grade: 'Grade A',
      quantity: 5,
      unit: 'kg',
      pricePerUnit: 28,
      productAmount: 140,
      distanceKm: 3.5,
      logisticsCharge: 30,
      totalAmount: 170,
      paymentMethod: 'Google Pay',
      paymentStatus: 'SUCCESS',
      orderStatus: 'DELIVERED',
      assignedLogisticsId: 'logistics-1',
      assignedLogisticsName: 'Suresh Express Logistics',
      assignedLogisticsPhone: '+91 98480 56789',
      assignedVehicleType: 'Mini Truck',
      vehicleNumber: 'AP 27 XY 1024',
      estimatedTravelMinutes: 15,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 72000000).toISOString(),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { status: 'ACCEPTED', timestamp: new Date(Date.now() - 82000000).toISOString() },
        { status: 'PICKED_UP', timestamp: new Date(Date.now() - 78000000).toISOString() },
        { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 75000000).toISOString() },
        { status: 'DELIVERED', timestamp: new Date(Date.now() - 72000000).toISOString(), note: 'Delivered securely to customer' }
      ]
    }
  ],
  buyerRequirements: [
    {
      id: 'req-1',
      buyerId: 'bulk-1',
      buyerName: 'Ananya Foods & Agro Processing',
      buyerPhone: '+91 98480 45678',
      product: 'Tomato',
      quantity: 5000,
      unit: 'kg',
      qualityGrade: 'Grade A',
      maxPricePerUnit: 30,
      requiredDate: '2026-09-18',
      deliveryLocation: 'Hyderabad Hub',
      deadline: '2026-09-15',
      specialRequirements: 'Uniform ripeness, firm skin, suitable for paste and puree processing',
      status: 'MATCHED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req-2',
      buyerId: 'bulk-1',
      buyerName: 'Ananya Foods & Agro Processing',
      buyerPhone: '+91 98480 45678',
      product: 'Chilli',
      quantity: 2000,
      unit: 'kg',
      qualityGrade: 'Grade A',
      maxPricePerUnit: 190,
      requiredDate: '2026-09-22',
      deliveryLocation: 'Guntur Spice Center',
      deadline: '2026-09-19',
      specialRequirements: 'Low moisture, high pungency, export quality',
      status: 'OPEN',
      createdAt: new Date().toISOString()
    }
  ],
  logisticsProviders: [
    {
      id: 'logistics-1',
      userId: 'logistics-1',
      name: 'Suresh Express Logistics',
      phone: '+91 98480 56789',
      email: 'logistics@kisaan.com',
      address: 'Transport Nagar, NH 16 Bypass, Ongole',
      vehicleType: 'Mini Truck',
      vehicleNumber: 'AP 27 XY 1024',
      availability: true,
      completedOrders: 24,
      totalEarnings: 12450
    },
    {
      id: 'logistics-2',
      userId: 'logistics-2',
      name: 'Kavitha Coastal Transport',
      phone: '+91 98480 67123',
      email: 'kavitha.logistics@kisaan.com',
      address: 'Bypass Cross, Ongole',
      vehicleType: 'Pickup Truck',
      vehicleNumber: 'AP 27 Z 5588',
      availability: true,
      completedOrders: 18,
      totalEarnings: 9350
    },
    {
      id: 'logistics-3',
      userId: 'logistics-3',
      name: 'Prakasam Cold Chain Fleet',
      phone: '+91 98480 88990',
      email: 'coldchain@kisaan.com',
      address: 'Industrial Area, Ongole',
      vehicleType: 'Refrigerated Vehicle',
      vehicleNumber: 'AP 27 TC 9900',
      availability: true,
      completedOrders: 12,
      totalEarnings: 16800
    }
  ],
  marketPrices: [
    {
      id: 'mp-1',
      product: 'Tomato',
      currentPrice: 28,
      historicalPrice: 24,
      priceDifference: 4,
      marketLocation: 'Ongole APMC Yard',
      date: '2026-09-10',
      unit: '₹/kg'
    },
    {
      id: 'mp-2',
      product: 'Potato',
      currentPrice: 26,
      historicalPrice: 25,
      priceDifference: 1,
      marketLocation: 'Kurnool APMC Yard',
      date: '2026-09-10',
      unit: '₹/kg'
    },
    {
      id: 'mp-3',
      product: 'Onion',
      currentPrice: 32,
      historicalPrice: 35,
      priceDifference: -3,
      marketLocation: 'Guntur Vegetable Market',
      date: '2026-09-10',
      unit: '₹/kg'
    },
    {
      id: 'mp-4',
      product: 'Chilli',
      currentPrice: 185,
      historicalPrice: 175,
      priceDifference: 10,
      marketLocation: 'Guntur Mirchi Yard',
      date: '2026-09-10',
      unit: '₹/kg'
    },
    {
      id: 'mp-5',
      product: 'Rice',
      currentPrice: 54,
      historicalPrice: 52,
      priceDifference: 2,
      marketLocation: 'Tenali Grain Market',
      date: '2026-09-10',
      unit: '₹/kg'
    },
    {
      id: 'mp-6',
      product: 'Cotton',
      currentPrice: 72,
      historicalPrice: 70,
      priceDifference: 2,
      marketLocation: 'Adilabad Cotton Market',
      date: '2026-09-10',
      unit: '₹/kg'
    },
    {
      id: 'mp-7',
      product: 'Maize',
      currentPrice: 22,
      historicalPrice: 21,
      priceDifference: 1,
      marketLocation: 'Nizamabad Market',
      date: '2026-09-10',
      unit: '₹/kg'
    }
  ],
  demandPredictions: [
    {
      id: 'dp-1',
      product: 'Tomato',
      currentDemand: 'High',
      predictedDemandChange: '+18%',
      demandLevel: 'High',
      recommendation: 'Tomato demand is expected to increase next week. Consider listing Grade A tomatoes at ₹28–₹30/kg.',
      confidenceScore: 92
    },
    {
      id: 'dp-2',
      product: 'Onion',
      currentDemand: 'Medium',
      predictedDemandChange: '+5%',
      demandLevel: 'Medium',
      recommendation: 'Onion supply is stabilizing across coastal regions. Keep asking prices competitive around ₹30–₹33/kg.',
      confidenceScore: 86
    },
    {
      id: 'dp-3',
      product: 'Chilli',
      currentDemand: 'High',
      predictedDemandChange: '+24%',
      demandLevel: 'High',
      recommendation: 'Export inquiries are surging for Grade A Teja chillies. High margins available for bulk aggregation.',
      confidenceScore: 95
    },
    {
      id: 'dp-4',
      product: 'Potato',
      currentDemand: 'Medium',
      predictedDemandChange: '+2%',
      demandLevel: 'Medium',
      recommendation: 'Steady retail consumption. Excellent window for cold-storage release in small lots.',
      confidenceScore: 88
    },
    {
      id: 'dp-5',
      product: 'Rice',
      currentDemand: 'High',
      predictedDemandChange: '+12%',
      demandLevel: 'High',
      recommendation: 'Festive season bulk orders starting. Coordinate with FPOs for aggregated transport.',
      confidenceScore: 90
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'farmer-1',
      userRole: 'farmer',
      title: 'New Order Received',
      message: 'Your Tomato listing received a 2 kg order K2K1024.',
      read: false,
      timestamp: new Date().toISOString(),
      orderId: 'K2K1024'
    },
    {
      id: 'notif-2',
      userId: 'logistics-1',
      userRole: 'logisticsProvider',
      title: 'New Delivery Assigned',
      message: 'Order K2K1024 has been assigned to your vehicle (Mini Truck AP 27 XY 1024).',
      read: false,
      timestamp: new Date().toISOString(),
      orderId: 'K2K1024'
    },
    {
      id: 'notif-3',
      userId: 'cust-1',
      userRole: 'customer',
      title: 'Order Delivered',
      message: 'Your previous order K2K1020 has been delivered successfully.',
      read: true,
      timestamp: new Date(Date.now() - 72000000).toISOString(),
      orderId: 'K2K1020'
    },
    {
      id: 'notif-4',
      userId: 'admin-1',
      userRole: 'admin',
      title: 'Platform Activity',
      message: 'Order K2K1020 has been delivered. Logistics payout ₹30 processed.',
      read: true,
      timestamp: new Date(Date.now() - 72000000).toISOString(),
      orderId: 'K2K1020'
    }
  ]
};

class Database {
  private data: DbSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DbSchema {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Could not read store.json, using seed data:', err);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DbSchema) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to store.json:', err);
    }
  }

  public getData(): DbSchema {
    return this.data;
  }

  public persist() {
    this.saveData(this.data);
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  // Produce listings
  public getProduceListings(): ProduceListing[] {
    return this.data.produceListings;
  }

  public getProduceById(id: string): ProduceListing | undefined {
    return this.data.produceListings.find(p => p.id === id);
  }

  public addProduceListing(listing: ProduceListing): ProduceListing {
    this.data.produceListings.unshift(listing);
    this.persist();
    return listing;
  }

  public updateProduceListing(id: string, updates: Partial<ProduceListing>): ProduceListing | undefined {
    const idx = this.data.produceListings.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.produceListings[idx] = { ...this.data.produceListings[idx], ...updates };
    this.persist();
    return this.data.produceListings[idx];
  }

  public deleteProduceListing(id: string): boolean {
    const initialLen = this.data.produceListings.length;
    this.data.produceListings = this.data.produceListings.filter(p => p.id !== id);
    const deleted = this.data.produceListings.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // FPO Members & Aggregations
  public getFpoMembers(fpoId?: string): FpoMember[] {
    if (fpoId) {
      return this.data.fpoMembers.filter(m => m.fpoId === fpoId);
    }
    return this.data.fpoMembers;
  }

  public addFpoMember(member: FpoMember): FpoMember {
    this.data.fpoMembers.push(member);
    this.persist();
    return member;
  }

  public getFpoAggregations(fpoId: string): FpoAggregation[] {
    const members = this.getFpoMembers(fpoId);
    const cropMap = new Map<string, { members: { name: string; quantityKg: number; village: string; grade: string }[]; total: number }>();

    for (const m of members) {
      const existing = cropMap.get(m.crop) || { members: [], total: 0 };
      existing.members.push({ name: m.farmerName, quantityKg: m.quantityKg, village: m.village, grade: m.grade });
      existing.total += m.quantityKg;
      cropMap.set(m.crop, existing);
    }

    const aggregations: FpoAggregation[] = [];
    cropMap.forEach((val, crop) => {
      aggregations.push({
        crop,
        totalQuantityKg: val.total,
        memberCount: val.members.length,
        members: val.members,
        askingPricePerKg: crop === 'Tomato' ? 28 : crop === 'Chilli' ? 180 : 25,
        fpoName: 'Prakasam Rythu Mitra FPO'
      });
    });

    return aggregations;
  }

  // Orders
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    
    // Add notification for Farmer
    this.addNotification({
      id: `notif-${Date.now()}-1`,
      userId: order.farmerId,
      userRole: 'farmer',
      title: 'New Order Received',
      message: `Received ${order.quantity} ${order.unit} order for ${order.productName} (Order #${order.id}).`,
      read: false,
      timestamp: new Date().toISOString(),
      orderId: order.id
    });

    // Add notification for Customer
    this.addNotification({
      id: `notif-${Date.now()}-2`,
      userId: order.customerId,
      userRole: 'customer',
      title: 'Order Placed Successfully',
      message: `Your order #${order.id} for ${order.quantity} ${order.unit} ${order.productName} is placed.`,
      read: false,
      timestamp: new Date().toISOString(),
      orderId: order.id
    });

    // Notify logistics if assigned
    if (order.assignedLogisticsId) {
      this.addNotification({
        id: `notif-${Date.now()}-3`,
        userId: order.assignedLogisticsId,
        userRole: 'logisticsProvider',
        title: 'New Delivery Assigned',
        message: `New delivery #${order.id} from ${order.farmerPickupLocation} to ${order.customerDeliveryLocation}.`,
        read: false,
        timestamp: new Date().toISOString(),
        orderId: order.id
      });
    }

    // Notify admin
    this.addNotification({
      id: `notif-${Date.now()}-4`,
      userId: 'admin-1',
      userRole: 'admin',
      title: 'New Order Created',
      message: `Order #${order.id} placed. Value: ₹${order.totalAmount} (Logistics: ₹${order.logisticsCharge}).`,
      read: false,
      timestamp: new Date().toISOString(),
      orderId: order.id
    });

    this.persist();
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    status: Order['orderStatus'],
    actorRole: string,
    note?: string
  ): Order | undefined {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return undefined;

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status} by ${actorRole}`
    });

    // Handle delivery completion earnings update
    if (status === 'DELIVERED' && previousStatus !== 'DELIVERED') {
      if (order.assignedLogisticsId) {
        const prov = this.data.logisticsProviders.find(p => p.id === order.assignedLogisticsId || p.userId === order.assignedLogisticsId);
        if (prov) {
          prov.completedOrders += 1;
          prov.totalEarnings += order.logisticsCharge;
        }
      }

      // Notifications on delivery
      this.addNotification({
        id: `notif-${Date.now()}-deliv-cust`,
        userId: order.customerId,
        userRole: 'customer',
        title: 'Order Delivered!',
        message: `Your order #${order.id} (${order.productName}) has been delivered successfully.`,
        read: false,
        timestamp: new Date().toISOString(),
        orderId: order.id
      });

      this.addNotification({
        id: `notif-${Date.now()}-deliv-farm`,
        userId: order.farmerId,
        userRole: 'farmer',
        title: 'Delivery Completed',
        message: `Order #${order.id} has been delivered. Payout ₹${order.productAmount} credited.`,
        read: false,
        timestamp: new Date().toISOString(),
        orderId: order.id
      });

      this.addNotification({
        id: `notif-${Date.now()}-deliv-admin`,
        userId: 'admin-1',
        userRole: 'admin',
        title: 'Order Delivered',
        message: `Order #${order.id} delivered. Logistics charge ₹${order.logisticsCharge} released.`,
        read: false,
        timestamp: new Date().toISOString(),
        orderId: order.id
      });
    }

    if (status === 'ACCEPTED') {
      this.addNotification({
        id: `notif-${Date.now()}-acc-cust`,
        userId: order.customerId,
        userRole: 'customer',
        title: 'Logistics Partner Assigned',
        message: `${order.assignedLogisticsName || 'Logistics Partner'} has accepted delivery for order #${order.id}.`,
        read: false,
        timestamp: new Date().toISOString(),
        orderId: order.id
      });
    }

    this.persist();
    return order;
  }

  // Buyer Requirements & Matching
  public getBuyerRequirements(): BuyerRequirement[] {
    return this.data.buyerRequirements;
  }

  public addBuyerRequirement(req: BuyerRequirement): BuyerRequirement {
    this.data.buyerRequirements.unshift(req);
    this.persist();
    return req;
  }

  public getMatchesForRequirement(reqId: string) {
    const req = this.data.buyerRequirements.find(r => r.id === reqId);
    if (!req) return [];

    // Transparent matching score as specified in prompt:
    // Product compatibility = 30%
    // Quantity = 25%
    // Price = 20%
    // Quality = 15%
    // Distance = 10%
    const results: any[] = [];

    // Match with FPO aggregations
    const fpoAggs = this.getFpoAggregations('fpo-1');
    for (const agg of fpoAggs) {
      if (agg.crop.toLowerCase() === req.product.toLowerCase()) {
        const prodScore = 30;
        const qtyScore = Math.min(25, (agg.totalQuantityKg / req.quantity) * 25);
        const priceScore = agg.askingPricePerKg <= req.maxPricePerUnit ? 20 : Math.max(0, 20 - ((agg.askingPricePerKg - req.maxPricePerUnit) / req.maxPricePerUnit) * 20);
        const qualityScore = 15;
        const distanceScore = 8; // approx 15 km
        const totalScore = Math.round(prodScore + qtyScore + priceScore + qualityScore + distanceScore);

        results.push({
          supplierType: 'FPO',
          supplierId: 'fpo-1',
          supplierName: agg.fpoName,
          crop: agg.crop,
          quantityAvailable: agg.totalQuantityKg,
          unit: 'kg',
          pricePerUnit: agg.askingPricePerKg,
          quality: 'Grade A',
          distanceKm: 14.5,
          estimatedLogisticsCost: calculateLogisticsCharge(14.5) * (agg.totalQuantityKg / 100),
          matchScore: totalScore,
          scoreBreakdown: {
            productCompatibility: prodScore,
            quantity: Math.round(qtyScore),
            price: Math.round(priceScore),
            quality: qualityScore,
            distance: distanceScore
          },
          memberCount: agg.memberCount
        });
      }
    }

    // Match with individual farmers
    for (const listing of this.data.produceListings) {
      if (listing.product.toLowerCase() === req.product.toLowerCase() && listing.availability === 'Available') {
        const prodScore = 30;
        const qtyScore = Math.min(25, (listing.quantity / req.quantity) * 25);
        const priceScore = listing.askingPrice <= req.maxPricePerUnit ? 20 : Math.max(0, 20 - ((listing.askingPrice - req.maxPricePerUnit) / req.maxPricePerUnit) * 20);
        const qualityScore = listing.grade === req.qualityGrade ? 15 : 10;
        const dist = listing.distanceKm || 10;
        const distanceScore = dist <= 5 ? 10 : dist <= 15 ? 7 : 4;
        const totalScore = Math.round(prodScore + qtyScore + priceScore + qualityScore + distanceScore);

        results.push({
          supplierType: 'Farmer',
          supplierId: listing.farmerId,
          supplierName: listing.farmerName,
          crop: listing.product,
          quantityAvailable: listing.quantity,
          unit: listing.unit,
          pricePerUnit: listing.askingPrice,
          quality: listing.grade,
          distanceKm: dist,
          estimatedLogisticsCost: calculateLogisticsCharge(dist) * (listing.quantity / 100),
          matchScore: totalScore,
          scoreBreakdown: {
            productCompatibility: prodScore,
            quantity: Math.round(qtyScore),
            price: Math.round(priceScore),
            quality: qualityScore,
            distance: distanceScore
          }
        });
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Logistics
  public getLogisticsProviders(): LogisticsProvider[] {
    return this.data.logisticsProviders;
  }

  public getLogisticsProviderById(id: string): LogisticsProvider | undefined {
    return this.data.logisticsProviders.find(l => l.id === id || l.userId === id);
  }

  public updateLogisticsProvider(id: string, updates: Partial<LogisticsProvider>): LogisticsProvider | undefined {
    const idx = this.data.logisticsProviders.findIndex(l => l.id === id || l.userId === id);
    if (idx === -1) return undefined;
    this.data.logisticsProviders[idx] = { ...this.data.logisticsProviders[idx], ...updates };
    this.persist();
    return this.data.logisticsProviders[idx];
  }

  // Market Prices
  public getMarketPrices(): MarketPrice[] {
    return this.data.marketPrices;
  }

  // Demand predictions
  public getDemandPredictions(): DemandPrediction[] {
    return this.data.demandPredictions;
  }

  // Notifications
  public getNotifications(userId?: string, role?: string): AppNotification[] {
    return this.data.notifications.filter(n => {
      if (!userId && !role) return true;
      if (userId && n.userId === userId) return true;
      if (role && (n.userRole === role || n.userRole === 'all')) return true;
      return false;
    });
  }

  public addNotification(notification: AppNotification): AppNotification {
    this.data.notifications.unshift(notification);
    this.persist();
    return notification;
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.persist();
      return true;
    }
    return false;
  }
}

export const db = new Database();
