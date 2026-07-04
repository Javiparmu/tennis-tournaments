"use client";

import { Button, Form } from "@heroui/react";
import { useState } from "react";
import type { CreatePhaseRequest, PhaseConfiguration, PhaseFormat, SeedingStrategy } from "@/models";
import { ModalShell, inputClass } from "@/components/modal-shell";

type PhaseFormModalProps = {
  defaultOrder: number;
  onClose: () => void;
  onSubmit: (payload: CreatePhaseRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

const FORMATS: PhaseFormat[] = ["KNOCKOUT", "GROUP", "SWISS"];
const SEEDING: SeedingStrategy[] = ["INPUT_ORDER", "RANDOM", "PARTIAL_SEEDED"];

const FORMAT_LABEL: Record<PhaseFormat, string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};

const SEEDING_LABEL: Record<SeedingStrategy, string> = {
  INPUT_ORDER: "Orden de entrada",
  RANDOM: "Aleatorio",
  PARTIAL_SEEDED: "Parcialmente sembrado",
};

export function PhaseFormModal({ defaultOrder, onClose, onSubmit, isSubmitting, submitError }: PhaseFormModalProps) {
  const [phaseOrder, setPhaseOrder] = useState(`${defaultOrder}`);
  const [format, setFormat] = useState<PhaseFormat>("KNOCKOUT");
  // Knockout
  const [thirdPlacePlayoff, setThirdPlacePlayoff] = useState(false);
  const [qualifiers, setQualifiers] = useState("1");
  const [seedingStrategy, setSeedingStrategy] = useState<SeedingStrategy>("INPUT_ORDER");
  // Group
  const [groupCount, setGroupCount] = useState("2");
  const [teamsPerGroup, setTeamsPerGroup] = useState("4");
  const [advancingPerGroup, setAdvancingPerGroup] = useState("2");
  // Swiss
  const [pointsPerWin, setPointsPerWin] = useState("1");
  const [advancingCount, setAdvancingCount] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function buildConfiguration(): PhaseConfiguration {
    if (format === "KNOCKOUT") {
      return { type: "knockout", thirdPlacePlayoff, qualifiers: Number(qualifiers), seedingStrategy };
    }
    if (format === "GROUP") {
      return {
        type: "group",
        groupCount: Number(groupCount),
        teamsPerGroup: Number(teamsPerGroup),
        advancingPerGroup: Number(advancingPerGroup),
      };
    }
    return {
      type: "swiss",
      pointsPerWin: Number(pointsPerWin),
      advancingCount: advancingCount ? Number(advancingCount) : null,
    };
  }

  return (
    <ModalShell title="Añadir fase" subtitle="Define el formato y la configuración de esta fase." onClose={onClose} disabled={isSubmitting}>
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          const order = Number(phaseOrder);
          if (!Number.isInteger(order) || order <= 0) {
            setValidationError("El orden de la fase debe ser un entero positivo.");
            return;
          }
          await onSubmit({ phaseOrder: order, format, configuration: buildConfiguration() });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Orden de fase</span>
            <input required type="number" min="1" value={phaseOrder} onChange={(e) => setPhaseOrder(e.target.value)} className={inputClass} />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Formato</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as PhaseFormat)} className={inputClass}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABEL[f]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {format === "KNOCKOUT" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Clasificados</span>
              <input type="number" min="1" value={qualifiers} onChange={(e) => setQualifiers(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Sorteo</span>
              <select value={seedingStrategy} onChange={(e) => setSeedingStrategy(e.target.value as SeedingStrategy)} className={inputClass}>
                {SEEDING.map((s) => (
                  <option key={s} value={s}>
                    {SEEDING_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
              <input type="checkbox" checked={thirdPlacePlayoff} onChange={(e) => setThirdPlacePlayoff(e.target.checked)} />
              <span>Partido por el tercer puesto</span>
            </label>
          </div>
        ) : null}

        {format === "GROUP" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Grupos</span>
              <input type="number" min="1" value={groupCount} onChange={(e) => setGroupCount(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Equipos / grupo</span>
              <input type="number" min="2" value={teamsPerGroup} onChange={(e) => setTeamsPerGroup(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Avanzan</span>
              <input type="number" min="1" value={advancingPerGroup} onChange={(e) => setAdvancingPerGroup(e.target.value)} className={inputClass} />
            </label>
          </div>
        ) : null}

        {format === "SWISS" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Puntos por victoria</span>
              <input type="number" min="1" value={pointsPerWin} onChange={(e) => setPointsPerWin(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Avanzan (opcional)</span>
              <input type="number" min="1" value={advancingCount} onChange={(e) => setAdvancingCount(e.target.value)} className={inputClass} />
            </label>
          </div>
        ) : null}

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Añadir fase
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}
