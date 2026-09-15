import { getDropProducts } from "@/lib/products";
import DropSectionClient from "./DropSectionClient";

export default async function DropSection() {
  const drops = await getDropProducts();
  const nextDrop = drops[0] || null;

  // Render the Store Launch drop section regardless of DB drops
  return <DropSectionClient drop={nextDrop} />;
}
