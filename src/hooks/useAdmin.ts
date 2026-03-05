"use client";

import { useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Group } from "./useGroups";
import type { Sunnah } from "./useSunnahs";

// Groups CRUD
export function useAdminGroups() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = useCallback(
    async (data: Omit<Group, "id">) => {
      setLoading(true);
      setError(null);
      try {
        const groupsRef = collection(db, "groups");
        const docRef = await addDoc(groupsRef, {
          ...data,
          createdAt: serverTimestamp(),
        });
        return docRef.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateGroup = useCallback(
    async (id: string, data: Partial<Omit<Group, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        const groupRef = doc(db, "groups", id);
        await updateDoc(groupRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteGroup = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const groupRef = doc(db, "groups", id);
      await deleteDoc(groupRef);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    getAllGroups,
    loading,
    error,
  };
}

// Sunnahs CRUD
export function useAdminSunnahs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bir grup için sonraki sıra numarasını bul
  const getNextSequence = useCallback(async (groupId: string) => {
    const sunnahsRef = collection(db, "sunnahs");
    const q = query(sunnahsRef, where("groupId", "==", groupId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return 1; // İlk kayıt
    }
    
    const sequences = snapshot.docs.map(doc => doc.data().sequence as number);
    const maxSequence = Math.max(...sequences, 0);
    
    // Silinen sıra numaralarını bul
    const allNumbers = Array.from({length: maxSequence}, (_, i) => i + 1);
    const usedNumbers = new Set(sequences);
    const availableNumbers = allNumbers.filter(n => !usedNumbers.has(n));
    
    // Boş sıra varsa onu kullan, yoksa sonraki numarayı ver
    return availableNumbers.length > 0 ? availableNumbers[0] : maxSequence + 1;
  }, []);

  // Otomatik sıra numarası ile sünnet oluştur
  const createSunnah = useCallback(
    async (data: Omit<Sunnah, "id">, autoSequence = true) => {
      setLoading(true);
      setError(null);
      try {
        let sequence = data.sequence;
        
        // Otomatik sıra isteniyorsa hesapla
        if (autoSequence) {
          sequence = await getNextSequence(data.groupId);
        }
        
        const sunnahsRef = collection(db, "sunnahs");
        const docRef = await addDoc(sunnahsRef, {
          ...data,
          sequence,
          createdAt: serverTimestamp(),
        });
        return { id: docRef.id, sequence };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getNextSequence]
  );

  const updateSunnah = useCallback(
    async (id: string, data: Partial<Omit<Sunnah, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        const sunnahRef = doc(db, "sunnahs", id);
        await updateDoc(sunnahRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sünnet sil ve istenirse boşluğu doldur (kaydır)
  const deleteSunnah = useCallback(async (id: string, fillGap = false) => {
    setLoading(true);
    setError(null);
    try {
      // Silinecek dokümanı bul (groupId ve sequence için)
      const sunnahRef = doc(db, "sunnahs", id);
      const sunnahDoc = await getDoc(sunnahRef);
      
      if (!sunnahDoc.exists()) {
        throw new Error("Sünnet bulunamadı");
      }
      
      const { groupId, sequence: deletedSequence } = sunnahDoc.data();
      
      // Sil
      await deleteDoc(sunnahRef);
      
      // Boşluğu doldurma isteniyorsa
      if (fillGap) {
        const sunnahsRef = collection(db, "sunnahs");
        const q = query(
          sunnahsRef, 
          where("groupId", "==", groupId),
          where("sequence", ">", deletedSequence),
          orderBy("sequence", "asc")
        );
        const snapshot = await getDocs(q);
        
        // Sırayı birer azalt
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, {
            sequence: doc.data().sequence - 1,
          });
        });
        await batch.commit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sünnetleri yeniden sırala (manuel sıralama için)
  const reorderSunnahs = useCallback(async (updates: { id: string; sequence: number }[]) => {
    setLoading(true);
    setError(null);
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, sequence }) => {
        const sunnahRef = doc(db, "sunnahs", id);
        batch.update(sunnahRef, { 
          sequence,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllSunnahs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sunnahsRef = collection(db, "sunnahs");
      const q = query(sunnahsRef, orderBy("sequence", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sunnah[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createSunnah,
    updateSunnah,
    deleteSunnah,
    getAllSunnahs,
    getNextSequence,
    reorderSunnahs,
    loading,
    error,
  };
}
