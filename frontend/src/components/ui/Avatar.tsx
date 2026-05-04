interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ name, size = "md" }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

  return (
    <div className={`${sizes[size]} rounded-full bg-mg-gold/20 border border-mg-gold/40 flex items-center justify-center font-semibold text-mg-gold`}>
      {initials}
    </div>
  );
}
