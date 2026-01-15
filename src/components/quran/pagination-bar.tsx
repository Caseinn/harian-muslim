import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationEntry = number | "ellipsis";

type Props = {
  paginationItems: PaginationEntry[];
  safePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PaginationBar({
  paginationItems,
  safePage,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <div className="mt-12 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (safePage > 1) onPageChange(safePage - 1);
              }}
              className={safePage === 1 ? "pointer-events-none opacity-50" : undefined}
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
                    onPageChange(item);
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
                if (safePage < totalPages) onPageChange(safePage + 1);
              }}
              className={
                safePage === totalPages ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
