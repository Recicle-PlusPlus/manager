import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import ProductInsertForm from "./ProductInsertForm";
import { supabase } from "../../../config/supabaseClient";

export default function ProductListContainer({ reload }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // Trazemos tudo ordenado por criação. Mostramos até os inativos para o Admin gerenciar.
        const { data, error: fetchError } = await supabase
          .from("marketplace_products")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        if (!ignore && data) {
          setProducts(data);
        }
      } catch (e) {
        if (!ignore) setError(e.message || "Erro ao buscar produtos");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      ignore = true;
    };
  }, [reload]);

  const handleDeleteProduct = async (product) => {
    try {
      if (!product.id) throw new Error("ID do produto não encontrado");

      // SOFT DELETE: Apenas marcamos como is_active = false
      const { error } = await supabase
        .from("marketplace_products")
        .update({ is_active: false })
        .eq("id", product.id);

      if (error) throw error;

      // Atualiza a lista localmente para refletir a mudança
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: false } : p)),
      );
    } catch (e) {
      console.error("Erro ao desativar produto:", e);
      throw new Error(e.message || "Erro ao desativar produto");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Carregando produtos...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;

  if (editing) {
    return (
      <div>
        <button
          onClick={() => setEditing(null)}
          style={{
            marginBottom: 16,
            padding: "8px 16px",
            cursor: "pointer",
            borderRadius: 4,
            border: "1px solid #ddd",
          }}
        >
          ← Voltar para lista
        </button>
        <ProductInsertForm
          initialValues={editing}
          onSuccess={() => {
            setEditing(null);
            // Recarrega a página ou gerencia o estado (aqui vamos só forçar reload pelo pai no uso real)
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <ProductList
      products={products}
      setEditingProduct={setEditing}
      onDeleteProduct={handleDeleteProduct}
    />
  );
}
