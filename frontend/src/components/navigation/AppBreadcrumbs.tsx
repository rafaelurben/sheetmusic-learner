/*
 * (C) 2026. - Rafael Urben
 */
import { Fragment, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/components/ui/breadcrumb.tsx";
import { usePageTitleStore } from "@/zustand/pageTitleStore.ts";

interface BreadcrumbEntry {
  path: string;
  label: string;
}

const staticSegmentLabelMap: Record<string, string> = {
  rooms: "Rooms",
  pieces: "Pieces",
  debug: "Debug",
};

export default function AppBreadcrumbs() {
  const location = useLocation();
  const pageTitle = usePageTitleStore((state) => state.pageTitle);
  const baseDocumentTitleRef = useRef(globalThis.document.title);

  // Calculate breadcrumbs
  const breadcrumbs = useMemo((): BreadcrumbEntry[] => {
    const segments = location.pathname.split("/").filter(Boolean);
    const entries: BreadcrumbEntry[] = [{ path: "/", label: "Home" }];

    let currentPath = "";
    segments.forEach((segment) => {
      currentPath += `/${segment}`;

      const label =
        staticSegmentLabelMap[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1);

      entries.push({ path: currentPath, label });
    });

    if (pageTitle && entries.length > 0) {
      const currentEntry = entries.at(-1);
      if (currentEntry) {
        entries[entries.length - 1] = {
          ...currentEntry,
          label: pageTitle,
        };
      }
    }

    return entries;
  }, [location.pathname, pageTitle]);

  // Set document title (shown in tab bar)
  useEffect(() => {
    const baseTitle = baseDocumentTitleRef.current;
    const currentLabel = breadcrumbs.at(-1)?.label;
    globalThis.document.title = currentLabel
      ? `${currentLabel} | ${baseTitle}`
      : baseTitle;

    return () => {
      globalThis.document.title = baseTitle;
    };
  }, [breadcrumbs]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <Fragment key={breadcrumb.path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild={true}>
                    <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
