import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Firestore } from "../../../config/firebase";
import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import ProductInsertForm from "./ProductInsertForm";

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
        const ref = collection(Firestore, "marketplace");
        const snap = await getDocs(ref);
        const items = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            intId: data.intId || parseInt(doc.id) || null,
            name: data.name,
            description: data.description,
            currentPrice: data.currentPrice,
            originalPrice: data.originalPrice,
            stock: data.stock,
            category: data.category,
            imgUrl: data.imgUrl || data.imageUrl, // Compatibilidade com ambos os nomes
            productId: data.productId || doc.id,
            docId: doc.id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        if (!ignore) setProducts(items);
      } catch (e) {
        if (!ignore) setError(e.message || "Erro ao buscar produtos");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchProducts();
    return () => { ignore = true; };
  }, [reload]);

  const handleDeleteProduct = async (product) => {
    try {
      // Usa o intId como ID do documento (convertido para string)
      const docId = product.intId ? String(product.intId) : product.docId;
      if (!docId) {
        throw new Error('ID do produto não encontrado');
      }
      const productRef = doc(Firestore, "marketplace", docId);
      await deleteDoc(productRef);
      // Atualiza a lista localmente
      setProducts(prev => prev.filter(p => 
        (p.intId && p.intId !== product.intId) || 
        (p.docId && p.docId !== product.docId)
      ));
    } catch (e) {
      console.error('Erro ao deletar produto:', e);
      throw new Error(e.message || 'Erro ao deletar produto');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Carregando produtos...</div>;
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;
  if (editing) {
    console.log('Editing product:', editing);
    return <ProductInsertForm initialValues={editing} onSuccess={() => setEditing(null)} />;
  }
  return <ProductList products={products} setEditingProduct={setEditing} onDeleteProduct={handleDeleteProduct} />;
}
