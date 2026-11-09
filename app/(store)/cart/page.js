import CartView from "@/components/cart/CartView";

export const metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
    return <CartView />;
}
