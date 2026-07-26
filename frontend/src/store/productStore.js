import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productService, inventoryService } from '../services/api';
import toast from 'react-hot-toast';

const DEFAULT_CATALOG = [
  { 
    id: 'PROD-001',
    productId: 'f1',
    slug: 'f1',
    sku: 'SKU-ELE-101',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 
    category: 'Electronics', 
    price: 299.99, 
    oldPrice: 399.99,
    stock: 45, 
    status: 'In Stock', 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'],
    description: 'Industry-leading noise canceling with two processors and 8 microphones for unprecedented listening quality.',
    ratingAverage: 4.9,
    reviews: 1420,
    badge: 'HOT DEAL'
  },
  { 
    id: 'PROD-002',
    productId: 'f2',
    slug: 'f2',
    sku: 'SKU-ELE-102',
    name: 'Minimalist Titanium Smart Watch Series 9', 
    category: 'Electronics', 
    price: 199.50, 
    oldPrice: 249.00,
    stock: 12, 
    status: 'Low Stock', 
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
    description: 'Precision-crafted titanium casing with advanced health sensors, always-on Retina display, and 3-day battery life.',
    ratingAverage: 4.8,
    reviews: 890,
    badge: 'BEST SELLER'
  },
  { 
    id: 'PROD-003',
    productId: 'f3',
    slug: 'f3',
    sku: 'SKU-FAS-103',
    name: 'Urban Heavyweight Denim Jacket & Sherpa Collar', 
    category: 'Fashion', 
    price: 89.99, 
    oldPrice: 130.00,
    stock: 28, 
    status: 'In Stock', 
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop'],
    description: 'Classic rugged heavyweight denim lined with plush sherpa fleece for exceptional warmth and timeless style.',
    ratingAverage: 4.7,
    reviews: 540,
    badge: 'NEW'
  },
  { 
    id: 'PROD-004',
    productId: 'f4',
    slug: 'f4',
    sku: 'SKU-HOM-104',
    name: 'Ergonomic Executive Desk Chair with Lumbar Support', 
    category: 'Home', 
    price: 159.00, 
    oldPrice: 210.00,
    stock: 5, 
    status: 'Low Stock', 
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop'],
    description: 'Fully adjustable mesh back executive chair with Dynamic Lumbar Support and 4D padded armrests.',
    ratingAverage: 4.6,
    reviews: 310,
    badge: 'SALE'
  },
  { 
    id: 'PROD-005',
    productId: 'f5',
    slug: 'f5',
    sku: 'SKU-ELE-105',
    name: 'Professional 4K Drone with 3-Axis Gimbal', 
    category: 'Electronics', 
    price: 649.99, 
    oldPrice: 799.00,
    stock: 8, 
    status: 'Low Stock', 
    image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=600&auto=format&fit=crop'],
    description: 'Capture cinematic 4K HDR aerial video with 12km range and 45-minute intelligent flight time.',
    ratingAverage: 4.9,
    reviews: 215,
    badge: 'LIMITED'
  },
  { 
    id: 'PROD-006',
    productId: 'f6',
    slug: 'f6',
    sku: 'SKU-FAS-106',
    name: 'Designer Leather Weekender Duffel Bag', 
    category: 'Fashion', 
    price: 145.00, 
    oldPrice: 195.00,
    stock: 15, 
    status: 'In Stock', 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop'],
    description: 'Full-grain Italian cowhide leather travel bag with waterproof lining and separate shoe compartment.',
    ratingAverage: 4.8,
    reviews: 412,
    badge: 'HOT DEAL'
  },
  { 
    id: 'PROD-007',
    productId: 'f7',
    slug: 'f7',
    sku: 'SKU-HOM-107',
    name: 'Smart RGB LED Floor Lamp with App Control', 
    category: 'Home', 
    price: 75.99, 
    oldPrice: 99.99,
    stock: 32, 
    status: 'In Stock', 
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop'],
    description: '16 million customizable colors with music synchronization and hands-free Alexa/Google Assistant voice commands.',
    ratingAverage: 4.5,
    reviews: 620,
    badge: 'SALE'
  },
  { 
    id: 'PROD-008',
    productId: 'f8',
    slug: 'f8',
    sku: 'SKU-SPO-108',
    name: 'Ultra-Lightweight Carbon Fiber Running Shoes', 
    category: 'Sports', 
    price: 129.00, 
    oldPrice: 165.00,
    stock: 19, 
    status: 'In Stock', 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', 
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'],
    description: 'Responsive carbon fiber infused soleplate engineered for marathon endurance and explosive energy return.',
    ratingAverage: 4.7,
    reviews: 530,
    badge: 'NEW'
  }
];

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: DEFAULT_CATALOG,
      _deletedIds: [],
      isLoading: false,

      // Initialize / Sync from API if backend is online
      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const res = await productService.getAll();
          const items = res.data?.data?.items || res.data?.data || res.data;
          if (Array.isArray(items) && items.length > 0) {
            const currentProducts = get().products || [];
            const deleted = get()._deletedIds || [];

            // Map API items into standard catalog format, preserving locally modified items
            const mapped = items.map((item, idx) => {
              const fallback = DEFAULT_CATALOG[idx % DEFAULT_CATALOG.length] || DEFAULT_CATALOG[0];
              const id = item.productId || item._id || item.id || fallback.id;

              // If this item was locally modified or stock adjusted by Admin, preserve local state
              const localModified = currentProducts.find(p => (p.id === id || p.productId === id || p.slug === id) && p._isLocalModified);
              if (localModified) {
                return localModified;
              }

              const priceNum = typeof item.price === 'number' ? item.price : parseFloat((item.price || '').toString().replace(/[^0-9.-]+/g,"")) || fallback.price;
              const stockNum = item.stock !== undefined ? item.stock : (item.stockHint !== undefined ? item.stockHint : fallback.stock);
              const st = stockNum > 10 ? 'In Stock' : stockNum > 0 ? 'Low Stock' : 'Out of Stock';
              const img = item.images?.[0] || item.image || fallback.image;
              
              return {
                id,
                productId: id,
                slug: item.slug || id,
                sku: item.sku || fallback.sku,
                name: item.name || fallback.name,
                category: item.category || fallback.category,
                price: priceNum,
                oldPrice: priceNum * 1.25,
                stock: stockNum,
                status: st,
                image: img,
                images: [img],
                description: item.description || fallback.description,
                ratingAverage: item.ratingAverage || fallback.ratingAverage,
                reviews: item.reviews || fallback.reviews,
                badge: item.badge || fallback.badge,
                version: item.version || 1
              };
            }).filter(m => !deleted.includes(m.id) && !deleted.includes(m.productId));

            // Keep any products locally added in Admin that are not yet in API response
            const locallyAdded = currentProducts.filter(p => p._isLocalAdded && !mapped.some(m => m.id === p.id || m.productId === p.productId) && !deleted.includes(p.id) && !deleted.includes(p.productId));

            set({ products: [...locallyAdded, ...mapped], isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.warn("Product API fetch fallback - using persisted / default catalog:", err);
          set({ isLoading: false });
        }
      },

      // Add New Product
      addProduct: async (prodData) => {
        const id = `PROD-${Math.floor(100 + Math.random() * 900)}`;
        const priceNum = typeof prodData.price === 'number' ? prodData.price : parseFloat((prodData.price || '').toString().replace(/[^0-9.-]+/g,"")) || 99.00;
        const stockNum = parseInt(prodData.stock) || 0;
        const st = stockNum > 10 ? 'In Stock' : stockNum > 0 ? 'Low Stock' : 'Out of Stock';
        const img = prodData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';

        const newProd = {
          id,
          productId: id,
          slug: id,
          sku: `SKU-${(prodData.category || 'GEN').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          name: prodData.name,
          category: prodData.category || 'Electronics',
          price: priceNum,
          oldPrice: priceNum * 1.2,
          stock: stockNum,
          status: st,
          image: img,
          images: [img],
          description: prodData.description || 'Premium quality product.',
          ratingAverage: 5.0,
          reviews: 1,
          badge: 'NEW',
          _isLocalAdded: true,
          version: 1
        };

        // Try syncing with API
        try {
          await productService.create({
            name: newProd.name,
            price: priceNum,
            category: newProd.category,
            stockHint: stockNum,
            description: newProd.description,
            images: [img]
          });
        } catch (err) {
          console.warn("Backend create fallback:", err);
        }

        set((state) => ({
          products: [newProd, ...state.products]
        }));
        return newProd;
      },

      // Update Product Details & Price
      updateProduct: async (targetId, updatedFields) => {
        const currentProducts = get().products;
        const target = currentProducts.find(p => p.id === targetId || p.productId === targetId || p.slug === targetId);
        if (!target) return null;

        const priceNum = updatedFields.price !== undefined 
          ? (typeof updatedFields.price === 'number' ? updatedFields.price : parseFloat(updatedFields.price.toString().replace(/[^0-9.-]+/g,"")) || target.price)
          : target.price;
        
        const stockNum = updatedFields.stock !== undefined ? parseInt(updatedFields.stock) : target.stock;
        const st = stockNum > 10 ? 'In Stock' : stockNum > 0 ? 'Low Stock' : 'Out of Stock';
        const img = updatedFields.image || target.image;

        const updatedObj = {
          ...target,
          name: updatedFields.name !== undefined ? updatedFields.name : target.name,
          category: updatedFields.category !== undefined ? updatedFields.category : target.category,
          price: priceNum,
          oldPrice: priceNum > target.price ? priceNum * 1.25 : target.oldPrice,
          stock: stockNum,
          status: st,
          image: img,
          images: [img],
          description: updatedFields.description !== undefined ? updatedFields.description : target.description,
          _isLocalModified: true,
          version: (target.version || 1) + 1
        };

        // Attempt API sync with required schema fields
        try {
          await productService.update(target.id, {
            name: updatedObj.name,
            price: updatedObj.price,
            category: updatedObj.category,
            stockHint: updatedObj.stock,
            description: updatedObj.description,
            images: updatedObj.images,
            version: target.version || 1
          });
        } catch (err) {
          console.warn("Backend update fallback:", err);
        }

        set((state) => ({
          products: state.products.map(p => 
            (p.id === targetId || p.productId === targetId || p.slug === targetId) ? updatedObj : p
          )
        }));

        return updatedObj;
      },

      // Delete Product
      deleteProduct: async (targetId) => {
        try {
          await productService.delete(targetId);
        } catch (err) {
          console.warn("Backend delete fallback:", err);
        }

        set((state) => ({
          _deletedIds: [...(state._deletedIds || []), targetId],
          products: state.products.filter(p => p.id !== targetId && p.productId !== targetId && p.slug !== targetId)
        }));
      },

      // Adjust Inventory Stock
      adjustStock: async (targetId, delta) => {
        const currentProducts = get().products;
        const target = currentProducts.find(p => p.id === targetId || p.productId === targetId || p.slug === targetId);
        if (!target) return;

        const nextStock = Math.max(0, (target.stock || 0) + delta);
        const st = nextStock > 10 ? 'In Stock' : nextStock > 0 ? 'Low Stock' : 'Out of Stock';

        try {
          await inventoryService.adjust(target.id, { adjustment: delta });
        } catch (err) {
          console.warn("Backend stock adjust fallback:", err);
        }

        set((state) => ({
          products: state.products.map(p => 
            (p.id === targetId || p.productId === targetId || p.slug === targetId) 
              ? { ...p, stock: nextStock, status: st, _isLocalModified: true } 
              : p
          )
        }));
      },

      // Reset Catalog to defaults
      resetCatalog: () => set({ products: DEFAULT_CATALOG, _deletedIds: [] })
    }),
    {
      name: 'euphoriax-unified-product-catalog',
    }
  )
);
