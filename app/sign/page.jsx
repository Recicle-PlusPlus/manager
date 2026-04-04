"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import { useRouter } from "next/navigation";
import { APPNAME } from "../../config/consts";

import { supabase } from "../../config/supabaseClient";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Sign() {
  const router = useRouter();
  const { setUserData } = useContext(UserContext);

  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Removido os placeholders hardcoded por segurança
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleError = (event, reason) => {
    if (reason === "clickaway") return;
    setError(false);
  };

  const handleSuccess = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccess(false);
  };

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email,
          password: password,
        },
      );

      if (authError) throw authError;

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.warn(
          "Perfil não encontrado na tabela pública users:",
          profileError,
        );
      }

      if (!userProfile || userProfile.role !== "manager") {
        await supabase.auth.signOut();
        throw new Error(
          "Acesso negado. Apenas administradores podem acessar este painel.",
        );
      }

      setUserData(userProfile);
      document.cookie = `token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;

      router.push("/logged");
    } catch (err) {
      setError({
        code: "Erro no Login",
        message: err.message || "Verifique suas credenciais.",
      });
      console.log("Não logado:", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "primary.dark",
        width: "100%",
        margin: "0px",
      }}
    >
      <Container
        fixed
        maxWidth="sm"
        sx={{
          my: "auto",
          backgroundColor: "background.main",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: 3,
        }}
      >
        <img
          src="/icon.svg"
          alt="App Logo"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            padding: "15px",
            marginTop: "-70px",
            backgroundColor: "#4CAF50",
            objectFit: "contain",
          }}
        />

        <Box sx={{ width: "100%", mt: 2 }}>
          <form
            onSubmit={handleLogin}
            style={{
              width: "100%",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                marginBottom: "40px",
                fontWeight: "bold",
                color: "primary.dark",
              }}
            >
              {APPNAME.toUpperCase()}
            </Typography>

            <TextField
              label="Email"
              placeholder="exemplo@exemplo.com"
              disabled={loading}
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              sx={{
                color: "primary.main",
                width: { sm: "80%", xs: "90%" },
                marginBottom: "25px",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="secondary" />
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />

            <TextField
              label="Senha"
              placeholder="**********"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              sx={{
                color: "primary.main",
                width: { sm: "80%", xs: "90%" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      sx={{ marginRight: "0px" }}
                      onClick={handleClickShowPassword}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff color="secondary" />
                      ) : (
                        <Visibility color="secondary" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />

            <LoadingButton
              size="large"
              type="submit"
              loading={loading}
              variant="contained"
              color="primary"
              sx={{
                marginTop: "45px",
                marginBottom: "15px",
                width: { sm: "70%", xs: "90%" },
                borderRadius: "25px",
              }}
            >
              <span>Entrar no Painel</span>
            </LoadingButton>
          </form>
        </Box>
      </Container>

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
    </Box>
  );
}
