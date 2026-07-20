import Image from "next/image";

export function Testimonial() {
  return (
    <section className="relative overflow-hidden py-24 px-6 bg-gradient-to-br from-[#E0F2FE] via-[#F3E8FF] to-[#EFF6FF]">
      {/* Background soft glow shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#7C5CFC]/10 to-[#61A8FF]/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Quote Mark */}
        <span className="text-[120px] font-serif font-black text-accent/20 select-none leading-none h-[60px]">
          &ldquo;
        </span>

        {/* Testimonial Quote */}
        <blockquote className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-text-primary leading-snug max-w-3xl">
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
          dashboard to see interviews waiting. It feels like cheating.&rdquo;
        </blockquote>

        {/* User Info */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
            <Image
              src="/images/user-icon.png"
              alt="Tom Wilson"
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-4">
            <cite className="not-italic text-sm font-semibold text-text-primary block">
              Tom Wilson
            </cite>
            <span className="text-xs font-medium text-text-secondary">
              Junior Developer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
