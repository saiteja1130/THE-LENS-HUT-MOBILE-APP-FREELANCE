import { api } from './api';

export const normalizeMobileProduct = (p) => {
  if (!p) return null;
  const frontImg = p.images?.front || p.image || '';
  const sideImg = p.images?.side || p.secondaryImage || '';
  const angleImg = p.images?.angle || '';

  const perspectiveArr = [frontImg, sideImg, angleImg].filter(Boolean);
  const imagesArr =
    perspectiveArr.length > 0
      ? perspectiveArr
      : Array.isArray(p.images) && p.images.length > 0
      ? p.images.filter(Boolean)
      : frontImg
      ? [frontImg]
      : [];

  const price = Number(p.price) || 0;
  const mrp = Number(p.mrp) || Number(p.offerPrice) || price;

  return {
    ...p,
    id: p.id || p._id,
    name: p.name,
    brand: p.brand || 'The Lens Hut Reserve',
    category: p.category || 'Eyeglasses',
    categorySlug: (p.categorySlug || p.category || 'eyeglasses').toLowerCase(),
    productType: p.productType || (p.category === 'contact-lenses' ? 'contact-lens' : 'eyeglasses'),
    price,
    mrp,
    rating: Number(p.rating) || 4.8,
    reviewsCount: Number(p.reviewsCount || p.reviewCount) || 0,
    isBestSeller: Boolean(p.isBestSeller),
    isNew: Boolean(p.isNewArrival || p.isNew),
    frameShape: p.frameSpecifications?.shape || p.frameShape || 'Round',
    frameType: p.frameSpecifications?.frameType || p.frameType || 'Full Rim',
    material: p.frameSpecifications?.material || p.material || 'Acetate',
    weight: p.frameSpecifications?.weight || p.weight || '18g',
    size: p.frameSpecifications?.size || p.size || 'Medium (52-18-140)',
    images: {
      front: frontImg,
      side: sideImg,
      angle: angleImg,
    },
    colors: Array.isArray(p.colors) ? p.colors : [],
    image: frontImg,
    perspectiveList: imagesArr,
    imageList: imagesArr,
    description: p.description || '',
    inStock: p.stock !== undefined ? p.stock > 0 : true,
    isInWishlist: Boolean(p.isInWishlist),
  };
};

export const productApi = {
  /**
   * Fetch products for Shop screen with filters and search
   */
  getProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'all' && val !== 'All') {
          queryParams.append(key, val);
        }
      });

      const queryString = queryParams.toString();
      const res = await api.get(`/products${queryString ? `?${queryString}` : ''}`);

      if (res?.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: res.data.map(normalizeMobileProduct),
          pagination: res.pagination || { total: res.data.length, page: 1, limit: res.data.length, totalPages: 1 },
        };
      }
    } catch (error) {
      console.warn('[ProductApi Mobile Axios] Fetch failed:', error.message);
    }

    return {
      success: false,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  /**
   * Fetch single product by id or slug
   */
  getProductByIdOrSlug: async (idOrSlug) => {
    try {
      const res = await api.get(`/products/${idOrSlug}`);
      if (res?.success && res.data) {
        return {
          success: true,
          data: normalizeMobileProduct(res.data),
        };
      }
    } catch (error) {
      console.warn('[ProductApi Mobile Axios] Product detail fetch failed:', error.message);
    }

    return {
      success: false,
      data: null,
    };
  },

  /**
   * Fetch featured and bestselling products for mobile home
   */
  getFeaturedProducts: async (limit = 10) => {
    try {
      const res = await api.get(`/products/featured?limit=${limit}`);
      if (res?.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: res.data.map(normalizeMobileProduct),
        };
      }
    } catch (error) {
      console.warn('[ProductApi Mobile Axios] Featured products fetch failed:', error.message);
    }

    return {
      success: false,
      data: [],
    };
  },
};

export default productApi;
