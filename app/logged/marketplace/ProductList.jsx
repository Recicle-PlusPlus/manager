import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

export default function ProductList({
  products,
  setEditingProduct,
  onDeleteProduct,
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteClick = (product, event) => {
    event.stopPropagation();
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || !onDeleteProduct) return;
    setDeleting(true);
    try {
      await onDeleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      alert(
        "Erro ao desativar produto: " + (error.message || "Erro desconhecido"),
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!products || products.length === 0) {
    return <div style={{ padding: 24 }}>Nenhum produto cadastrado.</div>;
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ boxShadow: 0, borderRadius: 2, mt: 2 }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="product table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <b>Imagem</b>
              </TableCell>
              <TableCell align="center">
                <b>Nome</b>
              </TableCell>
              <TableCell align="center">
                <b>Preço (Pontos)</b>
              </TableCell>
              <TableCell align="center">
                <b>Estoque</b>
              </TableCell>
              <TableCell align="center">
                <b>Status</b>
              </TableCell>
              <TableCell align="center">
                <b>Ações</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "contain",
                        borderRadius: 4,
                        filter: p.is_active ? "none" : "grayscale(100%)",
                      }}
                    />
                  )}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                  {p.name}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    color: "#006241",
                  }}
                >
                  {p.price_points}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                  {p.stock}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: p.is_active ? "#d4edda" : "#f8d7da",
                      color: p.is_active ? "#155724" : "#721c24",
                    }}
                  >
                    {p.is_active ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(p);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => handleDeleteClick(p, e)}
                    disabled={!p.is_active}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        loading={deleting}
      />
    </>
  );
}
