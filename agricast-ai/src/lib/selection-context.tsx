import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { metricsFor, resolve, type Selection } from "./agri-model";
import { findDistrict, findState, REGIONS } from "./regions";

const STORAGE_KEY = "agricast:selection:v1";

export const DEFAULT_SELECTION: Selection = {
  stateId: "punjab",
  districtId: "ludhiana",
  villageId: "khanna",
  cropId: "wheat",
};

function sanitize(sel: Partial<Selection>): Selection {
  const state = findState(sel.stateId ?? DEFAULT_SELECTION.stateId);
  const district = findDistrict(state.id, sel.districtId ?? "");
  const village = district.villages.find((v) => v.id === sel.villageId) ?? district.villages[0]!;
  return { stateId: state.id, districtId: district.id, villageId: village.id, cropId: sel.cropId ?? DEFAULT_SELECTION.cropId };
}

interface Ctx {
  selection: Selection;
  setStateId: (id: string) => void;
  setDistrictId: (id: string) => void;
  setVillageId: (id: string) => void;
  setCropId: (id: string) => void;
  setLocation: (stateId: string, districtId: string, villageId: string) => void;
}

const SelectionContext = createContext<Ctx | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSelection(sanitize(JSON.parse(raw)));
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  }, [selection, loaded]);

  const setStateId = useCallback((stateId: string) => setSelection((s) => sanitize({ stateId, cropId: s.cropId })), []);
  const setDistrictId = useCallback(
    (districtId: string) => setSelection((s) => sanitize({ stateId: s.stateId, districtId, cropId: s.cropId })),
    [],
  );
  const setVillageId = useCallback((villageId: string) => setSelection((s) => sanitize({ ...s, villageId })), []);
  const setCropId = useCallback((cropId: string) => setSelection((s) => ({ ...s, cropId })), []);
  const setLocation = useCallback(
    (stateId: string, districtId: string, villageId: string) => setSelection((s) => sanitize({ stateId, districtId, villageId, cropId: s.cropId })),
    [],
  );

  const value = useMemo(
    () => ({ selection, setStateId, setDistrictId, setVillageId, setCropId, setLocation }),
    [selection, setStateId, setDistrictId, setVillageId, setCropId, setLocation],
  );
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used inside SelectionProvider");
  return ctx;
}

/** Convenience: resolved entities + simulated metrics for the current selection. */
export function useAgriData() {
  const { selection } = useSelection();
  return useMemo(() => ({ selection, ...resolve(selection), metrics: metricsFor(selection) }), [selection]);
}

export { REGIONS };
