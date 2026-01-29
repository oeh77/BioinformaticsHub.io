/**
 * Affiliate Product Comparison Table
 * 
 * Compare multiple affiliate products side by side
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ExternalLink, Info, ChevronDown, ChevronUp } from "lucide-react";

export interface ComparisonProduct {
  id: string;
  name: string;
  partner: string;
  imageUrl?: string;
  price: number | null;
  pricingModel: "one_time" | "subscription" | "usage_based";
  currency?: string;
  affiliateUrl: string;
  shortCode?: string;
  isRecommended?: boolean;
  features: Record<string, boolean | string>;
}

export interface ProductComparisonTableProps {
  products: ComparisonProduct[];
  featureLabels: Record<string, string>;
  title?: string;
  showDisclosure?: boolean;
}

export function ProductComparisonTable({
  products,
  featureLabels,
  title = "Product Comparison",
  showDisclosure = true,
}: ProductComparisonTableProps) {
  const [expandedFeatures, setExpandedFeatures] = useState(false);
  const featureKeys = Object.keys(featureLabels);
  const visibleFeatures = expandedFeatures ? featureKeys : featureKeys.slice(0, 6);

  function formatPrice(product: ComparisonProduct): string {
    if (product.price === null) {
      return product.pricingModel === "usage_based" ? "Pay-per-use" : "Contact";
    }
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(product.price);

    if (product.pricingModel === "subscription") return `${formatted}/mo`;
    return formatted;
  }

  function renderFeatureValue(value: boolean | string) {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-400/50 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  }

  return (
    <div className="space-y-4">
      {/* Disclosure */}
      {showDisclosure && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
          <Info className="w-4 h-4 shrink-0" />
          <p>
            This comparison table contains affiliate links. We may earn a commission
            at no extra cost to you.{" "}
            <Link href="/affiliate/disclosure" className="underline">
              Learn more
            </Link>
          </p>
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-xl font-bold">{title}</h3>
      )}

      {/* Comparison Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header - Products */}
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-white/70 w-48">
                  Feature
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className={`p-4 text-center min-w-[200px] ${
                      product.isRecommended ? "bg-primary/10" : ""
                    }`}
                  >
                    {product.isRecommended && (
                      <span className="inline-block px-2 py-1 bg-primary rounded-full text-xs font-medium mb-2">
                        Recommended
                      </span>
                    )}
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 mx-auto mb-2 rounded-lg object-cover bg-white/10"
                      />
                    )}
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-white/60">{product.partner}</p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {/* Price Row */}
              <tr className="bg-white/5">
                <td className="p-4 font-medium">Price</td>
                {products.map((product) => (
                  <td
                    key={product.id}
                    className={`p-4 text-center ${
                      product.isRecommended ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Feature Rows */}
              {visibleFeatures.map((featureKey) => (
                <tr key={featureKey} className="hover:bg-white/5">
                  <td className="p-4 text-sm text-white/80">
                    {featureLabels[featureKey]}
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`p-4 text-center ${
                        product.isRecommended ? "bg-primary/5" : ""
                      }`}
                    >
                      {renderFeatureValue(product.features[featureKey])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            {/* Footer - CTA Buttons */}
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="p-4" />
                {products.map((product) => {
                  const trackingUrl = product.shortCode
                    ? `/go/${product.shortCode}`
                    : product.affiliateUrl;

                  return (
                    <td
                      key={product.id}
                      className={`p-4 ${product.isRecommended ? "bg-primary/5" : ""}`}
                    >
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener sponsored"
                        className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                          product.isRecommended
                            ? "bg-primary hover:bg-primary/80 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        View Details
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Expand/Collapse Features */}
        {featureKeys.length > 6 && (
          <button
            onClick={() => setExpandedFeatures(!expandedFeatures)}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
          >
            {expandedFeatures ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show All {featureKeys.length} Features <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Quick Comparison Widget
 * 
 * A compact comparison for 2-3 products
 */
export interface QuickComparisonProps {
  products: Array<{
    id: string;
    name: string;
    partner: string;
    price: number | null;
    pricingModel: "one_time" | "subscription" | "usage_based";
    affiliateUrl: string;
    shortCode?: string;
    highlights: string[];
    isRecommended?: boolean;
  }>;
  showDisclosure?: boolean;
}

export function QuickComparison({ products, showDisclosure = true }: QuickComparisonProps) {
  function formatPrice(product: QuickComparisonProps["products"][0]): string {
    if (product.price === null) {
      return product.pricingModel === "usage_based" ? "Usage-based" : "Contact";
    }
    if (product.pricingModel === "subscription") return `$${product.price}/mo`;
    return `$${product.price.toLocaleString()}`;
  }

  return (
    <div className="space-y-4">
      {showDisclosure && (
        <p className="text-xs text-white/40 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Contains affiliate links.{" "}
          <Link href="/affiliate/disclosure" className="underline">
            Learn more
          </Link>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => {
          const trackingUrl = product.shortCode
            ? `/go/${product.shortCode}`
            : product.affiliateUrl;

          return (
            <div
              key={product.id}
              className={`relative p-5 rounded-xl border transition-all ${
                product.isRecommended
                  ? "bg-primary/10 border-primary/50"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              {product.isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-xs font-medium">
                  Best Choice
                </span>
              )}

              <div className="text-center mb-4">
                <p className="text-sm text-white/60">{product.partner}</p>
                <h4 className="font-semibold text-lg">{product.name}</h4>
              </div>

              <p className="text-2xl font-bold text-center text-primary mb-4">
                {formatPrice(product)}
              </p>

              <ul className="space-y-2 mb-4">
                {product.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener sponsored"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-colors ${
                  product.isRecommended
                    ? "bg-primary hover:bg-primary/80"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                Learn More
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
