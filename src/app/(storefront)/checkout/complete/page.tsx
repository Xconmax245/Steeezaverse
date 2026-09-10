import { getSupabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: { reference?: string; gateway?: string };
}) {
  const reference = searchParams.reference;

  if (!reference) {
    redirect("/");
  }

  // Look up the order ID by payment reference
  const { data: order } = await (getSupabaseAdmin() as any)
    .from("orders")
    .select("id")
    .eq("payment_reference", reference)
    .single();

  if (!order) {
    redirect("/");
  }

  // Redirect to the semantic confirmation route
  redirect(`/checkout/confirmation/${order.id}`);
}
