"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./ExerciseFilters.module.scss";

interface ExerciseFiltersProps {
  bodyParts: string[];
  equipmentOptions: string[];
}

export function ExerciseFilters({ bodyParts, equipmentOptions }: ExerciseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("q", value), 300);
  }

  return (
    <form
      className={styles.filters}
      role="search"
      aria-label="Filter exercises"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.field}>
        <label htmlFor="exercise-search">Search by name</label>
        <input
          id="exercise-search"
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="e.g. squat, curl, plank"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="body-part-filter">Body part</label>
        <select
          id="body-part-filter"
          defaultValue={searchParams.get("bodyPart") ?? ""}
          onChange={(event) => updateParam("bodyPart", event.target.value)}
        >
          <option value="">All body parts</option>
          {bodyParts.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="equipment-filter">Equipment</label>
        <select
          id="equipment-filter"
          defaultValue={searchParams.get("equipment") ?? ""}
          onChange={(event) => updateParam("equipment", event.target.value)}
        >
          <option value="">All equipment</option>
          {equipmentOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
