// /admin/hero-content  ->  "Homepage hero" (Aamkahon)
//
// The storefront hero is ONE full screen block (no slider). Each device has
// its own HeroContent record: desktop shows a landscape video or photo,
// phones show a vertical video or photo. Copy (title, subtitle, button) is
// shared and written to both records. The public GET /api/hero returns the
// full `items`, so everything edited here is live within a minute.
import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Monitor, RefreshCw, Smartphone, Upload, Video } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { heroApi } from "../../../api/heroApi";
import { uploadApi } from "../../../api/uploadApi";

const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

const DEVICES = [
    {
        key: "desktop",
        label: "Desktop and tablet",
        icon: Monitor,
        spec: "Landscape. Video: MP4 (H.264), 1920×1080, 10 to 20 s loop, under 15 MB. Photo: at least 2000 px wide.",
    },
    {
        key: "mobile",
        label: "Phone",
        icon: Smartphone,
        spec: "Portrait. Video: MP4, 1080×1920 (a phone reel), 10 to 20 s, under 10 MB. Photo: at least 1200 px tall.",
    },
];

const isAbsolute = (u) => /^https?:\/\//.test(u || "");
const preview = (u) => (isAbsolute(u) ? u : u || "");

function MediaCard({ device, record, onSaved }) {
    const [mediaType, setMediaType] = useState(record?.mediaType || "image");
    const [mediaUrl, setMediaUrl] = useState(record?.mediaUrl || "");
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);
    const Icon = device.icon;

    const upload = async (file) => {
        if (!file) return;
        setBusy(true);
        try {
            if (mediaType === "video") {
                const fd = new FormData();
                fd.append("video", file);
                const { data } = await axiosInstance.post("/admin/upload/hero-video", fd);
                setMediaUrl(data.url);
            } else {
                const { data } = await uploadApi.uploadSingle(file);
                setMediaUrl(data.imageUrl || data.file?.url);
            }
            toast.success("Uploaded. Press Save to publish.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const save = async () => {
        if (!mediaUrl.trim()) return toast.error("Add a file or a URL first");
        setBusy(true);
        try {
            const payload = { mediaType, mediaUrl: mediaUrl.trim(), deviceType: device.key, isActive: true };
            if (record?._id) await heroApi.updateContent(record._id, payload);
            else await heroApi.createContent({ ...payload, title: "Mangoes picked late, on purpose", subtitle: "Rajshahi orchards to your door.", order: 0 });
            toast.success(`${device.label} hero saved`);
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
                <Icon size={18} className="text-gray-500" />
                <h2 className="font-semibold text-gray-900">{device.label}</h2>
            </div>
            <p className="mt-1 text-xs text-gray-500">{device.spec}</p>

            <div className={`mt-4 overflow-hidden rounded-md bg-gray-900 ${device.key === "desktop" ? "aspect-video" : "mx-auto aspect-[9/16] max-h-80"}`}>
                {mediaUrl ? (
                    mediaType === "video" ? (
                        <video key={mediaUrl} src={preview(mediaUrl)} muted loop autoPlay playsInline className="size-full object-cover" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview(mediaUrl)} alt="" className="size-full object-cover" />
                    )
                ) : (
                    <div className="flex size-full items-center justify-center text-sm text-gray-400">No media</div>
                )}
            </div>

            <div className="mt-4 flex gap-2">
                {[
                    ["image", "Photo", ImageIcon],
                    ["video", "Video", Video],
                ].map(([v, l, I]) => (
                    <button
                        key={v}
                        type="button"
                        onClick={() => setMediaType(v)}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${mediaType === v ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                        <I size={14} /> {l}
                    </button>
                ))}
            </div>

            <div className="mt-3 flex gap-2">
                <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder={mediaType === "video" ? "/videos/hero.mp4 or https://..." : "/images/hero.jpg or https://..."} className={field} />
                <input ref={fileRef} type="file" hidden accept={mediaType === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} onChange={(e) => upload(e.target.files?.[0])} />
                <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    <Upload size={14} /> Upload
                </button>
            </div>

            <button type="button" disabled={busy} onClick={save} className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {busy ? "Working..." : "Save"}
            </button>
        </div>
    );
}

export default function HeroContentManagement() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copy, setCopy] = useState({ title: "", subtitle: "", buttonText: "", buttonLink: "" });
    const [savingCopy, setSavingCopy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await heroApi.listContent(); // bare array
            const list = (Array.isArray(data) ? data : data?.data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setRecords(list);
            const first = list.find((r) => r.isActive) || list[0];
            if (first) setCopy({ title: first.title || "", subtitle: first.subtitle || "", buttonText: first.buttonText || "", buttonLink: first.buttonLink || "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load the hero");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const forDevice = (d) => records.find((r) => r.deviceType === d && r.isActive) || records.find((r) => r.deviceType === d);

    const saveCopy = async () => {
        if (!copy.title.trim() || !copy.subtitle.trim()) return toast.error("Headline and text are required");
        const targets = ["desktop", "mobile"].map(forDevice).filter(Boolean);
        if (!targets.length) return toast.error("Save a desktop or phone media first");
        setSavingCopy(true);
        try {
            await Promise.all(targets.map((r) => heroApi.updateContent(r._id, copy)));
            toast.success("Hero text saved");
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSavingCopy(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-sm text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Homepage hero</h1>
                    <p className="mt-1 text-sm text-gray-500">The full screen block at the top of the homepage. Changes are live within a minute.</p>
                </div>
                <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">Text and button</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-gray-700 sm:col-span-2">
                        Headline
                        <input className={`${field} mt-1`} value={copy.title} onChange={(e) => setCopy({ ...copy, title: e.target.value })} maxLength={80} />
                    </label>
                    <label className="block text-sm text-gray-700 sm:col-span-2">
                        Text
                        <textarea className={`${field} mt-1`} rows={2} value={copy.subtitle} onChange={(e) => setCopy({ ...copy, subtitle: e.target.value })} maxLength={200} />
                    </label>
                    <label className="block text-sm text-gray-700">
                        Button text
                        <input className={`${field} mt-1`} value={copy.buttonText} onChange={(e) => setCopy({ ...copy, buttonText: e.target.value })} />
                    </label>
                    <label className="block text-sm text-gray-700">
                        Button link
                        <input className={`${field} mt-1`} value={copy.buttonLink} onChange={(e) => setCopy({ ...copy, buttonLink: e.target.value })} placeholder="/shop?availability=pre_order" />
                    </label>
                </div>
                <button type="button" disabled={savingCopy} onClick={saveCopy} className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                    {savingCopy ? "Saving..." : "Save text"}
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {DEVICES.map((d) => {
                    const record = forDevice(d.key);
                    return <MediaCard key={`${d.key}-${record?._id || "new"}-${record?.updatedAt || ""}`} device={d} record={record} onSaved={load} />;
                })}
            </div>
        </div>
    );
}
