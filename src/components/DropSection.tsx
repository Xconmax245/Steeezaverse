import { getDropProducts } from "@/lib/products";
import DropSectionClient from "./DropSectionClient";

export default async function DropSection() {
  const drops = await getDropProducts();
  const nextDrop = drops[0] || null;

  if (!nextDrop) {
    return null;
  }

  return <DropSectionClient drop={nextDrop} />;
}
