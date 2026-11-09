import Link from "next/link";

import { SITE } from "@/lib/site";

export default function NotFoundContent() {
    return (
        <section className="wrap grid min-h-[70vh] place-items-center py-20 text-center">
            <div>
                <p lang="bn" aria-hidden className="font-bangla text-[clamp(6rem,22vw,11rem)] leading-none text-mango">
                    ৪০৪
                </p>
                <h1 className="mt-6 text-h2 font-medium">This one has been picked already</h1>
                <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-muted">
                    The page you are looking for is not here. The link may be old, or the product is no longer listed.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                    <Link href="/shop" className="btn btn-ink">
                        Browse the shop
                    </Link>
                    <Link href="/" className="btn btn-ghost">
                        Back to home
                    </Link>
                </div>
                <p className="mt-10 text-sm text-muted">
                    Looking for something specific? Call <a href={SITE.phoneHref} className="num text-ink underline underline-offset-4">{SITE.phone}</a>
                </p>
            </div>
        </section>
    );
}
