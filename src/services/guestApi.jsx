import axios from 'axios';

const API_URL = 'http://192.168.0.94:8000/api/frames';
export const STORAGE_URL = 'http://192.168.0.94:8000/storage/';

export const guestApi = {
    // Fungsi khusus untuk mengambil frame di halaman Guest
    getActiveFrames: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    }
};