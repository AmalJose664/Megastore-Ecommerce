import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  rowKey?: keyof T;

  // Server-side props
  serverSide?: boolean;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
  filterControls?: React.ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data found',
  rowKey,
  serverSide = false,
  page: serverPage = 1,
  totalPages: serverTotalPages = 1,
  totalItems: serverTotalItems,
  onPageChange,
  searchValue,
  onSearchChange,
  loading = false,
  filterControls,
}: DataTableProps<T>) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  const isServer = serverSide;

  // Search query
  const query = isServer ? (searchValue ?? '') : internalSearchQuery;
  const setQuery = (val: string) => {
    if (isServer) {
      onSearchChange?.(val);
    } else {
      setInternalSearchQuery(val);
      setInternalCurrentPage(1);
    }
  };

  // Pagination values
  const activePage = isServer ? serverPage : internalCurrentPage;
  const setActivePage = (p: number) => {
    if (isServer) {
      onPageChange?.(p);
    } else {
      setInternalCurrentPage(p);
    }
  };

  // Client-side calculations
  const filteredData = (!isServer && searchKey)
    ? data.filter((item) =>
      String(item[searchKey] ?? '').toLowerCase().includes(query.toLowerCase())
    )
    : data;

  const calculatedTotalPages = isServer
    ? serverTotalPages
    : Math.ceil(filteredData.length / pageSize);

  const displayData = isServer
    ? data
    : filteredData.slice((activePage - 1) * pageSize, activePage * pageSize);

  const totalResults = isServer
    ? (serverTotalItems ?? data.length)
    : filteredData.length;

  const startIndex = Math.min((activePage - 1) * pageSize + 1, totalResults);
  const endIndex = Math.min(activePage * pageSize, totalResults);

  // Helper to get row key
  const getRowKey = (item: T): string => {
    if (rowKey) return String(item[rowKey]);
    const anyItem = item as any;
    return String(anyItem._id || anyItem.id || Math.random());
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header controls (Search & Filters) */}
      {(searchKey || isServer || filterControls) && (
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {(searchKey || isServer) && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 input-search"
              />
            </div>
          )}
          {filterControls && (
            <div className="flex flex-wrap gap-2 items-center">
              {filterControls}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <table className="w-full text-xs">
          <thead>
            <tr className="table-header">
              {columns.map((column) => (
                <th key={column.key} className={cn("text-left p-3", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-xs text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayData.map((item) => (
                <tr
                  key={getRowKey(item)}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "hover:bg-muted/30 cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn("p-3", column.className)}>
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {calculatedTotalPages > 1 && (
        <div className="p-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {totalResults === 0 ? 0 : startIndex} to {endIndex} of{' '}
            {totalResults} results
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              disabled={activePage === 1 || loading}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-medium px-2">
              {activePage} / {calculatedTotalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setActivePage(Math.min(calculatedTotalPages, activePage + 1))}
              disabled={activePage >= calculatedTotalPages || loading}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
