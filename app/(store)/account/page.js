import AccountView from "@/components/auth/AccountView";

export const metadata = { title: "Your account", robots: { index: false } };

export default function Page() {
    return <AccountView />;
}
