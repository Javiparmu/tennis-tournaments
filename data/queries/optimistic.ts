"use client";

import type { QueryClient, QueryKey, UseMutationOptions } from "@tanstack/react-query";
import { notifyMutationError } from "./notify";

// One optimistic cache to paint. `patch` is a pure updater: it receives the
// currently-cached value (cast inside — react-query stores it as `unknown` here)
// and returns the optimistic replacement. Return `previous` unchanged to skip
// (e.g. when the query isn't cached yet), and the target is ignored — nothing is
// snapshotted or rolled back for it.
export type OptimisticTarget<TVars> = {
  key: QueryKey;
  patch: (previous: unknown, vars: TVars) => unknown;
};

export type OptimisticConfig<TVars, TData> = {
  // Entity/list caches to paint immediately, derived from the mutation vars.
  // Omit for mutations that only need background reconcile (e.g. most creates).
  targets?: (vars: TVars) => OptimisticTarget<TVars>[];
  // Broad *Root / entity keys to invalidate once the write settles. Receives the
  // vars and, on success, the server response so it can key off the returned id.
  // NoInfer keeps TData tied to the explicit type argument (or its `unknown`
  // default) — inferring it from this param collapses it to `never`.
  invalidate: (vars: TVars, data: NoInfer<TData> | undefined) => QueryKey[];
};

type Snapshot = { key: QueryKey; previous: unknown };
type OptimisticContext = { snapshots: Snapshot[] };

// --- Pure patch helpers (shared by the mutation hooks) ---------------------
// Kept side-effect-free and framework-free so they're unit-testable and reusable
// across differently-shaped entity/list caches.

// Shallow-merge only the *defined* keys of `changes` onto `entity`. Update DTOs
// carry `undefined` for untouched fields (and often the entity's own `id`); this
// applies the real edits without clobbering the rest.
export function mergeDefined<T extends object>(entity: T, changes: Record<string, unknown>): T {
  const next = { ...(entity as Record<string, unknown>) };
  for (const [key, value] of Object.entries(changes)) {
    if (value !== undefined) next[key] = value;
  }
  return next as T;
}

// Replace the item with matching id in a cached list (no-op if the list isn't
// cached yet — returns the input so the optimistic wrapper skips it).
export function updateById<T extends { id: number }>(
  list: readonly T[] | undefined,
  id: number,
  update: (item: T) => T,
): T[] | undefined {
  if (!list) return list as undefined;
  return list.map((item) => (item.id === id ? update(item) : item));
}

// Drop the item with matching id from a cached list.
export function removeById<T extends { id: number }>(list: readonly T[] | undefined, id: number): T[] | undefined {
  if (!list) return list as undefined;
  return list.filter((item) => item.id !== id);
}

// Shared optimistic-mutation wiring, applied to every create/update/delete hook:
//   onMutate  — cancel in-flight, snapshot, paint the optimistic value into cache
//   onError   — roll back every snapshot, then surface a danger toast
//   onSettled — invalidate the reconcile keys WITHOUT awaiting, so `mutateAsync`
//               resolves as soon as the write returns and the modal closes now;
//               the authoritative refetch lands in the background.
//
// This replaces the old `onSuccess: await invalidateQueries(...)` pattern, whose
// awaited refetch blocked the modal an extra 1–3 backend round-trips per save.
export function optimistic<TVars, TData = unknown, TError = Error>(
  queryClient: QueryClient,
  config: OptimisticConfig<TVars, TData>,
): Pick<UseMutationOptions<TData, TError, TVars, OptimisticContext>, "onMutate" | "onError" | "onSettled"> {
  return {
    async onMutate(vars) {
      const targets = config.targets?.(vars) ?? [];
      const snapshots: Snapshot[] = [];
      for (const { key, patch } of targets) {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData(key);
        const next = patch(previous, vars);
        if (next === previous) continue;
        snapshots.push({ key, previous });
        queryClient.setQueryData(key, next);
      }
      return { snapshots };
    },
    onError(error, _vars, context) {
      for (const { key, previous } of context?.snapshots ?? []) {
        queryClient.setQueryData(key, previous);
      }
      notifyMutationError(error);
    },
    onSettled(data, _error, vars) {
      for (const key of config.invalidate(vars, data ?? undefined)) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  };
}
