import { Fragment, useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DoaItem } from "@/lib/api/doa";

type Props = {
  items: DoaItem[];
};

type PaginationEntry = number | "ellipsis";

const ITEMS_PER_PAGE = 10;
const ALL_TAB = "__all";

function buildPagination(current: number, total: number): PaginationEntry[] {
  if (total <= 1) return [1];

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: PaginationEntry[] = [];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  items.push(1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) {
    items.push("ellipsis");
  }

  items.push(total);

  return items;
}

function getGroupLabel(item: DoaItem) {
  return item.grup?.trim() || "Doa";
}

export default function DoaPage({ items }: Props) {
  const [listPage, setListPage] = useState(1);
  const [activeGroup, setActiveGroup] = useState<string>(ALL_TAB);
  const [groupOpen, setGroupOpen] = useState(false);

  useEffect(() => {
    setListPage(1);
  }, [items.length, activeGroup]);

  const groupOptions = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const item of items) {
      const label = getGroupLabel(item);
      if (seen.has(label)) continue;
      seen.add(label);
      order.push(label);
    }
    return order;
  }, [items]);

  useEffect(() => {
    if (activeGroup === ALL_TAB) return;
    if (groupOptions.includes(activeGroup)) return;
    setActiveGroup(ALL_TAB);
  }, [activeGroup, groupOptions]);

  const filteredItems = useMemo(() => {
    if (activeGroup === ALL_TAB) return items;
    return items.filter((item) => getGroupLabel(item) === activeGroup);
  }, [activeGroup, items]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(listPage, totalPages);

  useEffect(() => {
    if (listPage > totalPages) setListPage(totalPages);
  }, [listPage, totalPages]);

  const sliceStart = (safePage - 1) * ITEMS_PER_PAGE;
  const sliceEnd = sliceStart + ITEMS_PER_PAGE;

  const visibleItems = useMemo(
    () => filteredItems.slice(sliceStart, sliceEnd),
    [filteredItems, sliceStart, sliceEnd]
  );

  const paginationItems = useMemo(
    () => buildPagination(safePage, totalPages),
    [safePage, totalPages]
  );

  const groupedItems = useMemo(() => {
    if (activeGroup !== ALL_TAB) {
      return [{ label: activeGroup, items: visibleItems }];
    }

    const map = new Map<string, DoaItem[]>();
    const order: string[] = [];
    for (const item of visibleItems) {
      const key = getGroupLabel(item);
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)?.push(item);
    }
    return order.map((label) => ({
      label,
      items: map.get(label) ?? [],
    }));
  }, [activeGroup, visibleItems]);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
        Tidak ada doa untuk ditampilkan.
      </div>
    );
  }

  const showGroupHeaders = activeGroup === ALL_TAB;
  const activeGroupLabel = activeGroup === ALL_TAB ? "Semua" : activeGroup;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Popover open={groupOpen} onOpenChange={setGroupOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={groupOpen}
              className="w-full justify-between sm:w-70"
            >
              <span className="truncate">{activeGroupLabel}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-70 p-0" align="end">
            <Command>
              <CommandInput placeholder="Cari Grup..." />
              <CommandList>
                <CommandEmpty>Grup tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="Semua"
                    onSelect={() => {
                      setActiveGroup(ALL_TAB);
                      setGroupOpen(false);
                    }}
                  >
                    Semua
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        activeGroup === ALL_TAB ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                  {groupOptions.map((group) => (
                    <CommandItem
                      key={group}
                      value={group}
                      onSelect={() => {
                        setActiveGroup(group);
                        setGroupOpen(false);
                      }}
                    >
                      {group}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          activeGroup === group ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Accordion type="single" collapsible className="space-y-5">
        {groupedItems.map((group) => (
          <Fragment key={group.label}>
            {showGroupHeaders ? (
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </div>
            ) : null}
            {group.items.map((item) => {
              return (
                <AccordionItem
                  key={item.id}
                  value={`doa-${item.id}`}
                  className="border-0"
                >
                  <Card className="gap-0 border-border/60 py-0">
                    <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
                      <div className="flex w-full flex-1 flex-col gap-2">
                        <div className="text-base font-semibold text-foreground">
                          {item.nama}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5 pt-0">
                      <div className="space-y-4">
                        <p className="text-right text-2xl leading-relaxed">
                          {item.ar}
                        </p>
                        {item.tr ? (
                          <p className="text-sm text-muted-foreground">
                            {item.tr}
                          </p>
                        ) : null}
                        <p className="text-sm leading-relaxed">{item.idn}</p>
                        {item.tentang ? (
                          <p className="text-xs text-muted-foreground">
                            {item.tentang}
                          </p>
                        ) : null}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Fragment>
        ))}
      </Accordion>

      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (safePage > 1) setListPage(safePage - 1);
                }}
                className={
                  safePage === 1 ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>

            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === safePage}
                    onClick={(event) => {
                      event.preventDefault();
                      setListPage(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (safePage < totalPages) setListPage(safePage + 1);
                }}
                className={
                  safePage === totalPages ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
