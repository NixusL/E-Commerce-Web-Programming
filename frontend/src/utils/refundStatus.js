export function prettyRefundStatus(status) {
  const v = String(status || "none").toLowerCase();

  switch (v) {
    case "seller_approved":
      return "Seller Approved";
    case "pending":
      return "Pending Seller Approval";
    case "refunded":
      return "Refunded";
    case "rejected":
      return "Rejected";
    case "none":
      return "No Refund";
    default:
      // Fallback: make unknown values readable
      // e.g. "seller_approved" -> "Seller Approved"
      return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
