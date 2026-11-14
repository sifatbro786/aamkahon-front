// Remembers the last checkout details on this device (no customer accounts,
// so this is how a repeat customer avoids typing everything again).
// Only delivery fields; never payment data. The shopper can switch it off at
// checkout, which also forgets what was saved.
const KEY = "aamkahon.checkout.v1";
const FIELDS = ["name", "phone", "email", "district", "upazila", "addressLine1", "addressLine2"];

export function loadCheckoutDetails() {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) || "null");
        if (!raw || typeof raw !== "object") return null;
        return Object.fromEntries(FIELDS.map((f) => [f, typeof raw[f] === "string" ? raw[f] : ""]));
    } catch {
        return null;
    }
}

export function saveCheckoutDetails(details) {
    try {
        localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f, String(details[f] || "").trim()]))));
    } catch {
        /* storage blocked */
    }
}

export function forgetCheckoutDetails() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* storage blocked */
    }
}
