"use client";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Firestore, Storage } from "../../../config/firebase";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import React, { useState } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ProductListContainer from './ProductListContainer';
import ProductInsertForm from './ProductInsertForm';
const firestoreRefMarketplace = collection(Firestore, 'marketplace');

type FormValues = {
  productId: string;
  name: string;
  description: string;
  currentPrice: string;
  originalPrice: string;
  stock: number;
  category: string;
  file: File | null;
}

enum ProductCategory {
  Sports = "Esportes",
  Clothing = "Roupas",
  Entertainment = "Entretenimento",
  Electronics = "Eletrônicos",
  Home = "Casa",
  Sustainable = "Sustentável"
}

export default function MarketplacePage() {
  // Tabs: 0 = Listar Produtos, 1 = Inserir Produto
  const [tab, setTab] = useState(0);
  const [reloadList, setReloadList] = useState(false);

  return (
    <Box sx={{ maxWidth: 900, margin: '24px auto', fontFamily: 'sans-serif' }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Marketplace Tabs" sx={{ mb: 3 }}>
        <Tab label="Produtos" />
        <Tab label="Inserir Produto" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <button onClick={() => setTab(1)} style={{ padding: '8px 16px', background: '#006241', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Inserir novo produto
            </button>
          </Box>
          <ProductListContainer reload={reloadList} />
        </Box>
      )}
      {tab === 1 && (
        <ProductInsertForm onSuccess={() => setReloadList((v) => !v)} />
      )}
    </Box>
  );
}