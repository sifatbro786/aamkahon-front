// admin/src/config/productFields.js
//
// Which generic product form fields this store uses. CLIENT DATA: the schema
// and API keep every field (other stores on the same base need them); this only
// hides inputs that do nothing on this storefront. false = hidden in the
// product form and the product view; saved values are left as they are.
//
// Aamkahon (food, weight-based courier shipping):
//   brand          all products are Aamkahon's own; JSON-LD brand is fixed
//   dimensions     shipping is by weight only, no volumetric rates
//   shippingClass  no checkout or rate logic reads it
//   metaKeywords   search engines ignore the keywords meta tag
//   featured       homepage curation is done in Product Sections
export const PRODUCT_FIELDS = {
    brand: false,
    dimensions: false,
    shippingClass: false,
    metaKeywords: false,
    featured: false,
};
