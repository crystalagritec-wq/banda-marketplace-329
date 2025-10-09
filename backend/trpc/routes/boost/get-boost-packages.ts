import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getBoostPackagesSchema = z.object({
  type: z.enum(["product", "shop"]),
});

export const getBoostPackagesProcedure = publicProcedure
  .input(getBoostPackagesSchema)
  .query(async ({ input }) => {
    console.log("[getBoostPackages] Fetching packages for type:", input.type);

    const productPackages = [
      {
        id: "product_3d",
        name: "Quick Boost",
        duration: 3,
        price: 100,
        features: [
          "3 days visibility boost",
          "Appear in sponsored section",
          "Priority in search results",
        ],
        popular: false,
      },
      {
        id: "product_7d",
        name: "Standard Boost",
        duration: 7,
        price: 200,
        features: [
          "7 days visibility boost",
          "Appear in sponsored section",
          "Priority in search results",
          "Featured badge",
        ],
        popular: true,
      },
      {
        id: "product_14d",
        name: "Extended Boost",
        duration: 14,
        price: 350,
        features: [
          "14 days visibility boost",
          "Appear in sponsored section",
          "Priority in search results",
          "Featured badge",
          "Homepage placement",
        ],
        popular: false,
      },
      {
        id: "product_30d",
        name: "Premium Boost",
        duration: 30,
        price: 600,
        features: [
          "30 days visibility boost",
          "Appear in sponsored section",
          "Priority in search results",
          "Featured badge",
          "Homepage placement",
          "Category top placement",
        ],
        popular: false,
      },
    ];

    const shopPackages = [
      {
        id: "shop_7d",
        name: "Shop Starter",
        duration: 7,
        price: 500,
        features: [
          "7 days shop boost",
          "All products boosted",
          "Featured seller badge",
          "Priority in vendor listings",
        ],
        popular: false,
      },
      {
        id: "shop_14d",
        name: "Shop Standard",
        duration: 14,
        price: 900,
        features: [
          "14 days shop boost",
          "All products boosted",
          "Featured seller badge",
          "Priority in vendor listings",
          "Homepage shop carousel",
        ],
        popular: true,
      },
      {
        id: "shop_30d",
        name: "Shop Premium",
        duration: 30,
        price: 1500,
        features: [
          "30 days shop boost",
          "All products boosted",
          "Featured seller badge",
          "Priority in vendor listings",
          "Homepage shop carousel",
          "Category featured placement",
          "Dedicated support",
        ],
        popular: false,
      },
      {
        id: "shop_90d",
        name: "Shop Elite",
        duration: 90,
        price: 3500,
        features: [
          "90 days shop boost",
          "All products boosted",
          "Elite seller badge",
          "Top priority placement",
          "Homepage shop carousel",
          "Category featured placement",
          "Dedicated support",
          "Marketing assistance",
        ],
        popular: false,
      },
    ];

    const packages = input.type === "product" ? productPackages : shopPackages;

    return {
      success: true,
      packages,
    };
  });
