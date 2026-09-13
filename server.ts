import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, calculateLogisticsCharge } from './server/db';
import { generateCropDemandForecast } from './server/gemini';
import { Order, ProduceListing, BuyerRequirement, FpoMember, Role } from './server/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Kisaan2Karidhar', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role, adminPassKey } = req.body;

    // Role-based security check for Admin
    if (role === 'admin') {
      const key = (adminPassKey || '').trim();
      if (key !== 'mahendra@123' && key.toLowerCase() !== 'syntax squad') {
        return res.status(401).json({ error: 'Invalid admin authentication key. Required: mahendra@123' });
      }
      let adminUser = db.getUsers().find(u => u.role === 'admin');
      if (!adminUser) {
        adminUser = {
          id: 'admin-1',
          email: 'admin@kisaan2karidhar.gov.in',
          name: 'Mahendra (Admin Controller)',
          role: 'admin',
          phone: '+91 98480 99999',
          address: 'Central Secretariat, AP Agri Board',
          location: 'Ongole Central'
        };
        db.addUser(adminUser);
      } else {
        adminUser.name = 'Mahendra (Admin Controller)';
        db.persist();
      }
      return res.json({ user: adminUser, token: 'mock-token-admin' });
    }

    // Normal or demo login for other roles
    const users = db.getUsers().filter(u => u.role === role);
    let user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

    // If not found by email, fallback to first demo user of that role
    if (!user && users.length > 0) {
      user = users[0];
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found for role' });
    }

    res.json({ user, token: `mock-token-${user.id}` });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, role, phone, address, location, vehicleType, vehicleNumber, fpoName } = req.body;

    if (!name || !email || !role || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'admin') {
      return res.status(403).json({ error: 'Cannot self-register as Admin' });
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role: role as Role,
      phone,
      address: address || 'Local Address',
      location: location || 'Ongole, Andhra Pradesh',
      vehicleType,
      vehicleNumber,
      fpoName
    };

    db.addUser(newUser);

    // If logistics provider, register in provider fleet
    if (role === 'logisticsProvider') {
      db.getData().logisticsProviders.push({
        id: newUser.id,
        userId: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        vehicleType: (vehicleType as any) || 'Mini Truck',
        vehicleNumber: vehicleNumber || 'AP 27 NEW 0001',
        availability: true,
        completedOrders: 0,
        totalEarnings: 0
      });
      db.persist();
    }

    res.status(201).json({ user: newUser, token: `mock-token-${newUser.id}` });
  });

  app.get('/api/auth/users', (req, res) => {
    res.json(db.getUsers());
  });

  app.put('/api/auth/profile/:id', (req, res) => {
    const { id } = req.params;
    const user = db.getUsers().find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { name, phone, address, location, vehicleType, vehicleNumber, fpoName } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (location) user.location = location;
    if (vehicleType) user.vehicleType = vehicleType;
    if (vehicleNumber) user.vehicleNumber = vehicleNumber;
    if (fpoName) user.fpoName = fpoName;

    db.persist();
    res.json({ user, message: 'Profile updated successfully' });
  });

  app.delete('/api/auth/users/:id', (req, res) => {
    const { id } = req.params;
    const users = db.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users.splice(idx, 1);
      db.persist();
      return res.json({ message: 'User removed successfully' });
    }
    res.status(404).json({ error: 'User not found' });
  });

  // ==========================================
  // PRODUCE LISTINGS (Farmer CRUD)
  // ==========================================
  app.get('/api/produce', (req, res) => {
    const { farmerId, product, maxDistance } = req.query;
    let listings = db.getProduceListings();

    if (farmerId) {
      listings = listings.filter(p => p.farmerId === farmerId);
    }
    if (product) {
      listings = listings.filter(p => p.product.toLowerCase().includes((product as string).toLowerCase()));
    }
    if (maxDistance) {
      const maxDist = parseFloat(maxDistance as string);
      listings = listings.filter(p => (p.distanceKm || 0) <= maxDist);
    }

    // Sort by distance (nearby farmers first)
    listings.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    res.json(listings);
  });

  app.post('/api/produce', (req, res) => {
    const {
      farmerId,
      farmerName,
      farmerPhone,
      product,
      quantity,
      unit,
      grade,
      askingPrice,
      expectedHarvestDate,
      farmAddress,
      pickupLocation,
      availability
    } = req.body;

    if (!product || !quantity || !askingPrice) {
      return res.status(400).json({ error: 'Product, quantity and asking price are required' });
    }

    const newListing: ProduceListing = {
      id: `prod-${Date.now()}`,
      farmerId: farmerId || 'farmer-1',
      farmerName: farmerName || 'Ramesh Reddy',
      farmerPhone: farmerPhone || '+91 98480 12345',
      product,
      quantity: Number(quantity),
      unit: unit || 'kg',
      grade: grade || 'Grade A',
      askingPrice: Number(askingPrice),
      expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      farmAddress: farmAddress || 'Ongole Farm Plot',
      pickupLocation: pickupLocation || 'Ongole South Gate',
      availability: availability || 'Available',
      distanceKm: Math.round((Math.random() * 8 + 1.5) * 10) / 10,
      coordinates: { lat: 15.5057 + (Math.random() - 0.5) * 0.05, lng: 80.0499 + (Math.random() - 0.5) * 0.05 },
      createdAt: new Date().toISOString()
    };

    const saved = db.addProduceListing(newListing);
    res.status(201).json(saved);
  });

  app.put('/api/produce/:id', (req, res) => {
    const updated = db.updateProduceListing(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Produce listing not found' });
    }
    res.json(updated);
  });

  app.delete('/api/produce/:id', (req, res) => {
    const success = db.deleteProduceListing(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Produce listing not found' });
    }
    res.json({ message: 'Produce listing deleted successfully' });
  });

  // ==========================================
  // ORDERS & LOGISTICS CHARGE CALCULATION
  // ==========================================
  app.get('/api/orders', (req, res) => {
    const { customerId, farmerId, logisticsId } = req.query;
    let orders = db.getOrders();

    if (customerId) {
      orders = orders.filter(o => o.customerId === customerId);
    } else if (farmerId) {
      orders = orders.filter(o => o.farmerId === farmerId);
    } else if (logisticsId) {
      orders = orders.filter(o => o.assignedLogisticsId === logisticsId);
    }

    res.json(orders);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // Calculate delivery charge utility endpoint
  app.post('/api/orders/calculate-charge', (req, res) => {
    const { distanceKm } = req.body;
    const dist = parseFloat(distanceKm || 0);
    const charge = calculateLogisticsCharge(dist);
    res.json({ distanceKm: dist, logisticsCharge: charge });
  });

  app.post('/api/orders', (req, res) => {
    const {
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      customerDeliveryLocation,
      productId,
      quantity,
      paymentMethod
    } = req.body;

    const produce = db.getProduceById(productId);
    if (!produce) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const distanceKm = produce.distanceKm || 4.5;
    const logisticsCharge = calculateLogisticsCharge(distanceKm);
    const productAmount = produce.askingPrice * qty;
    const totalAmount = productAmount + logisticsCharge;

    // Pick active logistics provider (default to Suresh Express Logistics)
    const activeProvider = db.getLogisticsProviders().find(p => p.availability) || db.getLogisticsProviders()[0];

    const orderId = `K2K${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customerId: customerId || 'cust-1',
      customerName: customerName || 'Priya Sharma',
      customerPhone: customerPhone || '+91 98480 34567',
      customerAddress: customerAddress || 'Flat 402, Green Meadows, Trunk Road',
      customerDeliveryLocation: customerDeliveryLocation || 'Ongole Central',

      farmerId: produce.farmerId,
      farmerName: produce.farmerName,
      farmerPhone: produce.farmerPhone,
      farmerAddress: produce.farmAddress,
      farmerPickupLocation: produce.pickupLocation,

      productId: produce.id,
      productName: produce.product,
      grade: produce.grade,
      quantity: qty,
      unit: produce.unit,
      pricePerUnit: produce.askingPrice,
      productAmount,

      distanceKm,
      logisticsCharge,
      totalAmount,

      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'SUCCESS',
      orderStatus: 'ASSIGNED',

      assignedLogisticsId: activeProvider ? activeProvider.id : 'logistics-1',
      assignedLogisticsName: activeProvider ? activeProvider.name : 'Suresh Express Logistics',
      assignedLogisticsPhone: activeProvider ? activeProvider.phone : '+91 98480 56789',
      assignedVehicleType: activeProvider ? activeProvider.vehicleType : 'Mini Truck',
      vehicleNumber: activeProvider ? activeProvider.vehicleNumber : 'AP 27 XY 1024',
      estimatedTravelMinutes: Math.round(distanceKm * 2.2 + 5),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date().toISOString(), note: 'Order created with successful mock payment' },
        { status: 'ASSIGNED', timestamp: new Date().toISOString(), note: `Assigned to ${activeProvider ? activeProvider.name : 'Logistics'}` }
      ]
    };

    const saved = db.createOrder(newOrder);

    // Reduce stock
    if (produce.quantity >= qty) {
      db.updateProduceListing(produce.id, {
        quantity: produce.quantity - qty,
        availability: produce.quantity - qty === 0 ? 'Sold Out' : 'Available'
      });
    }

    res.status(201).json(saved);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { status, actorRole, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = db.updateOrderStatus(req.params.id, status, actorRole || 'User', note);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updated);
  });

  // ==========================================
  // FPO AGGREGATION & MEMBER MANAGEMENT
  // ==========================================
  app.get('/api/fpo/members', (req, res) => {
    const { fpoId } = req.query;
    res.json(db.getFpoMembers(fpoId as string));
  });

  app.post('/api/fpo/members', (req, res) => {
    const { fpoId, farmerName, phone, village, crop, quantityKg, grade } = req.body;
    if (!farmerName || !crop || !quantityKg) {
      return res.status(400).json({ error: 'Missing required member fields' });
    }

    const newMember: FpoMember = {
      id: `mem-${Date.now()}`,
      fpoId: fpoId || 'fpo-1',
      farmerName,
      phone: phone || '+91 98481 00000',
      village: village || 'Ongole Rural',
      crop,
      quantityKg: Number(quantityKg),
      grade: grade || 'Grade A'
    };

    const saved = db.addFpoMember(newMember);
    res.status(201).json(saved);
  });

  app.get('/api/fpo/aggregations', (req, res) => {
    const fpoId = (req.query.fpoId as string) || 'fpo-1';
    const aggregations = db.getFpoAggregations(fpoId);
    res.json(aggregations);
  });

  // ==========================================
  // BULK BUYER REQUIREMENTS & MATCHING
  // ==========================================
  app.get('/api/bulk/requirements', (req, res) => {
    res.json(db.getBuyerRequirements());
  });

  app.post('/api/bulk/requirements', (req, res) => {
    const {
      buyerId,
      buyerName,
      buyerPhone,
      product,
      quantity,
      unit,
      qualityGrade,
      maxPricePerUnit,
      requiredDate,
      deliveryLocation,
      deadline,
      specialRequirements
    } = req.body;

    if (!product || !quantity || !maxPricePerUnit) {
      return res.status(400).json({ error: 'Product, quantity, and max price are required' });
    }

    const newReq: BuyerRequirement = {
      id: `req-${Date.now()}`,
      buyerId: buyerId || 'bulk-1',
      buyerName: buyerName || 'Ananya Foods & Agro Processing',
      buyerPhone: buyerPhone || '+91 98480 45678',
      product,
      quantity: Number(quantity),
      unit: unit || 'kg',
      qualityGrade: qualityGrade || 'Grade A',
      maxPricePerUnit: Number(maxPricePerUnit),
      requiredDate: requiredDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      deliveryLocation: deliveryLocation || 'Hyderabad Hub',
      deadline: deadline || new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      specialRequirements,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    const saved = db.addBuyerRequirement(newReq);
    res.status(201).json(saved);
  });

  app.get('/api/bulk/requirements/:id/matches', (req, res) => {
    const matches = db.getMatchesForRequirement(req.params.id);
    res.json(matches);
  });

  app.post('/api/bulk/procure', (req, res) => {
    const {
      buyerId,
      buyerName,
      buyerPhone,
      requirementId,
      supplierId,
      supplierName,
      supplierType,
      product,
      quantity,
      unit,
      pricePerUnit,
      deliveryLocation,
      paymentTerms
    } = req.body;

    const qty = Number(quantity || 1000);
    const price = Number(pricePerUnit || 25);
    const productAmount = qty * price;
    const logisticsCharge = calculateLogisticsCharge(14.5) * Math.max(1, Math.round(qty / 1000));
    const totalAmount = productAmount + logisticsCharge;

    const providers = db.getLogisticsProviders();
    const activeProvider = providers.find(p => p.availability) || providers[0] || {
      id: 'logistics-1',
      name: 'Suresh Express Logistics',
      phone: '+91 98480 56789',
      vehicleType: 'Mini Truck',
      vehicleNumber: 'AP 27 XY 1024'
    };

    const orderId = `K2K-BULK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customerId: buyerId || 'bulk-1',
      customerName: buyerName || 'Ananya Foods & Agro Processing',
      customerPhone: buyerPhone || '+91 98480 45678',
      customerAddress: deliveryLocation || 'Bulk Logistics Depot, Cherlapally, Hyderabad',
      customerDeliveryLocation: deliveryLocation || 'Bulk Logistics Depot, Cherlapally, Hyderabad',
      farmerId: supplierId || 'fpo-1',
      farmerName: supplierName || 'Prakasam Rythu Mitra FPO',
      farmerPhone: '+91 98480 23456',
      farmerAddress: supplierType === 'FPO' ? 'APMC Aggregation Yard Gate 2, Ongole' : 'Farm Gate, Santhanuthalapadu, Ongole',
      farmerPickupLocation: supplierType === 'FPO' ? 'APMC Aggregation Yard Gate 2, Ongole' : 'Farm Gate, Santhanuthalapadu, Ongole',
      productId: `lot-${Date.now()}`,
      productName: product || 'Aggregated Produce',
      quantity: qty,
      unit: unit || 'kg',
      grade: 'Grade A',
      pricePerUnit: price,
      productAmount,
      distanceKm: 14.5,
      logisticsCharge,
      totalAmount,
      paymentMethod: paymentTerms || 'Escrow Bank Guarantee',
      paymentStatus: 'SUCCESS',
      orderStatus: 'ACCEPTED',
      assignedLogisticsId: activeProvider.id,
      assignedLogisticsName: activeProvider.name,
      assignedLogisticsPhone: activeProvider.phone,
      assignedVehicleType: activeProvider.vehicleType,
      vehicleNumber: activeProvider.vehicleNumber,
      estimatedTravelMinutes: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date().toISOString() },
        { status: 'ACCEPTED', timestamp: new Date().toISOString(), note: `Bulk procurement contract executed by ${buyerName || 'Buyer'}. Dispatched to fleet.` }
      ]
    };

    db.createOrder(newOrder);

    // Update buyer requirement if matching requirementId
    if (requirementId) {
      const reqItem = db.getData().buyerRequirements.find(r => r.id === requirementId);
      if (reqItem) {
        reqItem.status = 'MATCHED';
        db.persist();
      }
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      message: `Bulk procurement contract of ${qty} kg ${product} successfully confirmed with ${supplierName}!`
    });
  });

  // ==========================================
  // LOGISTICS PROVIDER FLEET & ROUTE OPTIMIZATION
  // ==========================================
  app.get('/api/logistics/providers', (req, res) => {
    res.json(db.getLogisticsProviders());
  });

  app.get('/api/logistics/earnings/:providerId', (req, res) => {
    const provider = db.getLogisticsProviderById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Logistics provider not found' });
    }

    const deliveredOrders = db.getOrders().filter(
      o => (o.assignedLogisticsId === provider.id || o.assignedLogisticsId === provider.userId) && o.orderStatus === 'DELIVERED'
    );

    res.json({
      providerId: provider.id,
      name: provider.name,
      vehicleType: provider.vehicleType,
      vehicleNumber: provider.vehicleNumber,
      completedOrders: deliveredOrders.length,
      totalEarnings: deliveredOrders.reduce((sum, o) => sum + o.logisticsCharge, 0),
      deliveredOrders
    });
  });

  app.get('/api/logistics/route-optimization/:orderId', (req, res) => {
    const order = db.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const distanceKm = order.distanceKm;
    const estTimeMinutes = order.estimatedTravelMinutes || Math.round(distanceKm * 2.2 + 5);

    // Heuristic route optimization points
    const routeDetails = {
      orderId: order.id,
      source: {
        title: 'START / SOURCE (Farmer Pickup)',
        name: order.farmerName,
        phone: order.farmerPhone,
        address: order.farmerAddress,
        pickupPoint: order.farmerPickupLocation,
        coordinates: { lat: 15.5057, lng: 80.0499 }
      },
      destination: {
        title: 'DESTINATION (Customer Delivery)',
        name: order.customerName,
        phone: order.customerPhone,
        address: order.customerAddress,
        dropPoint: order.customerDeliveryLocation,
        coordinates: { lat: 15.5189, lng: 80.0632 }
      },
      distanceKm,
      estimatedMinutes: estTimeMinutes,
      logisticsCharge: order.logisticsCharge,
      suggestedRouteType: distanceKm <= 5 ? 'Local Express Corridor' : 'NH 16 Bypass & Service Road',
      stopsSequence: [
        { step: 1, type: 'PICKUP', label: `Collect ${order.quantity} ${order.unit} ${order.productName} at ${order.farmerPickupLocation}`, time: '0 min' },
        { step: 2, type: 'TRANSIT', label: 'Take NH16 Collector Link toward Ongole Central Hub', time: `${Math.round(estTimeMinutes * 0.4)} min` },
        { step: 3, type: 'DELIVERY', label: `Deliver to ${order.customerName} at ${order.customerDeliveryLocation}`, time: `${estTimeMinutes} min` }
      ]
    };

    res.json(routeDetails);
  });

  // ==========================================
  // MARKET PRICES & DEMAND FORECASTING (Gemini AI + Fallback)
  // ==========================================
  app.get('/api/market-prices', (req, res) => {
    res.json(db.getMarketPrices());
  });

  app.get('/api/demand-forecast', async (req, res) => {
    const product = (req.query.product as string) || 'Tomato';
    const location = (req.query.location as string) || 'Ongole / Andhra Pradesh';
    const recentPrice = req.query.recentPrice ? parseFloat(req.query.recentPrice as string) : undefined;

    const forecast = await generateCropDemandForecast({
      product,
      location,
      recentPrice
    });

    res.json(forecast);
  });

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const { userId, role } = req.query;
    res.json(db.getNotifications(userId as string, role as string));
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const success = db.markNotificationAsRead(req.params.id);
    res.json({ success });
  });

  // ==========================================
  // ADMIN MONITORING & METRICS
  // ==========================================
  app.get('/api/admin/stats', (req, res) => {
    const orders = db.getOrders();
    const users = db.getUsers();

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalLogisticsCharges = orders.reduce((sum, o) => sum + o.logisticsCharge, 0);

    const stats = {
      totalFarmers: users.filter(u => u.role === 'farmer').length,
      totalFpos: users.filter(u => u.role === 'fpo').length,
      totalCustomers: users.filter(u => u.role === 'customer').length,
      totalBulkBuyers: users.filter(u => u.role === 'bulkBuyer').length,
      totalLogisticsProviders: db.getLogisticsProviders().length,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.orderStatus === 'DELIVERED').length,
      pendingOrders: orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length,
      totalRevenue,
      totalLogisticsCharges
    };

    res.json(stats);
  });

  app.get('/api/admin/data', (req, res) => {
    res.json(db.getData());
  });

  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kisaan2Karidhar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
