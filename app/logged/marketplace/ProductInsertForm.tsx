import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import CircularProgress from "@mui/material/CircularProgress";
import { supabase } from "../../../config/supabaseClient";

export type FormValues = {
  id?: string;
  name: string;
  description: string;
  price_points: number;
  stock: number;
  file: File | null;
  image_url?: string;
};

export default function ProductInsertForm({
  onSuccess,
  initialValues,
}: {
  onSuccess?: () => void;
  initialValues?: Partial<FormValues>;
}) {
  const isEditing = Boolean(initialValues?.id);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      price_points: initialValues?.price_points || 0,
      stock: initialValues?.stock || 0,
      file: null,
      ...initialValues,
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const watchedFile = watch("file") as File | null;

  // Função para fazer upload no Supabase Storage
  async function uploadProductImage(file: File | null): Promise<string | null> {
    if (!file) return null;

    // Limpa o nome do arquivo para evitar erros de URL
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("marketplace_images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Pega a URL pública
    const { data } = supabase.storage
      .from("marketplace_images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      let finalImageUrl = initialValues?.image_url || "";

      // Se usuário enviou um novo arquivo, faz o upload
      if (data.file) {
        const newUrl = await uploadProductImage(data.file);
        if (newUrl) finalImageUrl = newUrl;
      }

      if (isEditing) {
        const { error } = await supabase
          .from("marketplace_products")
          .update({
            name: data.name,
            description: data.description,
            price_points: Number(data.price_points),
            stock: Number(data.stock),
            image_url: finalImageUrl,
          })
          .eq("id", initialValues!.id);

        if (error) throw error;
        setMessage("Produto atualizado com sucesso.");
      } else {
        const { error } = await supabase.from("marketplace_products").insert({
          name: data.name,
          description: data.description,
          price_points: Number(data.price_points),
          stock: Number(data.stock),
          image_url: finalImageUrl,
          is_active: true,
        });

        if (error) throw error;
        setMessage("Produto criado com sucesso.");
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      setMessage(err?.message || "Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        backgroundColor: "white",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        {isEditing ? "Editar Produto" : "Adicionar Produto"}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Nome
          </label>
          <input
            {...register("name", { required: "Nome é obrigatório" })}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {errors.name && (
            <span style={{ color: "red", fontSize: 12 }}>
              {errors.name.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Descrição
          </label>
          <textarea
            {...register("description", {
              required: "Descrição é obrigatória",
            })}
            rows={3}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {errors.description && (
            <span style={{ color: "red", fontSize: 12 }}>
              {errors.description.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Preço (Pontos)
          </label>
          <input
            {...register("price_points", {
              required: "Preço é obrigatório",
              valueAsNumber: true,
              min: { value: 1, message: "O preço deve ser maior que zero" },
            })}
            type="number"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {errors.price_points && (
            <span style={{ color: "red", fontSize: 12 }}>
              {errors.price_points.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Estoque
          </label>
          <input
            {...register("stock", {
              required: "Estoque é obrigatório",
              valueAsNumber: true,
              min: { value: 0, message: "Não pode ser negativo" },
            })}
            type="number"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {errors.stock && (
            <span style={{ color: "red", fontSize: 12 }}>
              {errors.stock.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Imagem
          </label>
          {isEditing && initialValues?.image_url && !watchedFile && (
            <div style={{ marginBottom: 10 }}>
              <img
                src={initialValues.image_url}
                alt="Atual"
                style={{ maxWidth: 100, borderRadius: 4 }}
              />
            </div>
          )}
          <Controller
            control={control}
            name="file"
            rules={{ required: !isEditing ? "Imagem é obrigatória" : false }}
            render={({ field }) => (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
              />
            )}
          />
          {errors.file && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {(errors.file as any).message}
            </div>
          )}
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <CircularProgress size={24} />
            <span>Processando...</span>
          </div>
        ) : (
          <button
            type="submit"
            style={{
              padding: "12px",
              background: "#006241",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: 16,
            }}
          >
            {isEditing ? "Salvar Alterações" : "Criar Produto"}
          </button>
        )}
      </form>
      {message && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 4,
            backgroundColor: message.includes("sucesso")
              ? "#d4edda"
              : "#f8d7da",
            color: message.includes("sucesso") ? "#155724" : "#721c24",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
