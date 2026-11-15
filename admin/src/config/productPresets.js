// admin/src/config/productPresets.js
//
// Product form presets. CLIENT DATA, not base logic: each store replaces this
// file (an empty array hides the preset bar). A preset only fills form fields;
// nothing is stored about which preset was used, and every value stays
// editable. Numbers here are Aamkahon's working defaults, client to confirm.
//
// Fields:
//   unit, weight (kg per unit), minOrderQty, codAllowed, availability
//   packs: [{ value, weight }] -> one variant option (packOption) per pack
//   food: { shelfLifeDays, seasonMonths [1-12] }
//   attributes: shown as the product page fact list (Origin, Storage, ...)
export const PRODUCT_PRESETS = [
    {
        id: "mango",
        label: "Mango",
        unit: "box",
        // Payment follows the courier now (Admin > Couriers; AJR = prepaid),
        // so mango no longer forces online payment by itself.
        codAllowed: true,
        availability: "pre_order",
        packOption: "Pack",
        packs: [
            { value: "10 kg box", weight: 10.8 },
            { value: "20 kg box", weight: 21.5 },
        ],
        food: { shelfLifeDays: 5, seasonMonths: [5, 6, 7] },
        attributes: [
            { key: "Origin", value: "Rajshahi" },
            { key: "Storage", value: "Keep at room temperature until ripe, then refrigerate. Do not wash before storing." },
        ],
    },
    {
        id: "gur",
        label: "Khejurer gur",
        unit: "pack",
        availability: "in_stock",
        packOption: "Pack",
        packs: [
            { value: "1 kg", weight: 1.1 },
            { value: "2 kg", weight: 2.15 },
            { value: "5 kg", weight: 5.3 },
        ],
        food: { shelfLifeDays: 180, seasonMonths: [12, 1, 2] },
        attributes: [
            { key: "Origin", value: "Jashore" },
            { key: "Storage", value: "Airtight container in a cool, dry place. Liquid gur in the fridge." },
        ],
    },
    {
        id: "ghee",
        label: "Ghee",
        unit: "jar",
        availability: "in_stock",
        packOption: "Size",
        packs: [
            { value: "500 g", weight: 0.75 },
            { value: "1 kg", weight: 1.35 },
        ],
        food: { shelfLifeDays: 365, seasonMonths: [] },
        attributes: [
            { key: "Origin", value: "Rajshahi" },
            { key: "Storage", value: "Room temperature, lid closed. Use a dry spoon." },
        ],
    },
    {
        id: "achar",
        label: "Achar (pickle)",
        unit: "jar",
        availability: "in_stock",
        packOption: "Size",
        packs: [
            { value: "400 g", weight: 0.6 },
            { value: "800 g", weight: 1.1 },
        ],
        food: { shelfLifeDays: 270, seasonMonths: [] },
        attributes: [
            { key: "Origin", value: "Rajshahi" },
            { key: "Storage", value: "Keep the oil above the pickle. Dry spoon only, away from sunlight." },
        ],
    },
];

/**
 * Apply a preset to the product form state.
 * fillAll (new product): preset values replace the form defaults.
 * Otherwise (editing): only shelf life, season months (when blank) and missing
 * attribute rows are added; nothing already set is changed.
 * Packs (variants) are set on a NEW product only: on an existing product the
 * stock sits on the current variants/product and is changed on the Stock page,
 * so the form must not reshape it.
 * Attributes are merged by key in both cases.
 */
export function applyPreset(form, preset, { fillAll, emptyForm }) {
    const next = { ...form };
    // Unit, payment rule and availability have defaults, so "blank" cannot be
    // told apart from a choice on a saved product: set them on new ones only.
    if (fillAll) {
        for (const k of ["unit", "minOrderQty", "codAllowed", "availability"]) {
            next[k] = preset[k] !== undefined ? preset[k] : emptyForm[k];
        }
    }
    if (preset.food) {
        next.food = {
            shelfLifeDays: fillAll || form.food.shelfLifeDays === "" ? preset.food.shelfLifeDays ?? "" : form.food.shelfLifeDays,
            seasonMonths: fillAll || !form.food.seasonMonths.length ? [...(preset.food.seasonMonths || [])] : form.food.seasonMonths,
        };
    }
    const have = new Set(form.attributes.map((a) => a.key.trim().toLowerCase()));
    next.attributes = [...form.attributes, ...(preset.attributes || []).filter((a) => !have.has(a.key.toLowerCase())).map((a) => ({ ...a }))];

    if (preset.packs?.length && fillAll) {
        const name = preset.packOption || "Pack";
        next.hasVariants = true;
        next.variantOptions = [{ name, values: preset.packs.map((p) => p.value) }];
        next.variants = preset.packs.map((p, i) => ({
            options: [{ name, value: p.value }],
            basePrice: "",
            discountType: "none",
            discountValue: 0,
            stock: 0,
            sku: "",
            imageGroupName: "",
            order: i,
            wholesalePrice: "",
            weight: p.weight ?? "",
        }));
        // Weight lives on the packs; the product-level weight is the fallback.
        next.weight = preset.packs[0].weight ?? 0;
    }
    return next;
}
