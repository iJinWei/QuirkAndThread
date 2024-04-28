import { Timestamp } from 'firebase/firestore'

export interface IOrder {
    id?: string;
    date?: Timestamp;
    totalAmount?: number;
    orderStatus?: string;
    deliveryPersonnelId?: string;
    deliveryStatus?: string;
    userId?: string;
    items?: Array<OrderItem>;
    address?: string;
}

interface OrderItem {
    id?: string;
    product?: Product;
    quantity?: number;
}

interface Product {
    category?: string;
    description?: string;
    id?: string;
    imageUrl?: string;
    name?: string;
    price?: number;
    stock?: number;
}