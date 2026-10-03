import type { Metadata } from "next";
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

  return <Piece />;
}
