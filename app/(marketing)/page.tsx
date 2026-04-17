import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, Users, Award, Play, CheckCircle, Star,
  ArrowRight, Zap, Shield, TrendingUp, Globe, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookCarousel } from "@/components/books/book-carousel";
import { BuilderPageRenderer } from "@/components/page-builder/builder-page-renderer";
import { getPublishedBuilderPageByPath } from "@/lib/page-builder-store";

const features = [
  {
    icon: BookOpen,
    title: "Rich Course Content",
    description: "Video lessons, PDFs, assignments, and quizzes — all in one platform.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Track your learning journey with detailed analytics and completion certificates.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Users,
    title: "Community Discussions",
    description: "Engage with instructors and fellow learners through threaded discussions.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "Automated email sequences, drip campaigns, and marketing funnels.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Flexible Checkout",
    description: "Recurring subscriptions plus one-time checkout carts for books, resources, and special offers.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Issue branded completion certificates that students can share.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

const stats = [
  { value: "10,000+", label: "Active Learners" },
  { value: "150+", label: "Courses Available" },
  { value: "98%", label: "Student Satisfaction" },
  { value: "500+", label: "Lessons Completed Daily" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Ministry Leader",
    avatar: "S",
    quote:
      "Church Planting Movement transformed how I lead my community. The courses are practical, deep, and life-changing.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Church Pastor",
    avatar: "M",
    quote:
      "The platform is incredibly intuitive. My entire congregation uses it for discipleship training.",
    rating: 5,
  },
  {
    name: "Rachel Williams",
    role: "Youth Director",
    avatar: "R",
    quote:
      "As a youth leader, I needed engaging content. Church Planting Movement delivers that and so much more.",
    rating: 5,
  },
];

const plans = [
  {
    name: "Starter",
    price: 9,
    interval: "month",
    description: "Perfect for individuals beginning their journey",
    features: ["Access 20 courses", "Progress tracking", "Community access", "Certificate of completion"],
    cta: "Start Free Trial",
    href: "/register?plan=starter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: 29,
    interval: "month",
    description: "For dedicated learners who want everything",
    features: [
      "Unlimited courses",
      "Advanced analytics",
      "Priority support",
      "Downloadable resources",
      "Group discussions",
      "Monthly live Q&A",
    ],
    cta: "Start Free Trial",
    href: "/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Pro",
    price: 79,
    interval: "month",
    description: "For teams, churches and organizations",
    features: [
      "Everything in Growth",
      "Up to 50 team members",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "White-label certificates",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export default async function HomePage() {
  const publishedHomePage = await getPublishedBuilderPageByPath("/");
  if (publishedHomePage) {
    return <BuilderPageRenderer page={publishedHomePage} />;
  }

  return (
    <div>
      {/* ========================
          HERO SECTION
      ======================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-purple-900 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }} />
        </div>

        <div className="section-container relative py-24 md:py-36 text-center">
          <Badge className="mb-6 bg-brand-700/50 text-brand-200 border-brand-600">
            🚀 Now with AI-powered learning paths
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Learn. Grow.{" "}
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Transform.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-brand-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete platform for discipleship training — with courses, community, certificates,
            and powerful marketing tools built for ministries and organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-white text-brand-900 hover:bg-gray-100 font-semibold" asChild>
              <Link href="/register">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold"
              asChild
            >
              <Link href="/courses">
                <Play className="mr-2 h-5 w-5" />
                Browse Courses
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-brand-300">
            ✓ 14-day free trial &nbsp;·&nbsp; ✓ No credit card required &nbsp;·&nbsp; ✓ Cancel anytime
          </p>

          {/* Hero Image */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900">
              {/* Mock Dashboard Preview */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 mx-4 h-5 bg-gray-700 rounded text-xs text-gray-400 flex items-center px-3">
                  churchplantingmovement.com/dashboard
                </div>
              </div>
              <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 text-left">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Courses Enrolled", value: "12", color: "bg-blue-500" },
                    { label: "Lessons Completed", value: "87", color: "bg-emerald-500" },
                    { label: "Hours Learned", value: "34h", color: "bg-purple-500" },
                    { label: "Certificates", value: "3", color: "bg-amber-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-800 rounded-xl p-4">
                      <div className={`h-2 w-8 rounded ${stat.color} mb-2`}></div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["Foundations of Faith", "Leadership Mastery", "Discipleship 101"].map((course) => (
                    <div key={course} className="bg-gray-800 rounded-xl p-4">
                      <div className="h-24 bg-gradient-to-br from-brand-600 to-purple-700 rounded-lg mb-3"></div>
                      <p className="text-sm text-white font-medium">{course}</p>
                      <div className="mt-2 h-1.5 bg-gray-700 rounded-full">
                        <div
                          className="h-1.5 bg-brand-500 rounded-full"
                          style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================
          STATS SECTION
      ======================== */}
      <section className="bg-brand-600 text-white py-16">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-brand-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          FEATURES SECTION
      ======================== */}
      <section className="py-24 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="brand">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow your community
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A complete platform with all the tools for teaching, engaging,
              and monetizing your discipleship ministry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 shadow-sm card-hover">
                  <CardContent className="pt-6">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================
          HOW IT WORKS
      ======================== */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="brand">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up free in less than 60 seconds. No credit card needed.",
                icon: Users,
              },
              {
                step: "02",
                title: "Choose Your Courses",
                description: "Browse our full library and enroll in the courses that fit your journey.",
                icon: BookOpen,
              },
              {
                step: "03",
                title: "Learn & Grow",
                description: "Complete lessons, join discussions, earn certificates, and track your progress.",
                icon: TrendingUp,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center p-6">
                  <div className="relative inline-block mb-6">
                    <div className="h-16 w-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
                      <Icon className="h-8 w-8 text-brand-600" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                      {item.step.replace("0", "")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================
          BOOK STORE
      ======================== */}
      <section className="overflow-hidden bg-amber-50 py-24">
        <div className="section-container">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-4" variant="brand">Book Store</Badge>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Add books to a separate checkout cart, not just subscriptions.
              </h2>
              <p className="mt-4 text-gray-600">
                Showcase one-time digital book purchases on the landing page with visible sample pricing.
                Each title opens a checkout flow that feeds the same cart students can access from their dashboard.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Storefront demo</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">Live published books</p>
              <p className="mt-1 text-sm text-gray-500">Animated carousel, admin-managed catalog, direct checkout entry</p>
            </div>
          </div>

          <BookCarousel />

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button size="lg" variant="brand" asChild>
              <Link href="/checkout">
                Explore Book Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="brand-outline" asChild>
              <Link href="/dashboard">See Student Cart Experience</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================
          TESTIMONIALS
      ======================== */}
      <section className="py-24 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="brand">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by thousands of learners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          PRICING SECTION
      ======================== */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="brand">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 relative ${
                  plan.highlighted
                    ? "bg-brand-600 text-white shadow-xl shadow-brand-200 scale-105"
                    : "bg-white border-2 border-gray-100"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-400 text-amber-900 border-0 shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <h3 className={`font-bold text-xl mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-brand-200" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-brand-200" : "text-gray-500"}`}>
                    /{plan.interval}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "text-brand-200" : "text-brand-500"
                        }`}
                      />
                      <span className={plan.highlighted ? "text-brand-100" : "text-gray-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-white text-brand-700 hover:bg-gray-100"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                  size="lg"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          CTA SECTION
      ======================== */}
      <section className="py-24 bg-gradient-to-r from-brand-600 to-purple-700 text-white text-center">
        <div className="section-container">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to transform your journey?
          </h2>
          <p className="text-brand-200 text-lg max-w-xl mx-auto mb-10">
            Join thousands of learners who are growing in faith, leadership, and purpose.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-white text-brand-700 hover:bg-gray-100 font-semibold" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/pricing">See All Plans</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-brand-300">
            14-day free trial · No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
