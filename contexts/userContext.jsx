"use client";
import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export const UserContext = createContext();

export const defaultUser = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  role: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  },
  photo_url: "",
  id: "",
};

export default function UserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Setters granulares mantidos
  function setUserData(data) {
    setUser((prev) => ({ ...prev, ...data }));
  }
  function setName(name) {
    setUser((prev) => ({ ...prev, name }));
  }
  function setEmail(email) {
    setUser((prev) => ({ ...prev, email }));
  }
  function setCpf(cpf) {
    setUser((prev) => ({ ...prev, cpf }));
  }
  function setPhone(phone) {
    setUser((prev) => ({ ...prev, phone }));
  }
  function setPhotoUrl(photoUrl) {
    setUser((prev) => ({ ...prev, photoUrl }));
  }
  function setId(id) {
    setUser((prev) => ({ ...prev, id }));
  }
  function setType(type) {
    setUser((prev) => ({ ...prev, type }));
  }
  function setStreet(street) {
    setUser((prev) => ({ ...prev, address: { ...prev.address, street } }));
  }
  function setNumber(number) {
    setUser((prev) => ({ ...prev, address: { ...prev.address, number } }));
  }
  function setComplement(complement) {
    setUser((prev) => ({ ...prev, address: { ...prev.address, complement } }));
  }
  function setNeighborhood(neighborhood) {
    setUser((prev) => ({
      ...prev,
      address: { ...prev.address, neighborhood },
    }));
  }
  function setCity(city) {
    setUser((prev) => ({ ...prev, address: { ...prev.address, city } }));
  }
  function setState(state) {
    setUser((prev) => ({ ...prev, address: { ...prev.address, state } }));
  }

  useEffect(() => {
    let isMounted = true;

    // 1. Checa se o usuário já estava logado quando a página carregou/recarregou
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session && isMounted) {
          // Busca os dados complementares do usuário na tabela pública
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUserData({
              id: profile.id,
              name: profile.name || "",
              email: profile.email || "",
              cpf: profile.cpf || "",
              phone: profile.phone || "",
              type: profile.role || "",
              photoUrl: profile.photo_url || "",
            });
          } else {
            // Se não achar perfil, seta apenas os dados básicos da Auth
            setUserData({
              id: session.user.id,
              email: session.user.email || "",
            });
          }
        }
      } catch (error) {
        console.error("Erro ao recuperar sessão:", error);
      } finally {
        if (isMounted) setIsAuthLoaded(true);
      }
    };

    checkInitialSession();

    // 2. Fica escutando atualizações (ex: renovação de token ou logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Atualiza o cookie para o middleware.js não barrar a rota
        document.cookie = `token=${session.access_token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        // Limpa o estado e o cookie em caso de logout
        if (isMounted) setUser(defaultUser);
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Enquanto não terminar de checar a sessão do Supabase, não renderiza as telas
  // Isso previne que um F5 chute o usuário de volta pra tela de Sign
  if (!isAuthLoaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUserData,
        setName,
        setEmail,
        setCpf,
        setPhone,
        setPhotoUrl,
        setId,
        setType,
        setStreet,
        setNumber,
        setComplement,
        setNeighborhood,
        setCity,
        setState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
