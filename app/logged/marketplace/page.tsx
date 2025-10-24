"use client";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Firestore, Storage } from "../../../config/firebase";
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
const firestoreRefMarketplace = collection(Firestore, 'marketplace');

type FormValues = {
  productId: string;
  name: string;
  description: string;
  currentPrice: string;
  originalPrice: string;
  stock: number;
  category: string;
  file: File | null;
}

enum ProductCategory {
  Sports = "Esportes",
  Clothing = "Roupas",
  Entertainment = "Entretenimento",
  Electronics = "Eletrônicos",
  Home = "Casa",
  Sustainable = "Sustentável"
}

export default function MarketplacePage() {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      productId: "",
      name: "",
      description: "",
      currentPrice: "",
      originalPrice: "",
      stock: 0,
      category: "",
      file: null,
    },
  })

  const [loading, setloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setloading(true);
      setMessage(null);

      let imageUrl: string | null = null;

      // upload image if exists on storage (no progress tracking)
      if (data.file) {
        const file = data.file;
        const path = `images/marketplace/${Date.now()}_${file.name}`;
        const sRef = storageRef(Storage, path);
        await uploadBytes(sRef, file);
        imageUrl = await getDownloadURL(sRef);
      }

      // prepare document
      const doc = {
        productId: data.productId,
        name: data.name,
        description: data.description,
        currentPrice: Number(data.currentPrice),
        originalPrice: Number(data.originalPrice),
        stock: Number(data.stock),
        category: data.category,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(firestoreRefMarketplace, doc);

      setMessage('Produto salvo com sucesso.');
      // limpa o formulário
      try { reset(); } catch (e) { /* ignore */ }
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      setMessage(err?.message || 'Erro ao salvar produto');
    } finally {
      setloading(false);
    }
  }

  const watchedFile = watch('file') as File | null;


  return (
    <div style={{ maxWidth: 700, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h1>Adicionar Produto</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>ID (productId)</label>
          <input
            {...register("productId", { required: "ID é obrigatório" })}
            type="text"
            style={{ width: "100%", padding: 8 }}
          />
          {errors.productId && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.productId.message as string}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Título</label>
          <input
            {...register("name", { required: "Título é obrigatório" })}
            placeholder="Nome do produto"
            style={{ width: "100%", padding: 8 }}
          />
          {errors.name && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.name.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Descrição</label>
          <textarea
            {...register("description", { required: "Descrição é obrigatória" })}
            placeholder="Descrição do produto"
            rows={4}
            style={{ width: "100%", padding: 8 }}
          />
          {errors.description && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.description.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Preço (R$)</label>
          <input
            {...register("currentPrice", {
              required: "Preço é obrigatório",
              validate: v => (v && !isNaN(Number(v)) && Number(v) > 0) || "Preço inválido"
            })}
            placeholder="0.00"
            inputMode="decimal"
            style={{ width: "100%", padding: 8 }}
          />
          {errors.currentPrice && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.currentPrice.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Preço Original</label>
          <input
            {...register("originalPrice", {
              required: "Preço original é obrigatório",
              validate: v => (v !== undefined && v !== '' && !isNaN(Number(v))) || "Preço inválido"
            })}
            placeholder="0.00"
            inputMode="decimal"
            style={{ width: "100%", padding: 8 }}
          />
          {errors.originalPrice && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.originalPrice.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Categoria</label>
          <select
            {...register("category", { required: "Categoria é obrigatória" })}
            style={{ width: "100%", padding: 8 }}
            defaultValue=""
          >
            <option value="" disabled>Selecione uma categoria</option>
            {Object.entries(ProductCategory).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
          {errors.category && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.category.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Estoque (stock)</label>
          <input
            {...register("stock", { required: "Estoque é obrigatório", valueAsNumber: true, min: { value: 0, message: 'Estoque não pode ser negativo' } })}
            type="number"
            style={{ width: "100%", padding: 8 }}
          />
          {errors.stock && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.stock.message as string}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Imagem</label>
          <Controller
            control={control}
            name="file"
            rules={{ required: "Imagem é obrigatória" }}
            render={({ field }) => (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
              />
            )}
          />
          {errors.file && (
            <div style={{ color: 'red', fontSize: 12 }}>{(errors.file as any).message}</div>
          )}
          {watchedFile && (
            <div style={{ marginTop: 8 }}>
              Arquivo: {watchedFile.name} ({Math.round(watchedFile.size / 1024)} KB)
            </div>
          )}
        </div>

        {loading ?
          <div style={{ margin: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CircularProgress size={20} />
            <span>Enviando...</span>
          </div>
          :
          <div style={{ margin: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <button type="submit" style={{ padding: "8px 16px" }}>
              Enviar Produto
            </button>
          </div>
        }
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}