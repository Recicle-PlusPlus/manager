"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import MaterialListContainer from './MaterialListContainer';

export default function MaterialsPage() {
  const [reloadList, setReloadList] = useState(false);

  return (
    <Box sx={{ maxWidth: 1200, margin: '24px auto', fontFamily: 'sans-serif' }}>
      <Box sx={{ mb: 3 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Gerenciar Materiais</h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Configure os pontos que cada material reciclável gera para coletores e doadores.
        </p>
      </Box>

      <MaterialListContainer reload={reloadList} />
    </Box>
  );
}
