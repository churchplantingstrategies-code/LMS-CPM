import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: { monthly: 9, yearly: 7 },
    description: "Step into your learning journey with essential tools.",
    features: [
      "Access to 20+ courses",
      "Progress tracking dashboard",
      "Community forum access",
      "Completion certificates",
      "Mobile-friendly access",
      "Email support",
    ],
    notIncluded: [
      "Unlimited courses",
      "Priority support",
      "Team management",
      "Custom branding",
    ],
  },
  {
    name: "Growth",
    slug: "growth",
    price: { monthly: 29, yearly: 23 },
    description: "For serious learners ready to go all-in.",
    features: [
      "Unlimited course access",
      "Advanced analytics",
      "Priority email & chat support",
      "Downloadable lesson resources",
      "Live Q&A sessions (monthly)",
      "Discussion moderation tools",
      "Custom learning paths",
      "API access",
    ],
    notIncluded: [
      "Team management",
      "Custom branding",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    slug: "pro",
    price: { monthly: 79, yearly: 63 },
    description: "Built for churches and organizations.",
    features: [
      "Everything in Growth",
      "Up to 50 team members",
      "Custom domain & branding",
      "Bulk enrollment tools",
      "White-label certificates",
      "Dedicated account manager",
      "Advanced reporting",
      "Webhook integrations",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes, you can cancel anytime. Your access will continue until the end of your current billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! All plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards through Stripe. Bank transfers available for annual Pro plans.",
  },
  {
    q: "Can I switch plans?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Prorated billing applies.",
  },
  {
    q: "Do you offer discounts for non-profits or churches?",
    a: "Yes! We offer a 30% discount for verified non-profits and churches. Contact us to apply.",
  },
];

export default function PricingPage() {
  return (
    <div className="py-24">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="brand">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Invest in your growth
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Simple pricing with no hidden fees. Start free, scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-sm font-medium text-gray-900">Monthly</span>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-600 cursor-pointer">
            <span className="h-4 w-4 translate-x-6 rounded-full bg-white shadow transition-transform block" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            Yearly{" "}
            <Badge variant="success" className="ml-1">Save 20%</Badge>
          </span>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 relative flex flex-col ${
                plan.highlighted
                  ? "bg-brand-600 text-white shadow-2xl shadow-brand-200 ring-2 ring-brand-500"
                  : "bg-white border-2 border-gray-100"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h2>
                <p className={`text-sm ${plan.highlighted ? "text-brand-200" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  ${plan.price.monthly}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-brand-200" : "text-gray-500"}`}>
                  /month
                </span>
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? "bg-white text-brand-700 hover:bg-gray-100"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
                size="lg"
                asChild
              >
                <Link href={`/register?plan=${plan.slug}`}>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${plan.highlighted ? "text-brand-200" : "text-gray-400"}`}>
                  What&apos;s included
                </p>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-green-300" : "text-emerald-500"}`} />
                      <span className={plan.highlighted ? "text-brand-100" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="border rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
