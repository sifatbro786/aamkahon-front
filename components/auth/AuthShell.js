import Image from "next/image";

export default function AuthShell({ title, intro, children, image = "/images/founder-orchard.jpg" }) {
    return (
        <div className="wrap grid gap-10 py-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="relative hidden aspect-[4/5] max-h-[640px] overflow-hidden rounded-card lg:block">
                <Image src={image} alt="" fill sizes="45vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-8 text-paper">
                    <p lang="bn" className="font-bangla text-2xl">আমকাহন</p>
                    <p className="mt-1 text-paper/75">The story of mangoes</p>
                </div>
            </div>
            <div className="mx-auto w-full max-w-md">
                <h1 className="text-h2 font-medium">{title}</h1>
                {intro && <p className="mt-3 text-[16px] text-muted">{intro}</p>}
                <div className="mt-8">{children}</div>
            </div>
        </div>
    );
}
