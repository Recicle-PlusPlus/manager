import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
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

export default function ListChoice({ data, handleAcept, handleDeny }) {
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
        {data.map((item, index) => (
          <div key={item.id || index}>
            <ListItem
              alignItems="flex-start"
              sx={{ minWidth: "350px", margin: "0px", padding: "0px", pr: 10 }}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    aria-label="deny"
                    color="error"
                    sx={{ marginRight: "10px" }}
                    onClick={() => handleDeny(item)}
                  >
                    <CloseIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="accept"
                    color="success"
                    onClick={() => handleAcept(item)}
                  >
                    <CheckIcon />
                  </IconButton>
                </>
              }
            >
              <Box
                sx={{
                  display: "flex",
                  padding: "10px",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={item.name}
                    src={item.photo_url || "/icon.svg"}
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
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{ fontWeight: "bold" }}
                      >
                        {item.name}
                      </Typography>
                      {item.role && (
                        <Chip
                          label={roleTranslate[item.role] || item.role}
                          color={roleColor[item.role] || "default"}
                          size="small"
                          sx={{ height: "20px", fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: "block", mb: 0.5 }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {item.email}
                      </Typography>
                      <Typography
                        sx={{ display: "inline", marginRight: "15px" }}
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        <strong>CPF:</strong> {item.cpf || "Não informado"}
                      </Typography>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        <strong>Tel:</strong> {item.phone || "Não informado"}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </Box>
            </ListItem>
            <Divider variant="inset" component="li" />
          </div>
        ))}
      </List>
    </Box>
  );
}
