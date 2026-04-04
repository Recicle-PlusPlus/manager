import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

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

const statusTranslate = {
  active: "Ativo",
  blocked: "Bloqueado",
  pending: "Pendente",
};

const statusColor = {
  active: "success",
  blocked: "error",
  pending: "warning",
};

export default function ListPagination({
  users = [],
  amoutPages,
  page,
  handleEditUser,
  handleDeleteUser,
  handleActivateUser,
  handlePageChange,
}) {
  return (
    <Box
      sx={{
        minHeight: { sm: "65vh", xs: "77vh" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <List
        sx={{
          width: "100%",
          minWidth: "200px",
          bgcolor: "background.paper",
          margin: "0px",
          padding: "0px",
          marginBottom: "10px",
        }}
      >
        {users.map((user, index) => {
          const isBlocked = user.account_status === "blocked";

          return (
            <div key={user.id || index}>
              <ListItem
                alignItems="flex-start"
                sx={{ minWidth: "350px", margin: "0px", padding: "0px", pr: 6 }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={isBlocked ? "activate" : "deactivate"}
                    color={isBlocked ? "success" : "error"}
                    onClick={
                      isBlocked
                        ? () => handleActivateUser(user)
                        : () => handleDeleteUser(user)
                    }
                  >
                    {isBlocked ? <AddCircleOutlinedIcon /> : <DoDisturbIcon />}
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleEditUser(user)}>
                  <ListItemAvatar>
                    <Avatar
                      alt={`Imagem de ${user.name}`}
                      src={user.photo_url || "/icon.svg"}
                      sx={{ backgroundColor: "secondary.dark", padding: "3px" }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          component="span"
                          sx={{ fontWeight: "bold" }}
                        >
                          {user.name}
                        </Typography>

                        {/* Chip de Tipo de Conta */}
                        {user.role && (
                          <Chip
                            label={roleTranslate[user.role] || user.role}
                            color={roleColor[user.role] || "default"}
                            size="small"
                            sx={{ height: "20px", fontSize: "0.7rem" }}
                          />
                        )}

                        {/* Chip de Status da Conta */}
                        {user.account_status && (
                          <Chip
                            label={
                              statusTranslate[user.account_status] ||
                              user.account_status
                            }
                            color={
                              statusColor[user.account_status] || "default"
                            }
                            variant="outlined"
                            size="small"
                            sx={{ height: "20px", fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: "inline", marginRight: "10px" }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {user.email}
                        </Typography>
                        <Typography
                          sx={{ display: "inline" }}
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {user.phone || "Sem telefone"}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider variant="inset" component="li" />
            </div>
          );
        })}
      </List>

      <Pagination
        count={amoutPages}
        color="primary"
        page={page}
        onChange={handlePageChange}
        sx={{
          marginTop: "15px",
          justifyContent: "center",
          display: "flex",
        }}
      />
    </Box>
  );
}
