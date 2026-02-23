import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import CircularProgress from "@mui/material/CircularProgress";
import { supabase } from "../../../config/supabaseClient";

export type MaterialFormValues = {
  id?: string;
  name: string;
  collectorPoints: number;
  donorPoints: number;
};

export default function MaterialForm({
  onSuccess,
  initialValues,
}: {
  onSuccess?: () => void;
  initialValues?: Partial<MaterialFormValues>;
}) {
  const isEditing = Boolean(initialValues?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    defaultValues: {
      id: "",
      name: "",
      collectorPoints: 0,
      donorPoints: 0,
      ...initialValues,
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateMaterial(data: MaterialFormValues) {
    const { error } = await supabase
      .from("materials")
      .update({
        name: data.name,
        points_for_collector: Number(data.collectorPoints),
        points_for_donor: Number(data.donorPoints),
      })
      .eq("id", data.id);

    if (error) throw error;
  }

  async function createMaterial(data: MaterialFormValues) {
    const { error } = await supabase.from("materials").insert({
      name: data.name,
      points_for_collector: Number(data.collectorPoints),
      points_for_donor: Number(data.donorPoints),
      active: true,
    });

    if (error) throw error;
  }

  const onSubmit: SubmitHandler<MaterialFormValues> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      if (isEditing) {
        await updateMaterial(data);
        setMessage("Material atualizado com sucesso.");
      } else {
        await createMaterial(data);
        setMessage("Material criado com sucesso.");
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao salvar material:", err);
      if (err.code === "23505") {
        setMessage("Já existe um material cadastrado com este nome.");
      } else {
        setMessage(err?.message || "Erro ao salvar material");
      }
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
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        {isEditing ? "Editar Material" : "Cadastrar Novo Material"}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {isEditing && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f8f9fa",
              borderRadius: 6,
              fontSize: "14px",
              color: "#6c757d",
            }}
          >
            <strong>ID:</strong> {initialValues?.id}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Nome do Material
          </label>
          <input
            {...register("name", { required: "Nome é obrigatório" })}
            placeholder="Ex: Plástico, Papel, Vidro..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
            }}
          />
          {errors.name && (
            <span
              style={{
                color: "#e74c3c",
                fontSize: 13,
                marginTop: 4,
                display: "block",
              }}
            >
              {errors.name.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Pontos para Coletor (por kg)
          </label>
          <input
            {...register("collectorPoints", {
              required: "Pontos do coletor são obrigatórios",
              valueAsNumber: true,
              min: { value: 0, message: "Pontos não podem ser negativos" },
            })}
            type="number"
            placeholder="20"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
            }}
          />
          {errors.collectorPoints && (
            <span
              style={{
                color: "#e74c3c",
                fontSize: 13,
                marginTop: 4,
                display: "block",
              }}
            >
              {errors.collectorPoints.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Pontos para Doador (por kg)
          </label>
          <input
            {...register("donorPoints", {
              required: "Pontos do doador são obrigatórios",
              valueAsNumber: true,
              min: { value: 0, message: "Pontos não podem ser negativos" },
            })}
            type="number"
            placeholder="10"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
            }}
          />
          {errors.donorPoints && (
            <span
              style={{
                color: "#e74c3c",
                fontSize: 13,
                marginTop: 4,
                display: "block",
              }}
            >
              {errors.donorPoints.message}
            </span>
          )}
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
            }}
          >
            <CircularProgress size={24} />
            <span style={{ color: "#6c757d" }}>Salvando...</span>
          </div>
        ) : (
          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isEditing ? "Salvar Alterações" : "Criar Material"}
          </button>
        )}
      </form>

      {message && (
        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            backgroundColor: message.includes("sucesso")
              ? "#d4edda"
              : "#f8d7da",
            color: message.includes("sucesso") ? "#155724" : "#721c24",
            borderRadius: "6px",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
