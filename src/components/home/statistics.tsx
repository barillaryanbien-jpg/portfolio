import type { Statistic } from "@/types/portfolio";

export function Statistics({
  items,
  preserveLayout = false,
}: {
  items: Statistic[];
  preserveLayout?: boolean;
}) {
  if (!items.length)
    return preserveLayout ? (
      <div className="statistics statistics-empty" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <span className="skeleton stat-value" />
            <span className="skeleton stat-label" />
          </div>
        ))}
      </div>
    ) : null;
  return (
    <dl className="statistics">
      {items.map((item) => (
        <div key={item.id}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
