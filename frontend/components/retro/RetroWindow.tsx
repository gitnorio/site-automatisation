import type { ReactNode } from "react";

type RetroWindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
  controls?: boolean;
};

export function RetroWindow({
  title,
  children,
  className = "",
  headingLevel = "h2",
  controls = false,
}: RetroWindowProps) {
  const Heading = headingLevel;
  return (
    <section className={`retro-window ${className}`}>
      <div className="retro-titlebar">
        <Heading className="retro-titlebar__title">{title}</Heading>
        {controls ? (
          <div className="retro-titlebar__controls" aria-hidden="true">
            <span>_</span><span>□</span><span>×</span>
          </div>
        ) : null}
      </div>
      <div className="retro-window__body">{children}</div>
    </section>
  );
}

