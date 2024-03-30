import { Timestamp } from 'firebase/firestore'
import { IOrderItem } from './order-item.model';

export interface IOrder {
    id?: string;
    name?: string;
    date?: Timestamp;
    totalAmount?: number;
    status?: string;
}