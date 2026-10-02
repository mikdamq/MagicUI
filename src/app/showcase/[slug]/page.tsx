import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, registry } from "@/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/showcase/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  return item ? { title: item.title, description: item.description } : {};
}

export default async function ShowcasePage({
  params,
}: PageProps<"/showcase/[slug]">) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  const { default: Piece } = await item.load();

  return (
    <>
      <Link
        href="/"
        className="fixed top-4 left-4 z-[100] rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 font-mono text-xs text-white/80 backdrop-blur-md transition-colors hover:text-white"
      >
        ← Gallery
      </Link>
      <Piece />
    </>
  );
}
