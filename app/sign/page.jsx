"use client";
import * as React from "react";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Image from "next/image";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import { useRouter } from "next/navigation";
import { APPNAME } from "../../config/consts";

// Importe o cliente do Supabase
import { supabase } from "../../config/supabaseClient";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Sign() {
  const router = useRouter();
  const { setUserData } = useContext(UserContext); // Removi o 'user' não utilizado para limpar warnings

  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingSignUp, setLoadingSignUp] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const [email, setEmail] = React.useState("adm@adm.com");
  const [password, setPassword] = React.useState("adminadmin");

  const [fullName, setFullName] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [emailSignUp, setEmailSignUp] = React.useState("");

  function handleCpfChange(event) {
    const value = event.target.value;
    const numericValue = value.replace(/\D/g, "");

    if (value.length <= 11) {
      const maskedValue = numericValue.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4",
      );
      setCpf(maskedValue);
    }
  }

  const handleError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError(false);
  };
  const handleSuccess = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccess(false);
  };

  // ---------------------- Faz Login (Supabase Auth) ----------------------------
  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);

    try {
      // 1. Autentica no Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email,
          password: password,
        },
      );

      if (authError) throw authError;

      // 2. Busca o perfil completo na tabela 'users' para alimentar o Context
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (profileError) {
        console.warn(
          "Perfil não encontrado na tabela pública users:",
          profileError,
        );
      }

      setUserData(userProfile || data.user);

      // 3. Define o cookie 'token' exigido pelo seu middleware.js
      document.cookie = `token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;

      router.push("/logged");
    } catch (err) {
      setError({
        code: "Erro no Login",
        message: err.message || "Verifique suas credenciais.",
      });
      console.log("Não logado");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------- Faz Cadastro (Solicitação) ----------------------------
  async function handleSignUp(event) {
    event.preventDefault();
    setLoadingSignUp(true);

    try {
      // Como não há senha neste formulário, tratamos como uma "Solicitação de Cadastro".
      // Futuramente, você pode criar uma tabela 'signup_requests' e inserir os dados lá:
      /*
      const { error: insertError } = await supabase.from('signup_requests').insert({
        name: fullName,
        cpf: cpf,
        email: emailSignUp
      });
      if (insertError) throw insertError;
      */

      // Simulando o sucesso da solicitação
      setSuccess({
        code: "Sucesso",
        message:
          "Solicitação de cadastro enviada com sucesso! Aguarde a aprovação do administrador e fique atento ao seu email, você será notificado quando acontecer.",
      });

      // Limpa os campos
      setFullName("");
      setCpf("");
      setEmailSignUp("");
    } catch (err) {
      setError({
        code: "Erro no Cadastro",
        message: err.message || "Falha ao solicitar cadastro.",
      });
    } finally {
      setLoadingSignUp(false);
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
        maxWidth="lg"
        sx={{
          my: { xs: 4, sm: "auto" },
          mx: { xs: 4, sm: 10, md: 25 },
          backgroundColor: "background.main",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <Image
          src="/icon.svg"
          alt="Vercel Logo"
          width={100}
          height={100}
          priority
          className="opacity-black"
          style={{
            borderRadius: "50%",
            padding: "15px",
            marginTop: "-70px",
            marginLeft: "-70px",
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row-reverse" }}
          spacing={{ xs: 3, md: 2 }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ color: "black", backgroundColor: "black" }}
            />
          }
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
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
                sx={{ marginBottom: "40px" }}
              >
                {APPNAME.toUpperCase()}
              </Typography>
              <TextField
                label="Email"
                placeholder="exemplo@exemplo.com"
                disabled={loading || loadingSignUp}
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                type="text"
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
                disabled={loading || loadingSignUp}
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
                variant="text"
                sx={{
                  marginTop: "35px",
                  width: { sm: "70%", xs: "90%" },
                }}
              >
                <span>Entrar</span>
              </LoadingButton>
            </form>
          </Box>

          {/* ----------- Sign in Side ----------- */}
          <Box
            sx={{
              width: "100%",
            }}
          >
            <form
              onSubmit={handleSignUp}
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ marginBottom: "20px" }}
              >
                Cadastro
              </Typography>

              <TextField
                label="Nome Completo"
                placeholder="João da Silva"
                required
                disabled={loading || loadingSignUp}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                sx={{
                  color: "primary.main",
                  width: { sm: "80%", xs: "90%" },
                  marginBottom: "25px",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <DriveFileRenameOutlineIcon color="secondary" />
                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />

              <TextField
                label="CPF*"
                value={cpf}
                placeholder="999.999.999-99"
                onChange={handleCpfChange}
                type="text"
                disabled={loading || loadingSignUp}
                sx={{
                  color: "primary.main",
                  width: { sm: "80%", xs: "90%" },
                  marginBottom: "25px",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <ContactEmergencyIcon color="secondary" />
                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />

              <TextField
                label="Email"
                placeholder="exemplo@exemplo.com"
                disabled={loading || loadingSignUp}
                required
                value={emailSignUp}
                onChange={(e) => setEmailSignUp(e.target.value)}
                type="text"
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

              <LoadingButton
                size="large"
                type="submit"
                loading={loadingSignUp}
                variant="text"
                sx={{
                  marginTop: "10px",
                  width: { sm: "70%", xs: "90%" },
                  backgroundColor: "secondary.opaque",
                }}
              >
                <span>Solicitar</span>
              </LoadingButton>
            </form>
          </Box>
        </Stack>
      </Container>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleError}>
        <Alert onClose={handleError} severity="error" sx={{ width: "100%" }}>
          Code: {error.code} - {error.message}
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
          {success.code} - {success.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
