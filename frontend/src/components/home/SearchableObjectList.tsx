/*
 * (C) 2026. - Rafael Urben
 */
import * as React from "react";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { cn } from "@/shadcn/lib/utils.ts";

interface SearchableObject {
  id: string;
  title: string;
}

interface SearchableObjectListProps<T extends SearchableObject> {
  listTitle: string;
  searchPlaceholder: string;
  emptyListText: string;
  emptySearchText: string;
  objects: T[];
  searchKeys?: (keyof T)[];
  toPath: (object: T) => string;
  headerAction?: React.ReactNode;
}

export default function SearchableObjectList<T extends SearchableObject>({
  listTitle,
  searchPlaceholder,
  emptyListText,
  emptySearchText,
  objects,
  searchKeys = [],
  toPath,
  headerAction,
}: Readonly<SearchableObjectListProps<T>>) {
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredObjects = useMemo(() => {
    if (!normalizedSearchTerm) {
      return objects;
    }

    return objects.filter((object) => {
      const valuesToSearch = [
        object.title,
        ...searchKeys.map((key) => {
          const value = object[key];
          return value == null ? "" : String(value);
        }),
      ];

      return valuesToSearch.some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm),
      );
    });
  }, [objects, normalizedSearchTerm, searchKeys]);

  const isSearching = normalizedSearchTerm.length > 0;

  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>{listTitle}</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          type="text"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          placeholder={searchPlaceholder}
        />

        <div className="flex flex-col gap-2">
          {filteredObjects.map((object) => (
            <NavLink
              key={object.id}
              to={toPath(object)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                  isActive && "bg-muted",
                )
              }
            >
              {object.title}
            </NavLink>
          ))}

          {filteredObjects.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {isSearching ? emptySearchText : emptyListText}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
