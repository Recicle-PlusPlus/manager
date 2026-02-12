"use client";

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUser, faRecycle, faHandshake, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from '../../../config/supabaseClient'; 

// Cores para o gráfico de pizza (Materiais)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

export default function Dashboard() {
    // Estados para KPIs
    const [kpiData, setKpiData] = useState({
        collectors: 0,
        donors: 0,
        totalWeight: 0,
        totalCollections: 0
    });

    // Estados para Gráficos
    const [evolutionData, setEvolutionData] = useState([]);
    const [wasteDistribution, setWasteDistribution] = useState([]);
    const [topDonors, setTopDonors] = useState([]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                // 1. Carregar KPIs (Contagens simples)
                const { data: userCounts } = await supabase.rpc('get_user_counts');
                const { count: collectionsCount } = await supabase
                    .from('donations')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'completed');

                // 2. Carregar Dados dos Gráficos (RPCs novas)
                const { data: evolution } = await supabase.rpc('get_monthly_evolution');
                const { data: distribution } = await supabase.rpc('get_waste_distribution');
                const { data: ranking } = await supabase.rpc('get_top_donors');

                // Calcular total geral baseado na distribuição
                const totalWeight = distribution?.reduce((acc, curr) => acc + Number(curr.total_weight), 0) || 0;

                // Atualizar estados
                setKpiData({
                    collectors: userCounts?.collectors || 0,
                    donors: userCounts?.donors || 0,
                    totalWeight: totalWeight,
                    totalCollections: collectionsCount || 0
                });

                setEvolutionData(evolution || []);
                setWasteDistribution(distribution || []);
                setTopDonors(ranking || []);

            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            }
        }

        loadDashboard();
    }, []);

    // Cards Superiores
    const statsCards = [
        { title: 'Coletores Ativos', value: kpiData.collectors, icon: faUser, color: '#4a90e2' },
        { title: 'Doadores Ativos', value: kpiData.donors, icon: faHouse, color: '#50e3c2' },
        { title: 'Resíduos (kg)', value: kpiData.totalWeight.toFixed(1), icon: faRecycle, color: '#f5a623' },
        { title: 'Coletas Totais', value: kpiData.totalCollections, icon: faHandshake, color: '#b8e986' },
    ];

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Dashboard Operacional</h1>
            
            {/* Seção 1: KPIs */}
            <div className={styles.kpiGrid}>
                {statsCards.map((item, index) => (
                    <div key={index} className={styles.card} style={{ borderTop: `4px solid ${item.color}` }}>
                        <div className={styles.iconContainer} style={{ backgroundColor: `${item.color}20` }}>
                            <FontAwesomeIcon icon={item.icon} color={item.color} />
                        </div>
                        <div className={styles.info}>
                            <h3>{item.title}</h3>
                            <p>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chartsGrid}>
                {/* Seção 2: Evolução Mensal */}
                <div className={styles.chartCard}>
                    <h2>Evolução de Coleta (Últimos 12 meses)</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={evolutionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month_name" style={{ fontSize: '12px' }} />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="total_weight" name="Peso (kg)" stroke="#4a90e2" fill="#4a90e2" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Seção 3: Distribuição por Tipo */}
                <div className={styles.chartCard}>
                    <h2>Composição dos Resíduos</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Seção 4: Ranking de Doadores */}
            <div className={styles.rankingSection}>
                <h2><FontAwesomeIcon icon={faTrophy} color="#FFD700" /> Top Doadores</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.rankingTable}>
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Nome</th>
                                <th>Total Doado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDonors.map((donor, index) => (
                                <tr key={index}>
                                    <td>#{index + 1}</td>
                                    <td>{donor.donor_name}</td>
                                    <td><strong>{Number(donor.total_weight).toFixed(1)} kg</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}