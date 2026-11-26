export function SectionHead({
  number,
  title,
  intro,
}: {
  number?: string;
  title: string;
  intro?: string;
}) {
  return (
    <>
      <div className="mb-1.5 flex items-center gap-3">
        {number && (
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-blue-line bg-blue-soft text-[0.9rem] font-extrabold text-blue">
            {number}
          </span>
        )}
        <h2 className="m-0 text-[1.6rem] font-extrabold tracking-tight text-navy">
          {title}
        </h2>
      </div>
      {intro && (
        <p className={`mb-5 text-muted ${number ? "ml-11" : ""}`}>{intro}</p>
      )}
    </>
  );
}
