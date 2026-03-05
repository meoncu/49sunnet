import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Group = {
  id: string;
  name: string;
  parentGroupId: string | null;
  order: number;
};

export function useGroups(parentGroupId: string | null) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const groupsRef = collection(db, "groups");

    const constraints = [
      where("parentGroupId", "==", parentGroupId),
      orderBy("order", "asc"),
    ];

    const q = query(groupsRef, ...constraints);

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Group[] = snapshot.docs.map((doc) => {
        const raw = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: raw.name ?? "",
          parentGroupId:
            typeof raw.parentGroupId === "string" ? raw.parentGroupId : null,
          order: typeof raw.order === "number" ? raw.order : 0,
        };
      });
      setGroups(data);
      setLoading(false);
    });

    return () => unsub();
  }, [parentGroupId]);

  return { groups, loading };
}

