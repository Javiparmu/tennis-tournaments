import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Decouple from the toast/UI layer: notify.ts imports @heroui/react, which we
// don't want to pull into the node test env. We only assert it was called.
vi.mock("./notify", () => ({ notifyMutationError: vi.fn() }));

import { notifyMutationError } from "./notify";
import { mergeDefined, optimistic, removeById, updateById } from "./optimistic";

// The factory returns react-query lifecycle callbacks whose full generic
// signatures are noisy to reproduce here; drive them through a loose shape.
type Handlers = {
  onMutate: (vars: unknown) => Promise<{ snapshots: Array<{ key: unknown; previous: unknown }> }>;
  onError: (error: unknown, vars: unknown, context: unknown) => void;
  onSettled: (data: unknown, error: unknown, vars: unknown) => void;
};

type Entity = { id: number; name: string };

const ME_KEY = ["user", "me"] as const;
const MISSING_KEY = ["user", "missing"] as const;
const ROOT_KEY = ["user"] as const;

function makeHandlers(qc: QueryClient) {
  return optimistic<{ name: string }, Entity>(qc, {
    targets: (_vars) => [
      // Present cache → merged optimistically.
      { key: ME_KEY, patch: (prev, v) => (prev ? { ...(prev as Entity), name: v.name } : prev) },
      // Absent cache → patch returns `previous` unchanged → skipped (no snapshot).
      { key: MISSING_KEY, patch: (prev) => prev },
    ],
    invalidate: () => [ROOT_KEY],
  }) as unknown as Handlers;
}

describe("optimistic", () => {
  beforeEach(() => {
    vi.mocked(notifyMutationError).mockClear();
  });

  it("paints cached targets, snapshots them, and skips unchanged ones", async () => {
    const qc = new QueryClient();
    qc.setQueryData(ME_KEY, { id: 1, name: "Old" });

    const context = await makeHandlers(qc).onMutate({ name: "New" });

    expect(qc.getQueryData(ME_KEY)).toEqual({ id: 1, name: "New" });
    // Only the present cache is snapshotted; the missing/unchanged one is skipped.
    expect(context.snapshots).toHaveLength(1);
    expect(context.snapshots[0].previous).toEqual({ id: 1, name: "Old" });
    expect(qc.getQueryData(MISSING_KEY)).toBeUndefined();
  });

  it("rolls every snapshot back and surfaces a toast on error", async () => {
    const qc = new QueryClient();
    qc.setQueryData(ME_KEY, { id: 1, name: "Old" });
    const handlers = makeHandlers(qc);

    const context = await handlers.onMutate({ name: "New" });
    handlers.onError(new Error("boom"), { name: "New" }, context);

    expect(qc.getQueryData(ME_KEY)).toEqual({ id: 1, name: "Old" });
    expect(notifyMutationError).toHaveBeenCalledTimes(1);
  });

  it("invalidates reconcile keys on settle without awaiting", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries").mockResolvedValue(undefined);

    makeHandlers(qc).onSettled(undefined, null, { name: "New" });

    expect(spy).toHaveBeenCalledWith({ queryKey: ROOT_KEY });
  });
});

describe("mergeDefined", () => {
  it("applies only defined keys and leaves the rest intact", () => {
    const entity = { id: 1, name: "Old", phoneNumber: "123", address: "A st" };
    const merged = mergeDefined(entity, { id: 1, name: "New", address: undefined });
    expect(merged).toEqual({ id: 1, name: "New", phoneNumber: "123", address: "A st" });
    expect(merged).not.toBe(entity);
  });

  it("keeps explicit null values (an intentional clear)", () => {
    const merged = mergeDefined({ id: 1, phoneNumber: "123" }, { phoneNumber: null });
    expect(merged.phoneNumber).toBeNull();
  });
});

describe("updateById / removeById", () => {
  const list = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ];

  it("updates the matching row only", () => {
    expect(updateById(list, 2, (row) => ({ ...row, name: "B2" }))).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "B2" },
    ]);
  });

  it("removes the matching row", () => {
    expect(removeById(list, 1)).toEqual([{ id: 2, name: "B" }]);
  });

  it("returns undefined untouched when the cache is empty", () => {
    expect(updateById(undefined, 1, (row) => row)).toBeUndefined();
    expect(removeById(undefined, 1)).toBeUndefined();
  });
});
