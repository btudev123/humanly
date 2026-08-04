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
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-margin-mobile md:px-margin-desktop md:pb-24 md:pt-40">
      <div className="mb-6 rounded-3xl border-2 border-primary-dark bg-[#25D366]/12 p-5 text-primary-dark sm:p-6 md:mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 shrink-0 text-[#1da851]" size={22} />
          <div className="min-w-0">
            <h1 className="text-h1 font-display font-bold">Payment confirmed. Choose your time.</h1>
            <p className="mt-1 break-words text-neutral-500">
              This scheduling page is unlocked for {order.customer_email}. Your booking will be linked to order {order.id}.
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              Please note: your call may be recorded solely for the purpose of making notes.
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border-2 border-primary-dark bg-neutral-100 shadow-pop">
        <div className="flex items-center gap-3 bg-primary-dark px-4 py-3 text-on-primary sm:px-6 sm:py-4">
          <Lock className="shrink-0 text-accent-orange" size={19} />
          <span className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.14em] sm:text-sm">
            {product.name} scheduling
          </span>
        </div>
        {/*
          No fixed height. Cal sets the iframe height itself from `__dimensionChanged`
          once the booker knows how tall it is at the rendered width, and that differs
          enormously by device: ~1145px stacked on a phone against ~538px side-by-side
          on a laptop. Pinning the container (the old `h-[760px]`) was wrong at every
          breakpoint — it clipped ~600px off a phone and left ~220px dead on a desktop.
          The `min-h` is only a placeholder so the card doesn't collapse while loading.
        */}
        <Cal
          calLink={calLink}
          className="w-full min-h-[32rem]"
          style={{ colorScheme: "light" }}
          config={{
            layout: "month_view",
            // The site has no dark mode. Left to itself the embed copies the
            // container's computed `color-scheme`, so a visitor whose OS is in dark
            // mode got a black calendar inside a cream card. Pinned to match the page.
            "ui.color-scheme": "light",
            theme: "light",
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
