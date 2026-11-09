"use client";
import Link from "next/link";
import { useEffect } from "react";

import { SITE } from "@/lib/site";

export default function StoreError({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <section className="wrap grid min-h-[65vh] place-items-center py-20 text-center">
            <div className="max-w-lg">
                <p className="label text-mango-deep">Something went wrong</p>
                <h1 className="mt-4 text-h2 font-medium">A crate slipped off the van</h1>
                <p className="mt-4 text-[16px] leading-relaxed text-muted">
                    This page did not load properly. It is usually a passing network problem, so trying again often works.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => reset()} className="btn btn-ink">
                        Try again
                    </button>
                    <Link href="/" className="btn btn-ghost">
                        Back to home
                    </Link>
                </div>
                <p className="mt-10 text-sm text-muted">
                    Still stuck? Call or WhatsApp <a href={SITE.phoneHref} className="num text-ink underline underline-offset-4">{SITE.phone}</a>
                    {error?.digest && <span className="mt-2 block text-[12px]">Reference {error.digest}</span>}
                </p>
            </div>
        </section>
    );
}
