import { Button } from "@heroui/react";

export type ProfileSection = "overview" | "training" | "rackets";

export function SectionNavigation({
  activeSection,
  onChange,
  isOwner,
}: {
  activeSection: ProfileSection;
  onChange: (section: ProfileSection) => void;
  isOwner: boolean;
}) {
  // Training and Rackets are owner-only; other players see just the Overview.
  const sections: Array<{ key: ProfileSection; label: string }> = [
    { key: "overview", label: "Resumen" },
    ...(isOwner
      ? ([
          { key: "training", label: "Entrenamiento" },
          { key: "rackets", label: "Raquetas" },
        ] as const)
      : []),
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {sections.map((section) => (
        <Button
          key={section.key}
          variant={activeSection === section.key ? "primary" : "ghost"}
          className={activeSection === section.key ? "bg-court text-ball-bright" : "text-zinc-700"}
          onPress={() => onChange(section.key)}
        >
          {section.label}
        </Button>
      ))}
    </div>
  );
}
