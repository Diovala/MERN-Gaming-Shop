const { Admin, Category, Product, Customer, Order } = require('./Models');

// ️ Tư duy phòng thủ: Luôn check null/undefined trước khi xử lý mảng

class ProductDAO {
  static async getAllActive() {
    const products = await Product.find({ isActive: true }).populate('category', 'name slug');
    return Array.isArray(products) ? products : [];
  }

  static async getById(id) {
    return await Product.findById(id).populate('category', 'name');
  }

  static async create(data) {
    return await Product.create(data);
  }

  static async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async delete(id) {
    return await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  static async getByCategory(categoryId) {
    const products = await Product.find({ category: categoryId, isActive: true });
    return Array.isArray(products) ? products : [];
  }

  static async updateStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.stock < quantity) throw new Error('Không đủ hàng');
    
    product.stock -= quantity;
    await product.save();
    return product;
  }
}

class CategoryDAO {
  static async getAllActive() {
    const categories = await Category.find({ isActive: true });
    return Array.isArray(categories) ? categories : [];
  }

  static async create(data) {
    return await Category.create(data);
  }

  static async update(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async delete(id) {
    return await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}

class OrderDAO {
  static async create(data) {
    return await Order.create(data);
  }

  static async getByCustomer(customerId) {
    const orders = await Order.find({ customer: customerId }).populate('items.product', 'name images');
    return Array.isArray(orders) ? orders : [];
  }

  static async getById(id) {
    return await Order.findById(id).populate('items.product', 'name brand');
  }

  static async getAll() {
    const orders = await Order.find().populate('customer', 'fullName email').populate('items.product', 'name');
    return Array.isArray(orders) ? orders : [];
  }

  static async updateStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  }
}

class CustomerDAO {
  static async getAll() {
    const customers = await Customer.find().select('-password -activationToken -activationTokenExpiry');
    return Array.isArray(customers) ? customers : [];
  }

  static async toggleActive(id) {
    const customer = await Customer.findById(id);
    if (!customer) throw new Error('Không tìm thấy khách hàng');
    
    customer.isActive = !customer.isActive;
    await customer.save();
    return customer;
  }
}

module.exports = { ProductDAO, CategoryDAO, OrderDAO, CustomerDAO };