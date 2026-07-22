interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="section-eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
