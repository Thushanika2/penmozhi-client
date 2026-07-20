import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh lg:grid lg:grid-cols-2">
      <div className="gradient-mesh relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <BrandLogo size="lg" showTagline />
        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Your wellness journey, beautifully guided
          </h2>
          <p className="text-muted-foreground">
            Track cycles, symptoms, and reminders with a calm, bilingual experience
            designed for Tamil and English speakers.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Cycle tracking", "AI insights", "Private forum", "Education"].map(
              (item) => (
                <span
                  key={item}
                  className="glass-panel rounded-full px-3 py-1 text-xs font-medium text-foreground"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="relative z-10 flex justify-center">
          <BrandLogo linked={false} size="xl" className="items-center opacity-95" />
        </div>
      </div>

      <div className="relative flex min-h-svh items-center justify-center p-4 sm:p-8">
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
