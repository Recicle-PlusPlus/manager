"use client";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import {
  getAccessDennyHtml,
  getAccessAcceptHtml,
} from "../../../services/emailsTemplate";
import { sendEmail } from "../../../services/sendEmail";

import ListChoice from "../components/list";

import { supabase } from "../../../config/supabaseClient";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Requests() {
  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca as solicitações pendentes
  async function fetchPendingRequests() {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("account_status", "pending")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      console.error("Erro ao buscar solicitações:", err);
      setError({ code: "Erro", message: "Falha ao carregar solicitações." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // APROVAR USUÁRIO
  async function handleAcept(user) {
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ account_status: "active" })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await sendEmail(
        user.email,
        "Cadastro Aprovado (Recicle++)",
        getAccessAcceptHtml(
          "http://localhost:3000/sign",
          user.name,
          user.email,
          "Recicle++ (Donor)",
        ),
      );

      setRequests((prev) => prev.filter((req) => req.id !== user.id));
      setSuccess({ code: 200, message: "Cadastro aprovado com sucesso!" });
    } catch (err) {
      console.error("Erro ao aprovar:", err);
      setError({
        code: "Erro",
        message: err.message || "Falha ao aprovar cadastro.",
      });
    }
  }

  // REJEITAR USUÁRIO
  async function handleDeny(user) {
    try {
      // 1. Deleta a solicitação da tabela users
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteError) throw deleteError;

      // 2. Envia o email de rejeição
      await sendEmail(
        user.email,
        "Cadastro Negado (Recicle++)",
        getAccessDennyHtml(user.name, "Recicle++ (Donor)"),
      );

      // 3. Remove o usuário da lista na tela
      setRequests((prev) => prev.filter((req) => req.id !== user.id));
      setSuccess({ code: 200, message: "Cadastro negado e removido." });
    } catch (err) {
      console.error("Erro ao rejeitar:", err);
      setError({
        code: "Erro",
        message: err.message || "Falha ao rejeitar cadastro.",
      });
    }
  }

  if (loading) {
    return (
      <Typography variant="h6" sx={{ mt: 2 }}>
        Carregando solicitações...
      </Typography>
    );
  }

  return (
    <>
      {requests.length === 0 ? (
        <Typography variant="h5" component="div" gutterBottom>
          Não há solicitações de cadastro
        </Typography>
      ) : (
        <>
          <Typography variant="h5" component="div" gutterBottom>
            Solicitações de Cadastro
          </Typography>

          <ListChoice
            data={requests}
            handleAcept={handleAcept}
            handleDeny={handleDeny}
          />
        </>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
      >
        <Alert
          onClose={() => setError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success.message}
        </Alert>
      </Snackbar>
    </>
  );
}
