import currency from 'currency.js';
import dayjs from 'dayjs';
import 'dayjs/locale/id.js'; // Import Indonesian locale

// Set locale to Indonesian
dayjs.locale('id');

export const formatCurrency = (value) => {
    return currency(value, {
        symbol: 'Rp ',
        decimal: ',',
        separator: '.',
        precision: 0
    }).format();
};

export const formatDate = (dateString, format = 'dddd, D MMMM YYYY') => {
    return dayjs(dateString).format(format);
};

export const formatDateTime = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};
