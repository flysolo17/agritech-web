import { Order, Products, productToOrder } from '../models/products';

export class ProductCalculator {
  products: Products[];
  constructor(products: Products[]) {
    this.products = products;
  }

  countCategories(): number {
    const categories = new Set();
    this.products.forEach((value) => {
      categories.add(value.category.toLocaleLowerCase());
    });
    return categories.size;
  }

  getTargetStocksPerMonth(months: string[]): number[] {
    let targetSales: number[] = [];
    months.forEach((value) => {
      targetSales.push(this.getTargetSalesPerMoth(value));
    });

    return targetSales;
  }

  getTargetSalesPerMoth(month: string) {
    let count = 0;
    const currentYear = new Date().getFullYear();
    this.products.forEach((data) => {
      const monthYear = data.createdAt.toDate().toLocaleString('default', {
        month: 'short',
      });

      if (
        monthYear === month &&
        data.createdAt.toDate().getFullYear() === currentYear
      ) {
        if (data.variations.length === 0) {
          count += data.stocks * data.price;
        } else {
          data.variations.forEach((e) => {
            count += e.stocks * e.price;
          });
        }
      }
    });
    return count;
  }
}
