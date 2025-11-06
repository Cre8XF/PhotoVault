import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function AILogPanel() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, "photos"), orderBy("enhancedAt", "desc"), limit(5))
      );
      setLogs(snap.docs.map(d => d.data()));
    })();
  }, []);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5" /> Siste AI-operasjoner
      </h2>
      <ul className="text-sm opacity-80 space-y-1">
        {logs.map((l, i) => (
          <li key={i}>
            {l.name || "ukjent"} — {l.enhancedAt ? "Forbedret" : "Tagget"} —{" "}
            {new Date(l.enhancedAt || l.updatedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </section>
  );
}
