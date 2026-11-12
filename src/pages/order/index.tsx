import { Navigate } from "react-router";

/**
 * Order information entry. `/order` is a protected screen (the sign-on guard sends a signed-out
 * shopper to sign-on first), and once signed on it hands over to the checkout form.
 */
export default function OrderGatePage(): React.JSX.Element {
  return <Navigate to="/checkout" replace />;
}
