import React, { useEffect, useState } from "react";
import MaterialList from "./MaterialList";
import MaterialForm from "./MaterialForm";
import { supabase } from "../../../config/supabaseClient";

export default function MaterialListContainer({ reload }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [localReload, setLocalReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchMaterials() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("materials")
          .select("*")
          .order("name");

        if (supabaseError) throw supabaseError;

        if (!ignore && data) {
          const items = data.map((item) => ({
            id: item.id,
            name: item.name || "",
            collectorPoints: item.points_for_collector || 0,
            donorPoints: item.points_for_donor || 0,
            active: item.active ?? true,
            iconUrl: item.icon_url || "",
          }));
          setMaterials(items);
        }
      } catch (e) {
        if (!ignore)
          setError(e.message || "Erro ao buscar materiais do Supabase");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchMaterials();
    return () => {
      ignore = true;
    };
  }, [reload, localReload]);

  if (loading)
    return <div style={{ padding: 24 }}>Carregando materiais...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;

  if (editing !== null) {
    return (
      <div>
        <button
          onClick={() => setEditing(null)}
          style={{
            marginBottom: 16,
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        >
          ← Voltar para lista
        </button>
        <MaterialForm
          initialValues={editing}
          onSuccess={() => {
            setEditing(null);
            setLocalReload((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 0 16px 0",
        }}
      >
        <button
          onClick={() => setEditing({})}
          style={{
            padding: "10px 20px",
            backgroundColor: "#00C49F",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          + Novo Material
        </button>
      </div>
      <MaterialList materials={materials} setEditingMaterial={setEditing} />
    </>
  );
}
