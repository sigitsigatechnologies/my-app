import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  limit?: number
  onLimitChange?: (limit: number) => void
  total?: number
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, limit = 10, onLimitChange, total = 0, className }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  if (totalPages <= 0) return null

  return (
    <div className={cn("flex items-center justify-between mt-4", className)}>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <>
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { onLimitChange(Number(e.target.value)); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </>
        )}
        <span className="text-sm text-gray-700 ml-2">
          {total > 0 ? `Showing ${((page - 1) * limit) + 1} to ${Math.min(page * limit, total)} of ${total}` : `Page ${page} of ${totalPages}`}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {getPageNumbers().map((pg, idx) => {
          if (pg === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )
          }
          return (
            <Button
              key={pg}
              variant={pg === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pg as number)}
              className={pg === page ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {pg}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
