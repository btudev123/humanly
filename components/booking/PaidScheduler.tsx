"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cal, { getCalApi } from "@calcom/embed-react";
import { CheckCircle2, Lock } from "lucide-react";
import { serviceProducts } from "@/lib/products";

export function PaidScheduler({
  order,
  calLink,
}: {
  order: {
    id: string;
    product_slug: string;
    customer_name: string;
    customer_email: string;
  };
  calLink: string;
}) {
  const product = serviceProducts.find((item) => item.slug === order.product_slug) || serviceProducts[0];
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: {
          branding: {
            brandColor: "#7c3aed",
          },
        },
      });

      // Final hop of the funnel: form → Stripe → Cal → /booking/done.
      // `bookingSuccessfulV2` is the supported event (`bookingSuccessful` is deprecated);
      // its payload is exactly what /booking/done renders.
      cal("on", {
        action: "bookingSuccessfulV2",
        callback: (event) => {
          const booking = event?.detail?.data;
          const params = new URLSearchParams();
          if (booking?.title) params.set("title", booking.title);
          if (booking?.startTime) params.set("startTime", booking.startTime);
          if (booking?.endTime) params.set("endTime", booking.endTime);
          if (booking?.uid) params.set("uid", booking.uid);
          params.set("attendeeName", order.customer_name);
          params.set("email", order.customer_email);

          const query = params.toString();
          router.push(query ? `/booking/done?${query}` : "/booking/done");
        },
      });
    })();
  }, [order.customer_name, order.customer_email, router]);

  return (
    <div className="mx-auto max-w-6xl px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <div className="mb-8 rounded-3xl border-2 border-primary-dark bg-[#25D366]/12 p-6 text-primary-dark">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 shrink-0 text-[#1da851]" size={22} />
          <div>
            <h1 className="text-h1 font-display font-bold">Payment confirmed. Choose your time.</h1>
            <p className="mt-1 text-neutral-500">
              This scheduling page is unlocked for {order.customer_email}. Your booking will be linked to order {order.id}.
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              Please note: your call may be recorded solely for the purpose of making notes.
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border-2 border-primary-dark bg-neutral-100 shadow-pop">
        <div className="flex items-center gap-3 bg-primary-dark px-6 py-4 text-on-primary">
          <Lock className="text-accent-orange" size={19} />
          <span className="text-sm font-bold uppercase tracking-[0.14em]">{product.name} scheduling</span>
        </div>
        <Cal
          calLink={calLink}
          className="h-[760px] w-full"
          config={{
            layout: "month_view",
            name: order.customer_name,
            email: order.customer_email,
            "metadata[orderId]": order.id,
            "metadata[source]": "paid-humanly-site",
          }}
        />
      </div>
    </div>
  );
}
