export function Capabilities() {
  const items = [
    {
      title: "Find jobs that actually fit",
      description:
        "AI-powered role discovery filters through the noise to surface high-match opportunities tailored to your unique skill profile.",
      icon: (
        <svg
          className="w-6 h-6 text-info-dark"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      bgColor: "bg-info-lightest",
    },
    {
      title: "Know the Company",
      description:
        "Instant AI-generated company dossiers provide insider insights, recent funding news, and cultural assessments in seconds.",
      icon: (
        <svg
          className="w-6 h-6 text-info"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      bgColor: "bg-[#EFF6FF]",
    },
    {
      title: "Keep Track",
      description:
        "A clear, centralized view of every application pipeline. Never lose track of where you stand in the hiring process again.",
      icon: (
        <svg
          className="w-6 h-6 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      bgColor: "bg-accent-light",
    },
  ];

  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent leading-5">
            Capabilities
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-text-primary">
            Built for modern job hunters
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-surface border border-border rounded-2xl p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:shadow-md duration-300"
            >
              {/* Icon Wrapper */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor} mb-6`}
              >
                {item.icon}
              </div>

              {/* Card Title */}
              <h3 className="text-base font-semibold text-text-primary mb-3">
                {item.title}
              </h3>

              {/* Card Description */}
              <p className="text-sm font-medium text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
