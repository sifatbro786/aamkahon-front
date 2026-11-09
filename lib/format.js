// Display helpers only. Money is decided by the backend; these just print it.

const bdt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ৳1,350 */
export const taka = (n) => (n == null || Number.isNaN(Number(n)) ? "" : `৳${bdt.format(Math.round(Number(n)))}`);

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "Asia/Dhaka" });
const dateYearFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" });
const shortFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" });

/** 30 May */
export const dayMonth = (d) => (d ? dateFmt.format(new Date(d)) : "");
/** 30 May 2027 */
export const fullDate = (d) => (d ? dateYearFmt.format(new Date(d)) : "");
/** 30 May (short month) */
export const shortDate = (d) => (d ? shortFmt.format(new Date(d)) : "");

const bnDigits = "০১২৩৪৫৬৭৮৯";
/** 2027 -> ২০২৭ */
export const toBanglaDigits = (v) => String(v).replace(/\d/g, (d) => bnDigits[d]);

/** "10 kg box" -> "box" units read naturally: 1 box, 5 boxes */
export const plural = (n, unit = "unit") => {
    if (n === 1) return unit;
    if (unit === "kg") return "kg";
    if (unit.endsWith("x") || unit.endsWith("s")) return `${unit}es`;
    return `${unit}s`;
};
