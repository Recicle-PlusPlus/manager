import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

export default function MaterialList({ materials, setEditingMaterial }) {
  if (!materials || materials.length === 0) {
    return <div style={{ padding: 24 }}>Nenhum material cadastrado.</div>;
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 2, mt: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="materials table">
        <TableHead>
          <TableRow>
            <TableCell align="center"><b>ID</b></TableCell>
            <TableCell align="center"><b>Nome</b></TableCell>
            <TableCell align="center"><b>Pontos Coletor (kg)</b></TableCell>
            <TableCell align="center"><b>Pontos Doador (kg)</b></TableCell>
            <TableCell align="center"><b>Status</b></TableCell>
            <TableCell align="center"><b>Ações</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {materials.map((material) => (
            <TableRow
              key={material.id}
              hover
            >
              <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{material.id}</TableCell>
              <TableCell align="center" sx={{ verticalAlign: 'middle', fontWeight: 600 }}>
                {material.name}
              </TableCell>
              <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                {material.collectorPoints} pontos
              </TableCell>
              <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                {material.donorPoints} pontos
              </TableCell>
              <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: material.active ? '#d4edda' : '#f8d7da',
                  color: material.active ? '#155724' : '#721c24'
                }}>
                  {material.active ? 'Ativo' : 'Inativo'}
                </span>
              </TableCell>
              <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                <IconButton
                  aria-label="editar"
                  color="primary"
                  onClick={() => setEditingMaterial && setEditingMaterial(material)}
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
