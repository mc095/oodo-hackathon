'use client';

import {
  doc,
  onSnapshot,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UseDocOptions = {
  // Add any options here
};

export const useDoc = <T,>(
  pathOrRef: string | DocumentReference | null,
  options?: UseDocOptions
) => {
  const firestore = useFirestore();
  const [data, setData] = useState<((T & { id: string }) | null) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrRef) {
      setIsLoading(false);
      return;
    }
    const ref =
      typeof pathOrRef === 'string'
        ? (doc(firestore, pathOrRef) as DocumentReference<T>)
        : (pathOrRef as DocumentReference<T>);

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...(doc.data() as T) });
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: (ref as DocumentReference<DocumentData>).path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [firestore, pathOrRef]);

  return { data, isLoading };
};
