// Gera o relatório completo do dashboard em Excel (.xlsx), com uma aba por assunto.

const SHEETJS_URL =
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

const CRITERIA = [
  ["punctuality_rating", "Pontualidade"],
  ["material_care_rating", "Cuidado com o material"],
  ["communication_rating", "Comunicação"],
  ["courtesy_rating", "Cordialidade"],
  ["collection_experience_rating", "Experiência da coleta"],
  ["material_condition_rating", "Condição do material"],
  ["description_accuracy_rating", "Descrição fiel"],
  ["pickup_readiness_rating", "Material pronto na hora"],
  ["wait_time_rating", "Tempo de espera"],
];

const CRITERIA_KEYS = {
  punctuality: "Pontualidade",
  material_care: "Cuidado com o material",
  communication: "Comunicação",
  courtesy: "Cordialidade",
  collection_experience: "Experiência da coleta",
  material_condition: "Condição do material",
  description_accuracy: "Descrição fiel",
  pickup_readiness: "Material pronto na hora",
  wait_time: "Tempo de espera",
};

function loadSheetJS() {
  if (typeof window !== "undefined" && window.XLSX)
    return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SHEETJS_URL;
    script.onload = () => resolve(window.XLSX);
    script.onerror = () =>
      reject(new Error("Não foi possível carregar a biblioteca de planilhas."));
    document.head.appendChild(script);
  });
}

const num = (v, digits = 1) =>
  v === null || v === undefined || v === ""
    ? ""
    : Number(Number(v).toFixed(digits));
const date = (v) => (v ? new Date(v).toLocaleDateString("pt-BR") : "");
const dateTime = (v) => (v ? new Date(v).toLocaleString("pt-BR") : "");
const blankZero = (v) => (v ? Number(v) : "");
const first = (data) => (Array.isArray(data) ? data[0] : data) || {};

async function rpc(supabase, name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) {
    console.warn(`[export] ${name}:`, error.message);
    return null;
  }
  return data;
}

function makeSheet(XLSX, rows, emptyMessage = "Sem dados") {
  const data = rows && rows.length ? rows : [{ Aviso: emptyMessage }];
  const sheet = XLSX.utils.json_to_sheet(data);
  const headers = Object.keys(data[0]);
  sheet["!cols"] = headers.map((h) => {
    const longest = Math.max(
      h.length,
      ...data.map((r) => String(r[h] ?? "").length),
    );
    return { wch: Math.min(Math.max(longest + 2, 10), 60) };
  });
  return sheet;
}

function criteriaColumns(criteria) {
  const out = {};
  Object.entries(CRITERIA_KEYS).forEach(([key, label]) => {
    const v = criteria?.[key];
    out[label] = v ? num(v, 2) : "";
  });
  return out;
}

