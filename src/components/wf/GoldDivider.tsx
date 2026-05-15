export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        height: 1,
        background:
          "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)",
      }}
    />
  );
}
