"use client";

import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ProductListContainer from "./ProductListContainer";
import ProductInsertForm from "./ProductInsertForm";

export default function MarketplacePage() {
  const isMarketplaceEnabled =
    process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  const [tab, setTab] = useState(0);
  const [reloadList, setReloadList] = useState(0);

  if (!isMarketplaceEnabled) {
    return (
      <Box
        sx={{
          maxWidth: 900,
          margin: "48px auto",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Marketplace</h2>
        <p style={{ color: "#666" }}>Esta funcionalidade está desativada.</p>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, margin: "24px auto", fontFamily: "sans-serif" }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        aria-label="Marketplace Tabs"
        sx={{ mb: 3 }}
      >
        <Tab label="Produtos" />
        <Tab label="Inserir Produto" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <button
              onClick={() => setTab(1)}
              style={{
                padding: "8px 16px",
                background: "#006241",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Inserir novo produto
            </button>
          </Box>
          <ProductListContainer reload={reloadList} />
        </Box>
      )}

      {tab === 1 && (
        <ProductInsertForm
          onSuccess={() => {
            setReloadList((prev) => prev + 1);
            setTab(0); // Volta para a lista após criar com sucesso
          }}
        />
      )}
    </Box>
  );
}
