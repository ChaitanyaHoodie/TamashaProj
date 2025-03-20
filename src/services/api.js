import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

export const fetchProducts = async (pageNumber = 1, limit = 10) => {
  const skip = (pageNumber - 1) * limit;
  
  try {
    const response = await axios.get(
      `${BASE_URL}/products?limit=${limit}&skip=${skip}`
    );
    
    return {
      products: response.data.products,
      total: response.data.total,
      hasMore: (skip + limit) < response.data.total
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products. Please try again.');
  }
};