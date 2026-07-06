import { useQuery } from "@tanstack/react-query";
import { listProductos } from "../../api/productos";

export function useProductosList(filters) {
  const query = useQuery({
    queryKey: ["productos", filters],
    queryFn: () => listProductos(filters),
  });

  const apiMessage = query.error?.response?.data?.message;
  const response = query.data ?? {};

  return {
    productos: response.data ?? [],
    meta: response.meta ?? null,
    links: response.links ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.isError ? apiMessage || "No se pudieron cargar los productos." : "",
    reload: query.refetch,
  };
}
