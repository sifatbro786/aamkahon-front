// Pre-bookings = orders with orderType "pre_order" (advance paid, status
// "Pre-booked" until the harvest). Moving one to Confirmed decrements stock.
import OrdersManagement from "./OrdersManagement";

const PreBookings = () => (
    <div className="space-y-4">
        <p className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            Pre-bookings paid an advance and wait for the harvest. When the variety is picked and stock is added, set the
            order to <b>Confirmed</b>: that is when stock is deducted. The balance is collected on delivery.
        </p>
        <OrdersManagement orderType="pre_order" />
    </div>
);

export default PreBookings;
