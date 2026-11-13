// Order retrieval by date range (R-0015): begin and end are both inclusive.
export function findOrdersBetween<T extends { orderTime: Date }>(input: {
  orders: T[];
  begin: Date;
  end: Date;
}): T[] {
  const begin = input.begin.getTime();
  const end = input.end.getTime();
  return input.orders.filter((o) => o.orderTime.getTime() >= begin && o.orderTime.getTime() <= end);
}
