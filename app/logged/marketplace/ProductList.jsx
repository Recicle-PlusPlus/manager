
import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function ProductList({ products, setEditingProduct, onDeleteProduct }) {
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
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleEditClick = (product, event) => {
    event.stopPropagation();
    if (setEditingProduct) {
      setEditingProduct(product);
    }
  };
  if (!products || products.length === 0) {
    return <div style={{ padding: 24 }}>Nenhum produto cadastrado.</div>;
  }
  
  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 2, mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="product table">
          <TableHead>
            <TableRow>
              <TableCell align="center"><b>ID</b></TableCell>
              <TableCell align="center"><b>Nome</b></TableCell>
              <TableCell align="center"><b>Categoria</b></TableCell>
              <TableCell align="center"><b>Preço (Pts)</b></TableCell>
              <TableCell align="center"><b>Estoque</b></TableCell>
              <TableCell align="center"><b>Imagem</b></TableCell>
              <TableCell align="center"><b>Ações</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p, idx) => (
              <TableRow
                key={p.intId || p.productId || p.id || `${p.name}-${p.category}`}
                hover
              >
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{p.intId || p.productId}</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{p.name}</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{p.category}</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{Number(p.currentPrice).toFixed(2)}</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{p.stock}</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                  {(p.imgUrl || p.imageUrl) && (
                    <img
                      src={p.imgUrl || p.imageUrl}
                      alt={p.name}
                      style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4 }}
                    />
                  )}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                  <IconButton
                    aria-label="editar"
                    color="primary"
                    onClick={(e) => handleEditClick(p, e)}
                    disabled={!setEditingProduct}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="deletar"
                    color="error"
                    onClick={(e) => handleDeleteClick(p, e)}
                    disabled={!onDeleteProduct}
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
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        loading={deleting}
      />
    </>
  );
}
