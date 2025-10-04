'use client';

import {
  collection,
  onSnapshot,
  query,
  type CollectionReference,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UseCollectionOptions = {
  // Add any options here
};

export const useCollection = <T,>(
  pathOrQuery: string | Query | null,
  options?: UseCollectionOptions
) => {
  const firestore = useFirestore();
  const [data, setData] = useState<((T & { id: string }) | null)[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrQuery) {
      setIsLoading(false);
      return;
    }

    const q =
      typeof pathOrQuery === 'string'
        ? query(collection(firestore, pathOrQuery) as CollectionReference<T>)
        : (pathOrQuery as Query<T>);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const results: (T & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...(doc.data() as T) });
        });
        setData(results);
        setIsLoading(false);
      },
      async (err) => {
        const path =
          q.type === 'query'
            ? (q as Query<DocumentData>)._query.path.canonical
            : (q as CollectionReference<DocumentData>).path;
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path,
            operation: 'list',
          })
        );
        console.error(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, pathOrQuery]);

  return { data, isLoading };
};
