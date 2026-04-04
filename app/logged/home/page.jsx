"use client";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListPagination from "../components/listPagination";
import UserDialog from "../components/userDialog";
import ConfirmDialog from "../components/confirmDialog";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../config/supabaseClient";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Home() {
  const [page, setPage] = useState(1);
  const [maxPerPage, setMaxPerPage] = useState(5);
  const [amoutPages, setAmoutPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [message, setMessage] = useState({
    confirm: () => {},
    title: "",
    text: "",
  });
  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [text, setText] = useState("");
  const [current, setCurrent] = useState({});
  const [users, setUsers] = useState([]);
  const [usersFilter, setUsersFilter] = useState([]);

  // Filtros
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'blocked'

  // Responsividade da paginação
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < window.innerHeight) {
        setMaxPerPage(8);
      } else {
        setMaxPerPage(5);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Busca os dados no Supabase
  const fetchUsers = async () => {
    try {
      let query = supabase.from("users").select("*").order("name");

      // Filtro de Papel
      if (roleFilter === "all") {
        query = query.in("role", ["collector", "donor"]);
      } else {
        query = query.eq("role", roleFilter);
      }

      // Filtro de Status
      if (statusFilter === "all") {
        query = query.in("account_status", ["active", "blocked"]);
      } else {
        query = query.eq("account_status", statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      setError({
        code: "Erro",
        message: "Falha ao buscar usuários: " + err.message,
      });
    }
  };

  // Recarrega os dados quando os filtros mudam
  useEffect(() => {
    fetchUsers();
    setPage(1);
  }, [roleFilter, statusFilter]);

  // Paginação e Busca Local
  useEffect(() => {
    const filteredArray = users.filter((item) =>
      item.name?.toLowerCase().includes(text.toLowerCase()),
    );
    setAmoutPages(Math.ceil(filteredArray.length / maxPerPage) || 1);

    const startIndex = (page - 1) * maxPerPage;
    const endIndex = startIndex + maxPerPage;
    const paginatedArray = filteredArray.slice(startIndex, endIndex);

    setUsersFilter(paginatedArray);
  }, [page, maxPerPage, text, users]);

  const handleError = (event, reason) => {
    if (reason === "clickaway") return;
    setError(false);
  };

  const handleSuccess = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccess(false);
  };

  function handleEditUser(user) {
    setCurrent(user);
    setOpenDialog(true);
  }

  // Bloquear Usuário
  function handleDeleteUser(user) {
    const roleName = user.role === "donor" ? "doador" : "coletor";
    setMessage({
      title: `Bloquear ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}`,
      text: `Tem certeza que deseja bloquear o ${roleName}? Após realizar essa operação o usuário ficará inativo e não conseguirá mais utilizar o sistema.`,
      confirm: async () => {
        try {
          const { error } = await supabase
            .from("users")
            .update({ account_status: "blocked" })
            .eq("id", user.id);

          if (error) throw error;

          setSuccess({ code: 200, message: "Usuário desativado com sucesso!" });
          setConfirmDialog(false);
          fetchUsers();
        } catch (err) {
          setError({ code: "Erro", message: err.message });
        }
      },
    });
    setConfirmDialog(true);
  }

  // Ativar Usuário
  function handleActivateUser(user) {
    const roleName = user.role === "donor" ? "doador" : "coletor";
    setMessage({
      title: `Ativar ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}`,
      text: `Tem certeza que deseja ativar o ${roleName}? Após realizar essa operação o usuário poderá utilizar o sistema normalmente.`,
      confirm: async () => {
        try {
          const { error } = await supabase
            .from("users")
            .update({ account_status: "active" })
            .eq("id", user.id);

          if (error) throw error;

          setSuccess({ code: 200, message: "Usuário ativado com sucesso!" });
          setConfirmDialog(false);
          fetchUsers();
        } catch (err) {
          setError({ code: "Erro", message: err.message });
        }
      },
    });
    setConfirmDialog(true);
  }

  function handlePageChange(event, value) {
    setPage(value);
  }

  return (
    <>
      <Stack>
        <Typography variant="h5" component="div" gutterBottom>
          Gerenciamento de Usuários
        </Typography>
        <Paper
          component="form"
          sx={{
            p: "1px 4px",
            margin: "10px 0px 10px 20px",
            display: "flex",
            alignItems: "center",
            minWidth: 300,
            flexGrow: { xs: 1, sm: 0.8, md: 0.8 },
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscar por nome"
          />
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

          <FormControl variant="standard" sx={{ minWidth: 120, mx: 1 }}>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              disableUnderline
            >
              <MenuItem value="all">Perfis (Todos)</MenuItem>
              <MenuItem value="collector">Coletores</MenuItem>
              <MenuItem value="donor">Doadores</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

          <FormControl variant="standard" sx={{ minWidth: 120, mx: 1 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disableUnderline
            >
              <MenuItem value="all">Status (Todos)</MenuItem>
              <MenuItem value="active">Ativos</MenuItem>
              <MenuItem value="blocked">Bloqueados</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Stack>

      <ListPagination
        users={usersFilter}
        amoutPages={amoutPages}
        page={page}
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
        handleActivateUser={handleActivateUser}
        handlePageChange={handlePageChange}
      />

      <ConfirmDialog
        setOpen={setConfirmDialog}
        open={confirmDialog}
        onConfirm={message.confirm}
        title={message.title}
        text={message.text}
      />

      <UserDialog user={current} open={openDialog} setOpen={setOpenDialog} />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleError}>
        <Alert onClose={handleError} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleSuccess}
      >
        <Alert
          onClose={handleSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success.message}
        </Alert>
      </Snackbar>
    </>
  );
}
