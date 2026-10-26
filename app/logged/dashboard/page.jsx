"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUser,
  faRecycle,
  faHandshake,
  faTrophy,
  faStar,
  faStarHalfStroke,
  faScaleBalanced,
  faRotate,
  faUserClock,
  faAward,
  faTruck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { supabase } from "../../../config/supabaseClient";
import { exportDashboardReport } from "./exportReport";
import { faFileArrowDown, faSpinner } from "@fortawesome/free-solid-svg-icons";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

const MIN_REVIEWS = 1;

const CRITERIA_LABELS = {
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

const tooltipStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "none",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

function Stars({ value }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let icon = faStarEmpty;
    if (value >= i) icon = faStar;
    else if (value >= i - 0.5) icon = faStarHalfStroke;
    stars.push(<FontAwesomeIcon key={i} icon={icon} color="#f5b301" />);
  }
  return (
    <span
      className={styles.stars}
      aria-label={`${value.toFixed(1)} de 5 estrelas`}
    >
      {stars}
    </span>
  );
}

function bestCriterion(criteria) {
  if (!criteria) return null;
  const entries = Object.entries(criteria)
    .map(([key, val]) => [key, Number(val) || 0])
    .filter(([, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  return CRITERIA_LABELS[entries[0][0]] || entries[0][0];
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function daysSince(value) {
  if (!value) return null;
  return Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
}

function KpiCards({ items }) {
  if (!items.length) return null;
  return (
    <div className={styles.kpiGrid}>
      {items.map((item, index) => (
        <div
          key={index}
          className={styles.card}
          style={{ borderTop: `4px solid ${item.color}` }}
        >
          <div
            className={styles.iconContainer}
            style={{ backgroundColor: `${item.color}20` }}
          >
            <FontAwesomeIcon icon={item.icon} color={item.color} />
          </div>
          <div className={styles.info}>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
            {item.hint && <span className={styles.hint}>{item.hint}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopRatedList({ title, people, emptyText }) {
  return (
    <div className={styles.chartCard}>
      <h2>
        <FontAwesomeIcon icon={faAward} color="#f5b301" /> {title}
      </h2>
      {people.length > 0 ? (
        <ul className={styles.ratedList}>
          {people.map((person, index) => {
            const rating = Number(person.average_rating) || 0;
            const best = bestCriterion(person.criteria);
            return (
              <li key={person.id || index} className={styles.ratedItem}>
                <span className={styles.ratedPos}>#{index + 1}</span>
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt=""
                    className={styles.avatar}
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    {(person.name || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <div className={styles.ratedInfo}>
                  <div className={styles.ratedHeader}>
                    <strong>{person.name}</strong>
                    <span className={styles.ratedScore}>
                      <Stars value={rating} /> {rating.toFixed(1)}
                      <small> ({person.review_count})</small>
                    </span>
                  </div>
                  {best && (
                    <span className={styles.badge}>Destaque: {best}</span>
                  )}
                  {person.last_comment && (
                    <p className={styles.comment}>“{person.last_comment}”</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  );
}

function firstRow(data) {
  return Array.isArray(data) ? data[0] : data;
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState({
    collectors: 0,
    donors: 0,
    totalWeight: 0,
    totalCollections: 0,
  });

  // Gráficos gerais
  const [evolutionData, setEvolutionData] = useState([]);
  const [wasteDistribution, setWasteDistribution] = useState([]);

  // Doadores
  const [topDonors, setTopDonors] = useState([]);
  const [topDonorsDetailed, setTopDonorsDetailed] = useState(null);
  const [donorStats, setDonorStats] = useState(null);
  const [topRatedDonors, setTopRatedDonors] = useState([]);

  // Coletores
  const [collectorMaterials, setCollectorMaterials] = useState([]);
  const [collectorStats, setCollectorStats] = useState(null);
  const [topRatedCollectors, setTopRatedCollectors] = useState([]);

  // Exportação
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportDashboardReport(supabase);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      window.alert(
        "Não foi possível gerar o relatório. Veja o console para detalhes.",
      );
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: userCounts } = await supabase.rpc("get_user_counts");
        const { count: collectionsCount } = await supabase
          .from("donations")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed");

        const [evolutionRes, distributionRes, rankingRes] = await Promise.all([
          supabase.rpc("get_monthly_evolution"),
          supabase.rpc("get_waste_distribution"),
          supabase.rpc("get_top_donors"),
        ]);
        const distribution = distributionRes.data;
        const totalWeight =
          distribution?.reduce(
            (acc, curr) => acc + Number(curr.total_weight),
            0,
          ) || 0;

        setKpiData({
          collectors: userCounts?.collectors || 0,
          donors: userCounts?.donors || 0,
          totalWeight: totalWeight,
          totalCollections: collectionsCount || 0,
        });

        setEvolutionData(evolutionRes.data || []);
        setWasteDistribution(distribution || []);
        setTopDonors(rankingRes.data || []);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }

      const [
        donorStatsRes,
        ratedDonorsRes,
        detailedRes,
        collectorStatsRes,
        collectorsRes,
        ratedCollectorsRes,
      ] = await Promise.all([
        supabase.rpc("get_donor_stats"),
        supabase.rpc("get_top_rated_donors", {
          p_min_reviews: MIN_REVIEWS,
          p_limit: 5,
        }),
        supabase.rpc("get_top_donors_detailed", { p_limit: 10 }),
        supabase.rpc("get_collector_stats"),
        supabase.rpc("get_top_collectors_by_material", { p_limit: 5 }),
        supabase.rpc("get_top_rated_collectors", {
          p_min_reviews: MIN_REVIEWS,
          p_limit: 5,
        }),
      ]);

      const warn = (name, res) =>
        res.error && console.warn(`${name}:`, res.error.message);

      warn("get_donor_stats", donorStatsRes);
      if (!donorStatsRes.error) setDonorStats(firstRow(donorStatsRes.data));

      warn("get_top_rated_donors", ratedDonorsRes);
      if (!ratedDonorsRes.error) {
        setTopRatedDonors(
          (ratedDonorsRes.data || []).map((d) => ({
            ...d,
            id: d.donor_id,
            name: d.donor_name,
          })),
        );
      }

      warn("get_top_donors_detailed", detailedRes);
      if (!detailedRes.error) setTopDonorsDetailed(detailedRes.data || []);

      warn("get_collector_stats", collectorStatsRes);
      if (!collectorStatsRes.error)
        setCollectorStats(firstRow(collectorStatsRes.data));

      warn("get_top_collectors_by_material", collectorsRes);
      if (!collectorsRes.error) setCollectorMaterials(collectorsRes.data || []);

      warn("get_top_rated_collectors", ratedCollectorsRes);
      if (!ratedCollectorsRes.error) {
        setTopRatedCollectors(
          (ratedCollectorsRes.data || []).map((c) => ({
            ...c,
            id: c.collector_id,
            name: c.collector_name,
          })),
        );
      }
    }

    loadDashboard();
  }, []);

  const materialColor = useMemo(() => {
    const map = {};
    wasteDistribution.forEach((item, index) => {
      map[item.material_name] = COLORS[index % COLORS.length];
    });
    return map;
  }, [wasteDistribution]);

  const topCollectors = useMemo(() => {
    const rows = {};
    collectorMaterials.forEach((item) => {
      if (!rows[item.collector_id]) {
        rows[item.collector_id] = {
          name: item.collector_name,
          total: Number(item.collector_total) || 0,
        };
      }
    });
    return Object.values(rows)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c, i) => ({ ...c, label: `#${i + 1} ${c.name}` }));
  }, [collectorMaterials]);

  // ---- Cards ----
  const generalCards = [
    {
      title: "Coletores Ativos",
      value: kpiData.collectors,
      icon: faUser,
      color: "#4a90e2",
    },
    {
      title: "Doadores Ativos",
      value: kpiData.donors,
      icon: faHouse,
      color: "#50e3c2",
    },
    {
      title: "Resíduos (kg)",
      value: kpiData.totalWeight.toFixed(1),
      icon: faRecycle,
      color: "#f5a623",
    },
    {
      title: "Coletas Totais",
      value: kpiData.totalCollections,
      icon: faHandshake,
      color: "#b8e986",
    },
  ];

  const recurringPct =
    donorStats && Number(donorStats.total_donors_with_donation) > 0
      ? Math.round(
          (Number(donorStats.recurring_donors) /
            Number(donorStats.total_donors_with_donation)) *
            100,
        )
      : 0;

  const donorCards = donorStats
    ? [
        {
          title: "Média por doação",
          value: `${Number(donorStats.avg_kg_per_donation || 0).toFixed(1)} kg`,
          hint: `${Number(donorStats.avg_kg_per_donor || 0).toFixed(1)} kg por doador`,
          icon: faScaleBalanced,
          color: "#4a90e2",
        },
        {
          title: "Nota média dos doadores",
          value: donorStats.avg_donor_rating
            ? Number(donorStats.avg_donor_rating).toFixed(1)
            : "—",
          hint: donorStats.avg_donor_rating
            ? "de 5 estrelas"
            : "sem avaliações ainda",
          icon: faStar,
          color: "#f5b301",
        },
        {
          title: "Doadores recorrentes",
          value: `${recurringPct}%`,
          hint: `${donorStats.recurring_donors} doaram 2 vezes ou mais`,
          icon: faRotate,
          color: "#50e3c2",
        },
        {
          title: "Inativos há +60 dias",
          value: donorStats.inactive_donors,
          hint: "sem doação concluída recente",
          icon: faUserClock,
          color: "#e8604c",
        },
      ]
    : [];

  const collectorCards = collectorStats
    ? [
        {
          title: "Média por coleta",
          value: `${Number(collectorStats.avg_kg_per_collection || 0).toFixed(1)} kg`,
          hint: `${collectorStats.collections_done} coletas realizadas`,
          icon: faTruck,
          color: "#4a90e2",
        },
        {
          title: "Nota média dos coletores",
          value: collectorStats.avg_collector_rating
            ? Number(collectorStats.avg_collector_rating).toFixed(1)
            : "—",
          hint: collectorStats.avg_collector_rating
            ? "de 5 estrelas"
            : "sem avaliações ainda",
          icon: faStar,
          color: "#f5b301",
        },
        {
          title: "Taxa de cancelamento",
          value: `${Number(collectorStats.cancel_rate || 0).toFixed(1)}%`,
          hint: `${collectorStats.cancelled_collections} coletas canceladas`,
          icon: faBan,
          color: "#e8604c",
        },
        {
          title: "Inativos há +60 dias",
          value: collectorStats.inactive_collectors,
          hint: `de ${collectorStats.collectors_with_collection} com coleta realizada`,
          icon: faUserClock,
          color: "#9b59b6",
        },
      ]
    : [];

  const usingDetailed =
    Array.isArray(topDonorsDetailed) && topDonorsDetailed.length > 0;
  const rankingRows = usingDetailed ? topDonorsDetailed : topDonors;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Operacional</h1>
        <button
          type="button"
          className={styles.exportButton}
          onClick={handleExport}
          disabled={exporting}
        >
          <FontAwesomeIcon
            icon={exporting ? faSpinner : faFileArrowDown}
            spin={exporting}
          />
          {exporting ? "Gerando relatório…" : "Exportar relatório"}
        </button>
      </div>

      {/* ================= VISÃO GERAL ================= */}
      <KpiCards items={generalCards} />

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2>Evolução de Coleta (Últimos 12 meses)</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer minWidth={0}>
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month_name" style={{ fontSize: "12px" }} />
                <YAxis style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="total_weight"
                  name="Peso (kg)"
                  stroke="#4a90e2"
                  fill="#4a90e2"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Composição dos Resíduos</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer minWidth={0}>
              <PieChart>
                <Pie
                  data={wasteDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total_weight"
                  nameKey="material_name"
                >
                  {wasteDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= DOADORES ================= */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faHouse} color="#50e3c2" /> Doadores
        </h2>

        <KpiCards items={donorCards} />

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h2>
              <FontAwesomeIcon icon={faTrophy} color="#FFD700" /> Top Doadores
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.rankingTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    {usingDetailed && <th>Doações</th>}
                    {usingDetailed && <th>Material principal</th>}
                    {usingDetailed && <th>Última doação</th>}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingRows.map((donor, index) => {
                    const days = daysSince(donor.last_donation_at);
                    return (
                      <tr key={index}>
                        <td>#{index + 1}</td>
                        <td>{donor.donor_name}</td>
                        {usingDetailed && <td>{donor.donations_count}</td>}
                        {usingDetailed && (
                          <td>
                            {donor.main_material ? (
                              <span className={styles.materialTag}>
                                <span
                                  className={styles.materialDot}
                                  style={{
                                    backgroundColor:
                                      materialColor[donor.main_material] ||
                                      "#7f8c8d",
                                  }}
                                />
                                {donor.main_material}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        )}
                        {usingDetailed && (
                          <td
                            className={
                              days !== null && days > 60
                                ? styles.inactive
                                : undefined
                            }
                          >
                            {formatDate(donor.last_donation_at)}
                          </td>
                        )}
                        <td>
                          <strong>
                            {Number(donor.total_weight).toFixed(1)} kg
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <TopRatedList
            title="Doadores Mais Bem Avaliados"
            people={topRatedDonors}
            emptyText={`Nenhum doador com ${MIN_REVIEWS} ou mais avaliações ainda.`}
          />
        </div>
      </section>

      {/* ================= COLETORES ================= */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faUser} color="#4a90e2" /> Coletores
        </h2>

        <KpiCards items={collectorCards} />

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h2>
              <FontAwesomeIcon icon={faTrophy} color="#4a90e2" /> Top 5
              Coletores — Material Reciclado
            </h2>
            {topCollectors.length > 0 ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer minWidth={0}>
                  <BarChart
                    data={topCollectors}
                    layout="vertical"
                    margin={{ left: 10, right: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      unit=" kg"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={150}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "#f5f7fa" }}
                      formatter={(value) => [
                        `${Number(value).toFixed(1)} kg`,
                        "Material reciclado",
                      ]}
                    />
                    <Bar
                      dataKey="total"
                      name="Material reciclado"
                      fill="#4a90e2"
                      barSize={28}
                      radius={[0, 6, 6, 0]}
                    >
                      <LabelList
                        dataKey="total"
                        position="right"
                        formatter={(v) => `${Number(v).toFixed(1)} kg`}
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          fill: "#2c3e50",
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.empty}>Nenhuma coleta realizada ainda.</p>
            )}
          </div>

          <TopRatedList
            title="Coletores Mais Bem Avaliados"
            people={topRatedCollectors}
            emptyText={`Nenhum coletor com ${MIN_REVIEWS} ou mais avaliações ainda.`}
          />
        </div>
      </section>
    </div>
  );
}
