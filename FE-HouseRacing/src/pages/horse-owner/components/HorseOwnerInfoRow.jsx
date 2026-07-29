const toneClasses = {
  red: {
    icon: "text-red-400",
    text: "text-red-300 font-semibold",
  },
  green: {
    icon: "text-emerald-400",
    text: "text-emerald-300 font-semibold",
  },
  default: {
    icon: "text-white/40",
    text: "text-white/60",
  },
};

export function HorseOwnerInfoRow({ icon: Icon, text, highlight, tone = "red" }) {
  const classes = highlight ? toneClasses[tone] ?? toneClasses.red : toneClasses.default;

  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`w-3.5 h-3.5 flex-shrink-0 ${classes.icon}`}
      />
      <span
        className={`text-xs ${classes.text}`}
      >
        {text}
      </span>
    </div>
  );
}
