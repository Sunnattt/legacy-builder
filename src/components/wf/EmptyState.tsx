interface Props {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-mid bg-surface/50 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-3xl opacity-70">{icon}</div>}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-text-second">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
