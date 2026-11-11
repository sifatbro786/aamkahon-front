// CSV import for the customer book. The file is parsed in the browser so the
// owner sees a table and can fix the column mapping before anything is sent;
// the backend re-validates every row (POST /api/admin/customers/import).
import { useMemo, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import toast from "react-hot-toast";
import { customerAdminApi } from "../../../api/customerAdminApi";
import { guessColumns, normalizeBdPhone, parseCsv } from "../../../utils/csv";

const FIELDS = [
    ["phone", "Phone (required)"],
    ["name", "Name"],
    ["district", "District"],
    ["email", "Email"],
    ["address", "Address"],
    ["tags", "Tags"],
];
const CHUNK = 1000;
const PREVIEW = 100;
const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";

export default function CustomerImportModal({ onClose, onDone }) {
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [rows, setRows] = useState([]);
    const [hasHeader, setHasHeader] = useState(true);
    const [map, setMap] = useState(null);
    const [tags, setTags] = useState("");
    const [mode, setMode] = useState("skip");
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);

    const readFile = (file) => {
        if (!file) return;
        if (!/\.(csv|txt)$/i.test(file.name)) {
            toast.error("Save the sheet as CSV first (Excel: File > Save As > CSV UTF-8)");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is larger than 10 MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const parsed = parseCsv(String(reader.result || ""));
            if (!parsed.length) {
                toast.error("The file is empty");
                return;
            }
            const g = guessColumns(parsed);
            setRows(parsed);
            setHasHeader(g.hasHeader);
            setMap(g.map);
            setFileName(file.name);
            setResult(null);
            // Default tag = file name, so an import can be found (and undone) later.
            setTags(file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40));
        };
        reader.readAsText(file, "utf-8");
    };

    const width = useMemo(() => Math.max(0, ...rows.slice(0, 50).map((r) => r.length)), [rows]);
    const header = hasHeader ? rows[0] || [] : [];
    const body = useMemo(() => (hasHeader ? rows.slice(1) : rows), [rows, hasHeader]);

    // Row status for the preview and the summary: valid / invalid / duplicate in file.
    const checked = useMemo(() => {
        if (!map || map.phone < 0) return [];
        const seen = new Set();
        return body.map((r) => {
            const phone = normalizeBdPhone(r[map.phone]);
            if (!phone) return { status: "invalid", phone: null };
            if (seen.has(phone)) return { status: "duplicate", phone };
            seen.add(phone);
            return { status: "ok", phone };
        });
    }, [body, map]);
    const stats = useMemo(() => {
        const s = { ok: 0, invalid: 0, duplicate: 0 };
        checked.forEach((c) => (s[c.status] += 1));
        return s;
    }, [checked]);

    const colName = (i) => (hasHeader && header[i] ? header[i] : `Column ${i + 1}`);

    const run = async () => {
        if (!map || map.phone < 0) return toast.error("Choose which column holds the phone number");
        const pick = (r, k) => (map[k] >= 0 ? r[map[k]] : undefined);
        const payloadRows = body.map((r, i) => ({
            rowNumber: i + (hasHeader ? 2 : 1), // spreadsheet row number, for the error list
            phone: pick(r, "phone"),
            name: pick(r, "name"),
            district: pick(r, "district"),
            email: pick(r, "email"),
            address: pick(r, "address"),
            tags: pick(r, "tags"),
        }));
        const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
        const batch = `${fileName.slice(0, 50)} ${new Date().toISOString().slice(0, 16)}`;

        setBusy(true);
        setProgress(0);
        const total = { received: 0, inserted: 0, updated: 0, unchanged: 0, invalid: 0, duplicatesInFile: 0, errors: [] };
        try {
            for (let i = 0; i < payloadRows.length; i += CHUNK) {
                const { data } = await customerAdminApi.importRows({ rows: payloadRows.slice(i, i + CHUNK), tags: tagList, mode, batch });
                for (const k of ["received", "inserted", "updated", "unchanged", "invalid", "duplicatesInFile"]) total[k] += data[k] || 0;
                total.errors.push(...(data.errors || []));
                setProgress(Math.min(100, Math.round(((i + CHUNK) / payloadRows.length) * 100)));
            }
            setResult(total);
            toast.success(`${total.inserted} new customers added`);
            onDone();
        } catch (err) {
            toast.error(err.response?.data?.message || "Import failed");
            if (total.received) setResult(total);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <div className="my-8 w-full max-w-5xl rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Import customers from CSV</h2>
                    <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    {!rows.length ? (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                readFile(e.dataTransfer.files?.[0]);
                            }}
                            className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-12 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                        >
                            <FileUp size={28} />
                            <span className="font-medium">Choose or drop a .csv file</span>
                            <span className="text-sm text-gray-500">Needs at least a phone column. Name, district, email, address and tags are optional. Excel: File, Save As, CSV UTF-8.</span>
                        </button>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="font-medium text-gray-900">{fileName}</span>
                                <span className="text-gray-500">{body.length} rows</span>
                                <label className="ml-auto inline-flex items-center gap-2 text-gray-700">
                                    <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
                                    First row is a header
                                </label>
                                <button onClick={() => { setRows([]); setMap(null); setResult(null); }} className="text-gray-500 underline">
                                    Choose another file
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                {FIELDS.map(([key, label]) => (
                                    <label key={key} className="text-xs font-medium text-gray-600">
                                        {label}
                                        <select className={`${field} mt-1`} value={map?.[key] ?? -1} onChange={(e) => setMap((m) => ({ ...m, [key]: Number(e.target.value) }))}>
                                            <option value={-1}>Not in file</option>
                                            {Array.from({ length: width }, (_, i) => (
                                                <option key={i} value={i}>{colName(i)}</option>
                                            ))}
                                        </select>
                                    </label>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm">
                                <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">{stats.ok} valid</span>
                                <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">{stats.invalid} invalid number</span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{stats.duplicate} repeated in file</span>
                            </div>

                            <div className="max-h-80 overflow-auto rounded-md border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-3 py-2">#</th>
                                            <th className="px-3 py-2">Phone</th>
                                            <th className="px-3 py-2">Name</th>
                                            <th className="px-3 py-2">District</th>
                                            <th className="px-3 py-2">Email</th>
                                            <th className="px-3 py-2">Tags</th>
                                            <th className="px-3 py-2">Check</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {body.slice(0, PREVIEW).map((r, i) => {
                                            const c = checked[i] || {};
                                            const v = (k) => (map?.[k] >= 0 ? r[map[k]] : "");
                                            return (
                                                <tr key={i} className={c.status === "invalid" ? "bg-red-50/60" : c.status === "duplicate" ? "bg-gray-50 text-gray-400" : ""}>
                                                    <td className="px-3 py-1.5 text-gray-400">{i + (hasHeader ? 2 : 1)}</td>
                                                    <td className="px-3 py-1.5 font-mono">{c.phone || v("phone")}</td>
                                                    <td className="px-3 py-1.5">{v("name")}</td>
                                                    <td className="px-3 py-1.5">{v("district")}</td>
                                                    <td className="px-3 py-1.5">{v("email")}</td>
                                                    <td className="px-3 py-1.5">{v("tags")}</td>
                                                    <td className="px-3 py-1.5 text-xs">{c.status === "ok" ? "OK" : c.status === "duplicate" ? "Repeated" : "Invalid number"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {body.length > PREVIEW && <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">Showing the first {PREVIEW} of {body.length} rows. All rows are imported.</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="text-sm text-gray-700">
                                    Tags for every imported row (comma separated)
                                    <input className={`${field} mt-1`} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mango-2025, wholesale" />
                                </label>
                                <fieldset className="text-sm text-gray-700">
                                    <legend>If a number is already in the list</legend>
                                    <label className="mt-2 flex items-center gap-2">
                                        <input type="radio" checked={mode === "skip"} onChange={() => setMode("skip")} /> Keep the existing details, only add tags
                                    </label>
                                    <label className="mt-1 flex items-center gap-2">
                                        <input type="radio" checked={mode === "update"} onChange={() => setMode("update")} /> Overwrite with the file (empty cells are ignored)
                                    </label>
                                </fieldset>
                            </div>

                            {result && (
                                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                    <p className="font-medium text-gray-900">
                                        {result.inserted} added, {result.updated} updated, {result.unchanged} already there, {result.invalid} invalid, {result.duplicatesInFile} repeated in file.
                                    </p>
                                    {result.errors.length > 0 && (
                                        <ul className="mt-2 max-h-32 overflow-auto text-xs text-red-700">
                                            {result.errors.slice(0, 100).map((e) => (
                                                <li key={`${e.row}-${e.phone}`}>Row {e.row}: {e.phone || "(empty)"}, {e.reason}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    <input ref={fileRef} type="file" hidden accept=".csv,text/csv,.txt" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ""; }} />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    {busy && <span className="mr-auto text-sm text-gray-500">Importing... {progress}%</span>}
                    <button onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {result ? "Close" : "Cancel"}
                    </button>
                    {rows.length > 0 && !result && (
                        <button onClick={run} disabled={busy || !stats.ok} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                            Import {stats.ok} customers
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
