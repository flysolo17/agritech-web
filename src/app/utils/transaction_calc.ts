import { or } from '@angular/fire/firestore';
import { TopSellingStock } from '../models/top_selling_stock';
import { OrderItems } from '../models/transaction/order_items';
import { Transactions } from '../models/transaction/transactions';
import { TransactionStatus } from '../models/transaction/transaction_status';
import { TransactionType } from '../models/transaction/transaction_type';

export class TransactionCalculator {
  transactions: Transactions[];
  constructor(transactions: Transactions[]) {
    this.transactions = transactions;
  }
  calculateTotalSales(): number {
    let totalSales = 0;
    for (const transaction of this.transactions.filter(
      (e) => e.status == TransactionStatus.COMPLETED
    )) {
      for (const orderItem of transaction.orderList) {
        totalSales += orderItem.quantity * orderItem.price;
      }
    }
    return totalSales;
  }
  calculateTotalCost(): number {
    let totalCost = 0;
    for (const transaction of this.transactions.filter(
      (e) => e.status == TransactionStatus.COMPLETED
    )) {
      for (const orderItem of transaction.orderList) {
        totalCost += orderItem.quantity * orderItem.cost;
      }
    }
    return totalCost;
  }

  calculateTopSellingStocks(): TopSellingStock[] {
    const orderList: OrderItems[] = this.transactions
      .filter((e) => e.status == TransactionStatus.COMPLETED)
      .flatMap((transaction) => transaction.orderList);
    const topSellingStockMap = new Map<string, TopSellingStock>();
    for (const orderItem of orderList) {
      const { productName, quantity, price, cost } = orderItem;

      if (topSellingStockMap.has(productName)) {
        const existingStock = topSellingStockMap.get(productName)!;
        existingStock.soldQuantity += quantity;
        existingStock.stocks += quantity;
      } else {
        topSellingStockMap.set(productName, {
          name: productName,
          soldQuantity: quantity,
          stocks: quantity,
          price: price,
        });
      }
    }

    const topSellingStocks: TopSellingStock[] = Array.from(
      topSellingStockMap.values()
    ).sort((a, b) => b.soldQuantity - a.soldQuantity);
    const top3SellingStocks = topSellingStocks.slice(0, 3);
    return top3SellingStocks;
  }

  calculateTotalSalesPerMonth(): Map<string, number> {
    const totalSalesPerMonth = new Map<string, number>();
    const currentYear = new Date().getFullYear();
    for (const transaction of this.transactions.filter(
      (e) =>
        e.status == TransactionStatus.COMPLETED &&
        e.createdAt.toDate().getFullYear() === currentYear
    )) {
      const monthYear = transaction.createdAt
        .toDate()
        .toLocaleString('default', {
          month: 'short',
        });

      const totalSales = transaction.orderList.reduce((total, orderItem) => {
        return total + orderItem.quantity * orderItem.price;
      }, 0);

      if (totalSalesPerMonth.has(monthYear)) {
        totalSalesPerMonth.set(
          monthYear,
          totalSalesPerMonth.get(monthYear)! + totalSales
        );
      } else {
        totalSalesPerMonth.set(monthYear, totalSales);
      }
    }
    return totalSalesPerMonth;
  }

  generateTotalSalesPerMoth(months: string[]): number[] {
    let targetSales: number[] = [];
    months.forEach((data) => {
      let total: number = this.calculateTotalSalesPerMonth().get(data) ?? 0;
      targetSales.push(total);
    });

    return targetSales;
  }

  calculateTotalSalesByWalkIn(): Map<string, number> {
    const totalSalesPerMonth = new Map<string, number>();
    const currentYear = new Date().getFullYear();

    for (const transaction of this.transactions.filter(
      (e) =>
        e.status == TransactionStatus.COMPLETED &&
        e.type == TransactionType.WALK_IN &&
        e.createdAt.toDate().getFullYear() === currentYear
    )) {
      const monthYear = transaction.createdAt
        .toDate()
        .toLocaleString('default', {
          month: 'short',
        });

      const totalSales = transaction.orderList.reduce((total, orderItem) => {
        return total + orderItem.quantity * orderItem.price;
      }, 0);

      if (totalSalesPerMonth.has(monthYear)) {
        totalSalesPerMonth.set(
          monthYear,
          totalSalesPerMonth.get(monthYear)! + totalSales
        );
      } else {
        totalSalesPerMonth.set(monthYear, totalSales);
      }
    }

    return totalSalesPerMonth;
  }

  calculateTotalOnlineOrders(): Map<string, number> {
    const totalSalesPerMonth = new Map<string, number>();
    const currentYear = new Date().getFullYear();

    for (const transaction of this.transactions.filter(
      (e) =>
        e.status == TransactionStatus.COMPLETED &&
        (e.type == TransactionType.DELIVERY ||
          e.type == TransactionType.PICK_UP) &&
        e.createdAt.toDate().getFullYear() === currentYear
    )) {
      const monthYear = transaction.createdAt
        .toDate()
        .toLocaleString('default', {
          month: 'short',
        });

      const totalSales = transaction.orderList.reduce((total, orderItem) => {
        return total + orderItem.quantity * orderItem.price;
      }, 0);

      if (totalSalesPerMonth.has(monthYear)) {
        totalSalesPerMonth.set(
          monthYear,
          totalSalesPerMonth.get(monthYear)! + totalSales
        );
      } else {
        totalSalesPerMonth.set(monthYear, totalSales);
      }
    }
    return totalSalesPerMonth;
  }

  getAllActiveCustomer() {
    const uniqueCustomerIDs = new Set();
    this.transactions.forEach((e) => {
      if (e.customerID !== '') {
        uniqueCustomerIDs.add(e.customerID);
      }
    });
    return uniqueCustomerIDs.size;
  }

  countCancelledTransactions() {
    return this.transactions.filter(
      (e) => e.status == TransactionStatus.CANCELLED
    );
  }
}
