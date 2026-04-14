/**
 * Optimistic Update Utilities for React Query
 * 
 * These utilities provide common patterns for optimistic updates
 * to make the UI feel instant and responsive.
 */

import { QueryClient } from '@tanstack/react-query';
import { QueryKey } from './queryKeys';

interface OptimisticOptions<TData, TVariables> {
  queryClient: QueryClient;
  queryKey: QueryKey;
  variables: TVariables;
  optimisticData: (old: TData | undefined, variables: TVariables) => TData;
  rollbackOnError?: boolean;
}

/**
 * Perform optimistic update with automatic rollback
 * 
 * Usage:
 * const mutation = useMutation({
 *   mutationFn: updateTask,
 *   onMutate: async (variables) => {
 *     return optimisticUpdate({
 *       queryClient,
 *       queryKey: queryKeys.tasks.list(),
 *       variables,
 *       optimisticData: (old, vars) => 
 *         old?.map(t => t.id === vars.id ? { ...t, ...vars } : t) ?? []
 *     });
 *   },
 *   onError: (err, variables, context) => {
 *     rollbackOptimisticUpdate(queryClient, context);
 *   }
 * });
 */
export async function optimisticUpdate<TData, TVariables>({
  queryClient,
  queryKey,
  variables,
  optimisticData,
}: OptimisticOptions<TData, TVariables>): Promise<{
  previousData: TData | undefined;
  queryKey: QueryKey;
}> {
  // Cancel any outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<TData>(queryKey);

  // Optimistically update to new value
  queryClient.setQueryData<TData>(queryKey, (old) => 
    optimisticData(old, variables)
  );

  return { previousData, queryKey };
}

/**
 * Rollback optimistic update on error
 * 
 * Usage in onError:
 * onError: (err, variables, context) => {
 *   rollbackOptimisticUpdate(queryClient, context);
 * }
 */
export function rollbackOptimisticUpdate(
  queryClient: QueryClient,
  context: { previousData: unknown; queryKey: QueryKey } | undefined
): void {
  if (context) {
    queryClient.setQueryData(context.queryKey, context.previousData);
  }
}

/**
 * Invalidate related queries after mutation
 * 
 * Usage in onSettled:
 * onSettled: () => {
 *   invalidateRelatedQueries(queryClient, [
 *     queryKeys.tasks.list(),
 *     queryKeys.tasks.stats()
 *   ]);
 * }
 */
export async function invalidateRelatedQueries(
  queryClient: QueryClient,
  queryKeys: QueryKey[]
): Promise<void> {
  await Promise.all(
    queryKeys.map(key => 
      queryClient.invalidateQueries({ queryKey: key })
    )
  );
}

/**
 * Optimistic list item addition
 * 
 * Usage:
 * onMutate: async (newItem) => {
 *   return optimisticListAdd({
 *     queryClient,
 *     queryKey: queryKeys.tasks.list(),
 *     newItem,
 *     idField: 'id'
 *   });
 * }
 */
export async function optimisticListAdd<T extends { id: string }>({
  queryClient,
  queryKey,
  newItem,
  prepend = true,
}: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  newItem: T;
  prepend?: boolean;
}): Promise<{ previousData: T[] | undefined; queryKey: QueryKey }> {
  return optimisticUpdate<T[], T>({
    queryClient,
    queryKey,
    variables: newItem,
    optimisticData: (old) => {
      if (!old) return [newItem];
      return prepend ? [newItem, ...old] : [...old, newItem];
    },
  });
}

/**
 * Optimistic list item update
 * 
 * Usage:
 * onMutate: async (updatedItem) => {
 *   return optimisticListUpdate({
 *     queryClient,
 *     queryKey: queryKeys.tasks.list(),
 *     updatedItem,
 *     idField: 'id'
 *   });
 * }
 */
export async function optimisticListUpdate<T extends { id: string }>({
  queryClient,
  queryKey,
  updatedItem,
}: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  updatedItem: Partial<T> & { id: string };
}): Promise<{ previousData: T[] | undefined; queryKey: QueryKey }> {
  return optimisticUpdate<T[], Partial<T> & { id: string }>({
    queryClient,
    queryKey,
    variables: updatedItem,
    optimisticData: (old) => {
      if (!old) return [];
      return old.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );
    },
  });
}

/**
 * Optimistic list item removal
 * 
 * Usage:
 * onMutate: async (id) => {
 *   return optimisticListRemove({
 *     queryClient,
 *     queryKey: queryKeys.tasks.list(),
 *     id
 *   });
 * }
 */
export async function optimisticListRemove<T extends { id: string }>({
  queryClient,
  queryKey,
  id,
}: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  id: string;
}): Promise<{ previousData: T[] | undefined; queryKey: QueryKey; removedItem: T | undefined }> {
  let removedItem: T | undefined;

  const context = await optimisticUpdate<T[], string>({
    queryClient,
    queryKey,
    variables: id,
    optimisticData: (old) => {
      if (!old) return [];
      removedItem = old.find((item) => item.id === id);
      return old.filter((item) => item.id !== id);
    },
  });

  return { ...context, removedItem };
}

/**
 * Optimistic toggle (for boolean fields like completed, favorite, etc)
 * 
 * Usage:
 * onMutate: async ({ id, field }) => {
 *   return optimisticToggle({
 *     queryClient,
 *     queryKey: queryKeys.tasks.list(),
 *     id,
 *     field: 'completed'
 *   });
 * }
 */
export async function optimisticToggle<T extends { id: string }>({
  queryClient,
  queryKey,
  id,
  field,
}: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  id: string;
  field: keyof T;
}): Promise<{ previousData: T[] | undefined; queryKey: QueryKey }> {
  return optimisticUpdate<T[], { id: string; field: keyof T }>({
    queryClient,
    queryKey,
    variables: { id, field },
    optimisticData: (old) => {
      if (!old) return [];
      return old.map((item) =>
        item.id === id
          ? { ...item, [field]: !(item[field] as unknown as boolean) }
          : item
      );
    },
  });
}

