import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

const sxStyle = {
  color: "secondary.dark",
  justifyContent: "center",
  display: "flex",
};

const sxCenter = {
  justifyContent: "center",
  display: "flex",
};

const roleTranslate = {
  donor: "Doador",
  collector: "Coletor",
  manager: "Administrador",
};

const roleColor = {
  donor: "primary",
  collector: "secondary",
  manager: "default",
};

function SimpleDialog({ user, onClose, open }) {
  // Previne erros caso 'user' venha vazio no primeiro render
  if (!user) return null;

  return (
    <Dialog onClose={onClose} open={open}>
      <Box sx={{ padding: "20px" }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "center" }}
          useFlexGap
          flexWrap={"wrap"}
        >
          <Avatar
            alt={`Imagem de ${user.name}`}
            src={user.photo_url || "/icon.svg"}
            sx={{
              backgroundColor: "secondary.dark",
              padding: "3px",
              width: "100px",
              height: "100px",
            }}
          />

          <Container
            sx={{ padding: "0px", textAlign: "center" }}
            direction="row"
          >
            <Typography variant="h6" sx={sxCenter}>
              {user.name}
            </Typography>

            {/* Chip indicando a Role do usuário */}
            {user.role && (
              <Chip
                label={roleTranslate[user.role] || user.role}
                color={roleColor[user.role] || "default"}
                size="small"
                sx={{ mt: 0.5, mb: 1 }}
              />
            )}

            <Typography variant="subtitle1" sx={sxCenter}>
              {user.email}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center" }}
              useFlexGap
              flexWrap={"wrap"}
            >
              {user.phone && (
                <Typography variant="subtitle1">{user.phone}</Typography>
              )}
              {user.cpf && (
                <Typography variant="subtitle1">{user.cpf}</Typography>
              )}
            </Stack>

            <Typography variant="subtitle1" sx={{ ...sxCenter, mt: 2 }}>
              Total de Coletas: {user.statistic?.collectionsCompleted || 0}
            </Typography>
          </Container>
        </Stack>

        <Grid container spacing={2} columns={16} sx={{ marginTop: "10px" }}>
          <Grid item xs={8}>
            <Typography variant="subtitle2" sx={sxStyle}>
              Vidro: {user.statistic?.glassKg || 0} Kg
            </Typography>
            <Typography variant="subtitle2" sx={sxStyle}>
              Metal: {user.statistic?.metalKg || 0} Kg
            </Typography>
            <Typography variant="subtitle2" sx={sxStyle}>
              Eletrônico: {user.statistic?.eletronicKg || 0} Kg
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="subtitle2" sx={sxStyle}>
              Óleo: {user.statistic?.oilKg || 0} Kg
            </Typography>
            <Typography variant="subtitle2" sx={sxStyle}>
              Papel: {user.statistic?.paperKg || 0} Kg
            </Typography>
            <Typography variant="subtitle2" sx={sxStyle}>
              Plástico: {user.statistic?.plasticKg || 0} Kg
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}

export default function UserDialog({ user, open, setOpen }) {
  return (
    <SimpleDialog user={user} open={open} onClose={() => setOpen(false)} />
  );
}
