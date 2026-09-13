export type Role = 'farmer' | 'fpo' | 'customer' | 'bulkBuyer' | 'logisticsProvider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string;
  address: string;
  location: string;
  vehicleType?: string;
  vehicleNumber?: string;
  fpoName?: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  product: string;
  quantity: number;
  unit: string;
  grade: 'Grade A' | 'Grade B' | 'Grade C';
  askingPrice: number;
  expectedHarvestDate: string;
  farmAddress: string;
  pickupLocation: string;
  availability: 'Available' | 'Sold Out' | 'Harvesting Soon';
  imageUrl?: string;
  distanceKm?: number;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

export interface FpoMember {
  id: string;
  fpoId: string;
  farmerName: string;
  phone: string;
  village: string;
  crop: string;
  quantityKg: number;
  grade: string;
}

export interface FpoAggregation {
  crop: string;
  totalQuantityKg: number;
  memberCount: number;
  members: { name: string; quantityKg: number; village: string; grade: string }[];
  askingPricePerKg: number;
  fpoName: string;
}

export interface Order {
  id: string; // e.g. "K2K1024"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDeliveryLocation: string;
  
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAddress: string;
  farmerPickupLocation: string;
  
  productId: string;
  productName: string;
  grade: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  productAmount: number;
  
  distanceKm: number;
  logisticsCharge: number;
  totalAmount: number;
  
  paymentMethod: 'UPI' | 'Google Pay' | 'PhonePe' | 'Paytm' | 'Card';
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'PICKUP_STARTED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  
  assignedLogisticsId?: string;
  assignedLogisticsName?: string;
  assignedLogisticsPhone?: string;
  assignedVehicleType?: string;
  vehicleNumber?: string;
  estimatedTravelMinutes?: number;
  
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: string; timestamp: string; note?: string }[];
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  product: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  maxPricePerUnit: number;
  requiredDate: string;
  deliveryLocation: string;
  deadline: string;
  specialRequirements?: string;
  status: 'OPEN' | 'MATCHED' | 'FULFILLED';
  createdAt: string;
}

export interface LogisticsProvider {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  vehicleType: 'Bike' | 'Auto' | 'Mini Truck' | 'Pickup Truck' | 'Truck' | 'Refrigerated Vehicle';
  vehicleNumber: string;
  availability: boolean;
  completedOrders: number;
  totalEarnings: number;
}

export interface MarketPrice {
  id: string;
  product: string;
  currentPrice: number;
  historicalPrice: number;
  priceDifference: number;
  marketLocation: string;
  date: string;
  unit: string;
}

export interface DemandPrediction {
  id: string;
  product: string;
  currentDemand: 'High' | 'Medium' | 'Low';
  predictedDemandChange: string;
  demandLevel: string;
  recommendation: string;
  confidenceScore: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  userRole: Role | 'all';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  orderId?: string;
}
