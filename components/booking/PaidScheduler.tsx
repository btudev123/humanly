"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    void (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: {
          branding: {
            brandColor: "#7c35e3",
          },
        },
      });
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-28 md:px-[64px]">
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-5 text-green-800">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 shrink-0" size={22} />
          <div>
            <h1 className="text-2xl font-extrabold">Payment confirmed. Choose your time.</h1>
            <p className="mt-1 text-green-700">
              This scheduling page is unlocked for {order.customer_email}. Your booking will be linked to order {order.id}.
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm">
        <div className="flex items-center gap-3 bg-primary-dark px-6 py-4 text-white">
          <Lock className="text-amber" size={19} />
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
