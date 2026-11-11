import DeliveryBlock from "@/components/home/DeliveryBlock";
import FaqBlock from "@/components/home/FaqBlock";
import IntroLoader from "@/components/home/IntroLoader";
import HarvestCalendar from "@/components/home/HarvestCalendar";
import Hero from "@/components/home/Hero";
import OrchardReels from "@/components/home/OrchardReels";
import ProductShelf from "@/components/home/ProductShelf";
import SeasonBoard from "@/components/home/SeasonBoard";
import StoryBlock from "@/components/home/StoryBlock";
import Testimonials from "@/components/home/Testimonials";
import WholesaleBand from "@/components/home/WholesaleBand";
import { getFaqs, getFeaturedReviews, getHero, getHomepageSections, getProducts, getShippingRates, getStorefront } from "@/lib/data/catalog";
import { dayMonth } from "@/lib/format";
import { wholesaleTier } from "@/lib/store/productView";

// Homepage section -> catalogue link, by the attribute the section filters on.
const sectionHref = (s) =>
    s.attributeKey === "Season" && /pre-?booking/i.test(s.attributeValue)
        ? "/shop?availability=pre_order"
        : s.attributeKey === "Season" && /winter/i.test(s.attributeValue)
          ? "/shop?category=khejurer-gur"
          : "/shop";

export default async function HomePage() {
    const [hero, sections, preOrder, rates, quotes, storefront, faqs] = await Promise.all([
        getHero(),
        getHomepageSections(),
        getProducts({ availability: "pre_order", limit: 50, sortBy: "displayOrder", sortOrder: "asc" }),
        getShippingRates(),
        getFeaturedReviews(6),
        getStorefront(),
        getFaqs({ homepage: true }),
    ]);
    // Block switches for the active season (Admin > Homepage & season).
    // Missing = shown, so an empty settings document keeps today's homepage.
    const content = storefront.content;
    const show = (key) => content.blocks?.[key] !== false;

    const calendar = preOrder.products;
    const byDate = calendar
        .filter((p) => p.preOrder?.expectedDate && p.priceVisibility === "show")
        .sort((a, b) => new Date(a.preOrder.expectedDate) - new Date(b.preOrder.expectedDate));
    const nextHarvest = byDate[0] || null;
    const advance = nextHarvest?.preOrder?.advancePercent ?? 25;

    // A real product with a wholesale tier, to explain wholesale with numbers.
    const pool = sections.flatMap((s) => s.products || []);
    const example = pool.find((p) => wholesaleTier(p)) || null;

    const [first, ...rest] = sections;

    return (
        <>
            <IntroLoader />
            <Hero hero={hero} copy={content} nextHarvest={nextHarvest} />
            {show("seasonBoard") && <SeasonBoard advancePercent={advance} firstHarvest={nextHarvest ? dayMonth(nextHarvest.preOrder.expectedDate) : null} />}
            {first && <ProductShelf section={first} href={sectionHref(first)} />}
            {show("harvestCalendar") && <HarvestCalendar products={calendar} />}
            {rest.map((s) => (
                <ProductShelf key={s._id} section={s} href={sectionHref(s)} />
            ))}
            {show("wholesaleBand") && <WholesaleBand example={example} />}
            {show("testimonials") && <Testimonials reviews={quotes} />}
            {show("orchardReels") && <OrchardReels />}
            {show("delivery") && <DeliveryBlock rates={rates} />}
            {show("faq") && <FaqBlock faqs={faqs.slice(0, 6)} />}
            {show("story") && <StoryBlock story={storefront.story} />}
        </>
    );
}
