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

export type Sunnah = {
  id: string;
  groupId: string;
  sequence: number;
  shortText: string;
  detailText: string | null;
  hadithArabic: string | null;
  hadithTranslation: string | null;
  hadithSource: string | null;
};

export function useSunnahs(groupId: string | null) {
  const [sunnahs, setSunnahs] = useState<Sunnah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setSunnahs([]);
      setLoading(false);
      return;
    }

    const sunnahsRef = collection(db, "sunnahs");
    const q = query(
      sunnahsRef,
      where("groupId", "==", groupId),
      orderBy("sequence", "asc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Sunnah[] = snapshot.docs.map((doc) => {
        const raw = doc.data() as DocumentData;
        return {
          id: doc.id,
          groupId: raw.groupId ?? "",
          sequence: typeof raw.sequence === "number" ? raw.sequence : 0,
          shortText: raw.shortText ?? "",
          detailText: raw.detailText ?? null,
          hadithArabic: raw.hadithArabic ?? null,
          hadithTranslation: raw.hadithTranslation ?? null,
          hadithSource: raw.hadithSource ?? null,
        };
      });
      setSunnahs(data);
      setLoading(false);
    });

    return () => unsub();
  }, [groupId]);

  return { sunnahs, loading };
}