export async function exportDashboardReport(supabase) {
  const XLSX = await loadSheetJS();

  const [
    userCounts,
    evolution,
    distribution,
    donorStats,
    topDonors,
    ratedDonors,
    collectorStats,
    collectorMaterials,
    ratedCollectors,
    reviews,
  ] = await Promise.all([
    rpc(supabase, "get_user_counts"),
    rpc(supabase, "get_monthly_evolution"),
    rpc(supabase, "get_waste_distribution"),
    rpc(supabase, "get_donor_stats"),
    rpc(supabase, "get_top_donors_detailed", { p_limit: 10000 }),
    rpc(supabase, "get_top_rated_donors", { p_min_reviews: 1, p_limit: 10000 }),
    rpc(supabase, "get_collector_stats"),
    rpc(supabase, "get_top_collectors_by_material", { p_limit: 10000 }),
    rpc(supabase, "get_top_rated_collectors", {
      p_min_reviews: 1,
      p_limit: 10000,
    }),
    rpc(supabase, "get_reviews_export"),
  ]);

  const { count: collectionsCount } = await supabase
    .from("donations")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const ds = first(donorStats);
  const cs = first(collectorStats);
  const totalWeight = (distribution || []).reduce(
    (acc, r) => acc + Number(r.total_weight || 0),
    0,
  );

  // ---- Aba: Resumo ----
  const resumo = [
    { Seção: "Relatório", Indicador: "Gerado em", Valor: dateTime(new Date()) },
    {
      Seção: "Geral",
      Indicador: "Coletores ativos",
      Valor: userCounts?.collectors ?? "",
    },
    {
      Seção: "Geral",
      Indicador: "Doadores ativos",
      Valor: userCounts?.donors ?? "",
    },
    {
      Seção: "Geral",
      Indicador: "Resíduos coletados (kg)",
      Valor: num(totalWeight),
    },
    {
      Seção: "Geral",
      Indicador: "Coletas concluídas",
      Valor: collectionsCount ?? "",
    },
    {
      Seção: "Doadores",
      Indicador: "Média por doação (kg)",
      Valor: num(ds.avg_kg_per_donation),
    },
    {
      Seção: "Doadores",
      Indicador: "Média por doador (kg)",
      Valor: num(ds.avg_kg_per_donor),
    },
    {
      Seção: "Doadores",
      Indicador: "Doadores com doação concluída",
      Valor: ds.total_donors_with_donation ?? "",
    },
    {
      Seção: "Doadores",
      Indicador: "Doadores recorrentes (2+ doações)",
      Valor: ds.recurring_donors ?? "",
    },
    {
      Seção: "Doadores",
      Indicador: "Inativos há +60 dias",
      Valor: ds.inactive_donors ?? "",
    },
    {
      Seção: "Doadores",
      Indicador: "Nota média",
      Valor: num(ds.avg_donor_rating, 2),
    },
    {
      Seção: "Coletores",
      Indicador: "Média por coleta (kg)",
      Valor: num(cs.avg_kg_per_collection),
    },
    {
      Seção: "Coletores",
      Indicador: "Coletas realizadas",
      Valor: cs.collections_done ?? "",
    },
    {
      Seção: "Coletores",
      Indicador: "Coletores com coleta realizada",
      Valor: cs.collectors_with_collection ?? "",
    },
    {
      Seção: "Coletores",
      Indicador: "Coletas canceladas",
      Valor: cs.cancelled_collections ?? "",
    },
    {
      Seção: "Coletores",
      Indicador: "Taxa de cancelamento (%)",
      Valor: num(cs.cancel_rate),
    },
    {
      Seção: "Coletores",
      Indicador: "Inativos há +60 dias",
      Valor: cs.inactive_collectors ?? "",
    },
    {
      Seção: "Coletores",
      Indicador: "Nota média",
      Valor: num(cs.avg_collector_rating, 2),
    },
  ];

  // ---- Aba: Resíduos ----
  const residuos = (distribution || []).map((r) => ({
    Material: r.material_name,
    "Total (kg)": num(r.total_weight),
    "% do total": totalWeight
      ? num((Number(r.total_weight) / totalWeight) * 100)
      : "",
  }));

  // ---- Aba: Evolução mensal ----
  const evolucao = (evolution || []).map((r) => ({
    Mês: r.month_name,
    "Peso (kg)": num(r.total_weight),
  }));

  // ---- Aba: Top doadores ----
  const doadores = (topDonors || []).map((d, i) => ({
    Posição: i + 1,
    Doador: d.donor_name,
    Doações: d.donations_count,
    "Material principal": d.main_material || "",
    "Última doação": date(d.last_donation_at),
    "Total doado (kg)": num(d.total_weight),
  }));

  // ---- Aba: Coletores (total + kg por material) ----
  const coletoresMap = {};
  const materiais = [];
  (collectorMaterials || []).forEach((r) => {
    if (!coletoresMap[r.collector_id]) {
      coletoresMap[r.collector_id] = {
        Coletor: r.collector_name,
        "Total reciclado (kg)": num(r.collector_total),
      };
    }
    coletoresMap[r.collector_id][r.material_name] = num(r.total_weight);
    if (!materiais.includes(r.material_name)) materiais.push(r.material_name);
  });
  const coletores = Object.values(coletoresMap)
    .sort((a, b) => b["Total reciclado (kg)"] - a["Total reciclado (kg)"])
    .map((c, i) => {
      const row = {
        Posição: i + 1,
        Coletor: c.Coletor,
        "Total reciclado (kg)": c["Total reciclado (kg)"],
      };
      materiais.forEach((m) => {
        row[`${m} (kg)`] = c[m] ?? "";
      });
      return row;
    });

  // ---- Abas: Ranking de avaliações ----
  const rankingAvaliacoes = (list, nameKey) =>
    (list || []).map((p, i) => ({
      Posição: i + 1,
      Nome: p[nameKey],
      "Nota média": num(p.average_rating, 2),
      Avaliações: p.review_count,
      ...criteriaColumns(p.criteria),
      "Último comentário": p.last_comment || "",
    }));

  // ---- Aba: Todas as avaliações e comentários ----
  const avaliacoes = (reviews || []).map((r) => {
    const row = {
      Data: dateTime(r.created_at),
      "Avaliado como": r.reviewee_role,
      Avaliado: r.reviewee_name || "",
      "Avaliado por": r.reviewer_name || "",
      Nota: blankZero(r.rating),
    };
    CRITERIA.forEach(([key, label]) => {
      row[label] = blankZero(r[key]);
    });
    row["Comentário"] = r.comment || "";
    row["ID da doação"] = r.donation_id || "";
    return row;
  });

  const comentarios = avaliacoes
    .filter((r) => r["Comentário"] && String(r["Comentário"]).trim())
    .map((r) => ({
      Data: r.Data,
      "Avaliado como": r["Avaliado como"],
      Avaliado: r.Avaliado,
      "Avaliado por": r["Avaliado por"],
      Nota: r.Nota,
      Comentário: r["Comentário"],
    }));

  // ---- Monta o arquivo ----
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(XLSX, resumo), "Resumo");
  XLSX.utils.book_append_sheet(wb, makeSheet(XLSX, residuos), "Resíduos");
  XLSX.utils.book_append_sheet(
    wb,
    makeSheet(XLSX, evolucao),
    "Evolução mensal",
  );
  XLSX.utils.book_append_sheet(wb, makeSheet(XLSX, doadores), "Top doadores");
  XLSX.utils.book_append_sheet(
    wb,
    makeSheet(
      XLSX,
      rankingAvaliacoes(ratedDonors, "donor_name"),
      "Nenhum doador avaliado",
    ),
    "Avaliação doadores",
  );
  XLSX.utils.book_append_sheet(wb, makeSheet(XLSX, coletores), "Top coletores");
  XLSX.utils.book_append_sheet(
    wb,
    makeSheet(
      XLSX,
      rankingAvaliacoes(ratedCollectors, "collector_name"),
      "Nenhum coletor avaliado",
    ),
    "Avaliação coletores",
  );
  XLSX.utils.book_append_sheet(
    wb,
    makeSheet(XLSX, comentarios, "Nenhum comentário"),
    "Comentários",
  );
  XLSX.utils.book_append_sheet(
    wb,
    makeSheet(XLSX, avaliacoes, "Nenhuma avaliação"),
    "Todas as avaliações",
  );

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `relatorio-recicle-${today}.xlsx`);
}
