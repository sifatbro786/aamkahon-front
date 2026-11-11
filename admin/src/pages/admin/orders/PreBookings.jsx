// Pre-bookings = pre-orders still waiting (Pending / Pre-booked). Confirming one
// decrements stock and moves it to the Orders screen (backend viewScope).
import OrdersManagement from "./OrdersManagement";

const PreBookings = () => (
    <div className="space-y-4">
        <OrdersManagement orderType="pre_order" />
        <p className="text-sm text-gray-500">
            When a variety is picked and the stock is added, open the booking and set it to <b>Confirmed</b>. Stock is
            deducted then, and it moves to the Orders page. The balance is collected on delivery.
        </p>
    </div>
);

export default PreBookings;
