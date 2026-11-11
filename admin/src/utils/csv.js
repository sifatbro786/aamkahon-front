// Small RFC 4180 CSV parser for the customer import (no dependency needed):
// quoted fields, "" escapes, commas/newlines inside quotes, CRLF, UTF-8 BOM.
// Also sniffs ; and tab separated files (Excel in some locales saves those).
export function parseCsv(text) {
    const src = text.replace(/^﻿/, "");
    const firstLine = src.slice(0, src.indexOf("\n") === -1 ? src.length : src.indexOf("\n"));
    const counts = { ",": 0, ";": 0, "\t": 0 };
    for (const ch of firstLine) if (ch in counts) counts[ch] += 1;
    const [top, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const sep = topCount > 0 ? top : ",";

    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (quoted) {
            if (c === '"' && src[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (c === '"') quoted = false;
            else cell += c;
        } else if (c === '"' && cell === "") quoted = true;
        else if (c === sep) {
            row.push(cell);
            cell = "";
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && src[i + 1] === "\n") i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
        } else cell += c;
    }
    if (cell !== "" || row.length) {
        row.push(cell);
        rows.push(row);
    }
    return rows.map((r) => r.map((v) => v.trim())).filter((r) => r.some(Boolean));
}

/** Same rule as backend utils/phone.js. Display only; the server re-checks. */
export function normalizeBdPhone(raw) {
    if (raw === undefined || raw === null) return null;
    let d = String(raw).replace(/\D/g, "");
    if (d.startsWith("00880")) d = d.slice(5);
    else if (d.startsWith("880")) d = d.slice(3);
    if (d.length === 10 && d.startsWith("1")) d = `0${d}`;
    return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

const HEADER_HINTS = {
    name: /^(name|customer|full ?name|client|নাম)/i,
    phone: /(phone|mobile|number|contact|cell|ফোন|মোবাইল|নম্বর)/i,
    email: /e-?mail/i,
    district: /(district|city|zila|জেলা)/i,
    address: /(address|ঠিকানা)/i,
    tags: /(tag|group|segment|type)/i,
};

/**
 * Guess { hasHeader, map: { name, phone, email, district, address, tags } }
 * where each value is a column index or -1.
 */
export function guessColumns(rows) {
    const width = Math.max(...rows.slice(0, 20).map((r) => r.length), 0);
    const map = { name: -1, phone: -1, email: -1, district: -1, address: -1, tags: -1 };
    const head = rows[0] || [];
    const hasHeader = head.length > 0 && !head.some((v) => normalizeBdPhone(v));

    if (hasHeader) {
        head.forEach((h, i) => {
            for (const [key, rx] of Object.entries(HEADER_HINTS)) {
                if (map[key] === -1 && rx.test(h)) {
                    map[key] = i;
                    break;
                }
            }
        });
    }
    // No usable header: the phone column is the one with the most valid numbers.
    if (map.phone === -1) {
        const sample = rows.slice(hasHeader ? 1 : 0, 60);
        let best = -1;
        let bestHits = 0;
        for (let c = 0; c < width; c++) {
            const hits = sample.filter((r) => normalizeBdPhone(r[c])).length;
            if (hits > bestHits) {
                best = c;
                bestHits = hits;
            }
        }
        map.phone = best;
    }
    if (map.name === -1) {
        const sample = rows.slice(hasHeader ? 1 : 0, 30);
        for (let c = 0; c < width; c++) {
            if (c === map.phone) continue;
            if (sample.some((r) => r[c] && /\p{L}/u.test(r[c]) && !normalizeBdPhone(r[c]))) {
                map.name = c;
                break;
            }
        }
    }
    return { hasHeader, map, width };
}
