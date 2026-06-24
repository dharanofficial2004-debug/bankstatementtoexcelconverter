import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Saved me 3 hours every month reconciling client statements. The live preview is a game changer.",
    name: "Priya Sharma",
    role: "CA Firm Owner",
    stars: 5,
  },
  {
    quote:
      "Finally a tool that shows preview before downloading. I can fix errors before exporting. Brilliant!",
    name: "David Chen",
    role: "Bookkeeper",
    stars: 5,
  },
  {
    quote:
      "Works perfectly with my HDFC and SBI statements. The editing feature is exactly what I needed.",
    name: "Rajesh Kumar",
    role: "Small Business Owner",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 bg-slate-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Loved by accountants and business owners
          </h2>
          <p className="text-lg text-slate-500">
            Join thousands of professionals who save time every month
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100
                shadow-sm hover:shadow-premium transition-all duration-300
                hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
