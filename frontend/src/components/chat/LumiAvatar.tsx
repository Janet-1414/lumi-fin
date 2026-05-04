"use client";
export default function LumiAvatar({ size = 36 }: { size?: number }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className="rounded-full bg-mg-gold/20 border-2 border-mg-gold/40 flex items-center justify-center animate-pulse-gold"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.5 }}>💡</span>
      </div>
    </div>
  );
}
