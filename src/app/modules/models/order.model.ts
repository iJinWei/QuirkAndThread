import { Timestamp } from 'firebase/firestore'

export interface IOrder {
    id?: string;
    name?: string;
    date?: Timestamp;
    totalAmount?: number;
    orderStatus?: string;
    deliveryStatus?: string;
    userId?: string;
}