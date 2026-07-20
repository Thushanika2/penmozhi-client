interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
