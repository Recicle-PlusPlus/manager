import React from 'react';
import Box from '@mui/material/Box';
import ProductList from './ProductList';
import ProductInsertForm, { FormValues } from './ProductInsertForm';

export default function ProductListWithEdit({ products, onEdit }) {
  const [editing, setEditing] = React.useState<FormValues | null>(null);

  const handleEdit = (product) => {
    setEditing(product);
    if (onEdit) onEdit(product);
  };

  return (
    <Box>
      {editing ? (
        <ProductInsertForm initialValues={editing} onSuccess={() => setEditing(null)} />
      ) : (
        <ProductList products={products} setEditingProduct={handleEdit} />
      )}
    </Box>
  );
}
