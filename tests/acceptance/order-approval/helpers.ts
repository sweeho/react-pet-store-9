// Shared in-memory fixtures for the order-approval acceptance tests.
export type StatusStore = { records: Map<string, { orderId: string; status: string }> };
export const statusStore = (initial: Record<string, string> = {}): StatusStore => ({
  records: new Map(
    Object.entries(initial).map(([orderId, status]) => [orderId, { orderId, status }]),
  ),
});

// Fake queue: deliver() appends to `delivered`, or throws when the queue is unavailable.
export type FakeQueue = {
  name: string;
  available: boolean;
  delivered: string[];
  deliver: (t: string) => void;
};
export const fakeQueue = (available = true): FakeQueue => {
  const q: FakeQueue = {
    name: "jms/OrderApprovalQueue",
    available,
    delivered: [],
    deliver(text) {
      if (!q.available) throw new Error("queue unavailable");
      q.delivered.push(text);
    },
  };
  return q;
};

// Fake caller transaction: enlisted work runs on commit and is discarded on rollback.
export const fakeTransaction = () => {
  const work: (() => void)[] = [];
  return {
    enlist: (fn: () => void) => void work.push(fn),
    commit: () => work.splice(0).forEach((fn) => fn()),
    rollback: () => void work.splice(0),
  };
};

export const approvalXml = (body: string) =>
  `<?xml version="1.0"?><OrderApproval>${body}</OrderApproval>`;
