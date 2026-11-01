import { MapPin, Sprout } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSelection } from "@/lib/selection-context";
import { CROPS, findDistrict, findState, REGIONS } from "@/lib/regions";
import { cn } from "@/lib/utils";

export function LocationCropBar({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { selection, setStateId, setDistrictId, setVillageId, setCropId } = useSelection();
  const state = findState(selection.stateId);
  const district = findDistrict(state.id, selection.districtId);
  const trigger = cn("h-9 bg-card text-sm", compact ? "w-full" : "w-full sm:w-[150px]");

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <MapPin className="hidden h-4 w-4 text-muted-foreground lg:block" />
      <div className={cn("grid flex-1 gap-2", compact ? "grid-cols-2" : "grid-cols-2 sm:flex sm:flex-none")}>
        <Select value={selection.stateId} onValueChange={setStateId}>
          <SelectTrigger className={trigger} aria-label="State">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selection.districtId} onValueChange={setDistrictId}>
          <SelectTrigger className={trigger} aria-label="District">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            {state.districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selection.villageId} onValueChange={setVillageId}>
          <SelectTrigger className={trigger} aria-label="Village">
            <SelectValue placeholder="Village" />
          </SelectTrigger>
          <SelectContent>
            {district.villages.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selection.cropId} onValueChange={setCropId}>
          <SelectTrigger className={cn(trigger, "border-primary/30 [&>span]:flex-1 [&>span]:text-left", !compact && "sm:w-[200px]")} aria-label="Crop">
            <Sprout className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Crop" />
          </SelectTrigger>
          <SelectContent>
            {CROPS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} <span className="text-muted-foreground">· {c.hindi}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
