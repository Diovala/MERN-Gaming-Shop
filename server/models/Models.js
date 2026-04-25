const mongoose = require("mongoose");
const schemaOptions = { timestamps: true };

// 1️⃣ ADMIN
const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "ADMIN" },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

// 2️⃣ CATEGORY
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

// 3️⃣ PRODUCT (Trọng tâm: specs động + images Base64)
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator: function (val) {
          // ✅ Cho phép trống, null hoặc 0 (không khuyến mãi)
          if (!val || val === 0) return true;
          return val < this.price;
        },
        message: "Giá khuyến mãi phải nhỏ hơn giá gốc.",
      },
    },
    brand: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= 4 &&
          arr.every((img) => typeof img === "string"),
        message: "Ảnh phải là chuỗi Base64, tối đa 4 ảnh.",
      },
    },
    specs: [
      {
        k: { type: String, required: true, trim: true },
        v: { type: String, required: true, trim: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

// 4️⃣ CUSTOMER (Đã thêm activationToken)
const CustomerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    address: { type: String, default: "" },
    isActivated: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: "CUSTOMER" },
  },
  schemaOptions,
);

// 5️⃣ ORDER
const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CANCELED", "DELIVERED"],
      default: "PENDING",
    },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, default: "COD" },
  },
  schemaOptions,
);

// 📦 EXPORT
module.exports = {
  Admin: mongoose.model("Admin", AdminSchema),
  Category: mongoose.model("Category", CategorySchema),
  Product: mongoose.model("Product", ProductSchema),
  Customer: mongoose.model("Customer", CustomerSchema),
  Order: mongoose.model("Order", OrderSchema),
};
