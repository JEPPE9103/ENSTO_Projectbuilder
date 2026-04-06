import { useInfiniteQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { Product } from "@/lib/api-types";

const CATALOG_PAGE_SIZE = 200;

export function useProductCatalog() {
  const query = useInfiniteQuery({
    queryKey: ["products-catalog", CATALOG_PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      apiGet<Product[]>(
        `/products?limit=${CATALOG_PAGE_SIZE}&offset=${pageParam as number}`,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < CATALOG_PAGE_SIZE) {
        return undefined;
      }
      return allPages.length * CATALOG_PAGE_SIZE;
    },
  });

  const products = (query.data?.pages ?? []).flat();

  return {
    ...query,
    data: products,
    pageSize: CATALOG_PAGE_SIZE,
  };
}