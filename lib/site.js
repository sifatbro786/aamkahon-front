// Store identity. Content edits for the client go here (or into the seed),
// never into component markup.
export const SITE = {
    name: "Aamkahon",
    nameBn: "আমকাহন",
    legalName: "Aamkahon Agro",
    tagline: "The story of mangoes",
    phone: "01301-377225",
    phoneAlt: "01301-377226",
    phoneHref: "tel:+8801301377225",
    whatsapp: "https://wa.me/8801301377225",
    facebook: "https://www.facebook.com/AAMKAHON",
    location: "Rajshahi, Bangladesh",
    since: 2021,
    // Static on purpose: reading the clock in a server component opts the
    // whole layout out of prerendering under Cache Components.
    copyrightYear: 2026,
    // From the Facebook page bio, in the owner's words.
    bio: "আম কেবল একটি ফলের নাম নয় বরং আম জড়িয়ে থাকে আমাদের স্বপ্ন এবং সম্ভবনায় তাই এর শুদ্ধতা আমাদের অঙ্গীকার।",
};

export const whatsappText = (text) => `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
