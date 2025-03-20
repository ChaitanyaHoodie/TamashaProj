import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fakestoreapi.com',
});

export const getProducts = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    _page: page,
    _limit: limit,
    ...filters
  });
  
  return api.get(`/products?${params}`);
};