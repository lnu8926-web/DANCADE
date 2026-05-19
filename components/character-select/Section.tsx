export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[30px]">
      <h3 className="text-lg mb-[15px] text-[#ffff00]">{title}</h3>
      {children}
    </div>
  );
}
