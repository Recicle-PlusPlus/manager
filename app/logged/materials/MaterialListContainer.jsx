import { collection, getDocs } from "firebase/firestore";
import { Firestore } from "../../../config/firebase";
import React, { useEffect, useState } from "react";
import MaterialList from "./MaterialList";
import MaterialForm from "./MaterialForm";

export default function MaterialListContainer({ reload }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchMaterials() {
      setLoading(true);
      setError(null);
      try {
        const ref = collection(Firestore, "materials");
        const snap = await getDocs(ref);
        const items = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            collectorPoints: data.points?.coletor || 0,
            donorPoints: data.points?.donor || 0,
            active: data.active ?? true,
            iconUrl: data.iconUrl || '',
          };
        });
        if (!ignore) setMaterials(items);
      } catch (e) {
        if (!ignore) setError(e.message || "Erro ao buscar materiais");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchMaterials();
    return () => { ignore = true; };
  }, [reload]);

  if (loading) return <div style={{ padding: 24 }}>Carregando materiais...</div>;
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;
  if (editing) {
    return (
      <div>
        <button 
          onClick={() => setEditing(null)} 
          style={{ 
            marginBottom: 16, 
            padding: '8px 16px', 
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: 4
          }}
        >
          ← Voltar para lista
        </button>
        <MaterialForm 
          initialValues={editing} 
          onSuccess={() => {
            setEditing(null);
            // Força recarregar a lista
            window.location.reload();
          }} 
        />
      </div>
    );
  }
  return <MaterialList materials={materials} setEditingMaterial={setEditing} />;
}
