"use client";

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUser, faRecycle, faHandshake } from '@fortawesome/free-solid-svg-icons';
// 1. Importar o cliente supabase que criamos antes
import { supabase } from '../../../config/supabaseClient'; 

// Função auxiliar para contar registros em tabelas
async function fetchCount(table, filterColumn, filterValue) {
    // count: 'exact' retorna o número total sem baixar os dados (rápido)
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(filterColumn, filterValue);
    
    if (error) {
        console.error(`Erro ao contar ${table}:`, error);
        return 0;
    }
    return count;
}

// Função para calcular estatísticas reais baseadas nas doações
async function fetchDonationStats() {
    // Buscamos os itens das doações, trazendo o nome do material e o status da doação
    // O !inner força que a doação exista e satisfaça o filtro (status completed)
    const { data, error } = await supabase
        .from('donation_items')
        .select(`
            weight_kg,
            materials ( name ),
            donations!inner ( status )
        `)
        .eq('donations.status', 'completed'); 

    if (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return null;
    }

    // Inicializa acumuladores
    let stats = {
        total_sum: 0,
        sum_eletronicKg: 0,
        sum_glassKg: 0,
        sum_metalKg: 0,
        sum_oilKg: 0,
        sum_paperKg: 0,
        sum_plasticKg: 0,
        collections_count: 0
    };

    // Como buscamos itens individuais, precisamos contar quantas doações únicas existem
    // Usamos um Set para contar IDs únicos de doações (opcional, mas preciso para 'Coletas feitas')
    // Nota: Para contar coletas exatas, faremos uma query separada no useEffect para simplificar
    
    // Processamento dos dados no Frontend (Agregação)
    data.forEach(item => {
        const weight = Number(item.weight_kg) || 0;
        const materialName = item.materials?.name?.toLowerCase(); // Normaliza para evitar erros de case

        stats.total_sum += weight;

        // Mapeie aqui conforme os nomes exatos no seu banco (tabela materials)
        if (materialName?.includes('eletrônico')) stats.sum_eletronicKg += weight;
        else if (materialName?.includes('vidro')) stats.sum_glassKg += weight;
        else if (materialName?.includes('metal')) stats.sum_metalKg += weight;
        else if (materialName?.includes('óleo de cozinha')) stats.sum_oilKg += weight;
        else if (materialName?.includes('papel')) stats.sum_paperKg += weight;
        else if (materialName?.includes('plástico')) stats.sum_plasticKg += weight;
    });

    return stats;
}

const Dashboard = () => {
    const [NCollector, setNCollector] = useState(0);
    const [NDonor, setNDonor] = useState(0);
    
    // Estados dos resíduos
    const [QSumResidues, setQSumResidues] = useState(0);
    const [NRecyclingCollections, setNSumRecyclingCollections] = useState(0);
    const [wasteAmounts, setWasteAmounts] = useState({
        el: 0, gl: 0, mt: 0, ol: 0, pp: 0, pl: 0
    });

    useEffect(() => {
        async function loadDashboardData() {
            // 1. Buscar contagem de usuários via RPC (Função Segura)
            const { data: userCounts, error: userError } = await supabase.rpc('get_user_counts');
            
            if (userCounts) {
                setNCollector(userCounts.collectors);
                setNDonor(userCounts.donors);
            } else {
                console.error("Erro ao buscar contagem:", userError);
            }

            // 2. Contar Coletas Finalizadas (Mantém igual, pois Donations não tem RLS bloqueante ainda)
            const collections = await fetchCount('donations', 'status', 'completed');
            setNSumRecyclingCollections(collections);

            // 3. Calcular Pesos dos Materiais (Mantém igual)
            const stats = await fetchDonationStats();
            if (stats) {
                setQSumResidues(stats.total_sum);
                setWasteAmounts({
                    el: stats.sum_eletronicKg,
                    gl: stats.sum_glassKg,
                    mt: stats.sum_metalKg,
                    ol: stats.sum_oilKg,
                    pp: stats.sum_paperKg,
                    pl: stats.sum_plasticKg
                });
            }
        }

        loadDashboardData();
    }, []);

    const statsCards = [
        { title: 'Coletores', value: NCollector, icon: faUser },
        { title: 'Doadores', value: NDonor, icon: faHouse },
        { title: 'Resíduos coletados', value: `${QSumResidues.toFixed(1)}kg`, icon: faRecycle }, // Adicionei toFixed para formatação
        { title: 'Coletas feitas', value: NRecyclingCollections, icon: faHandshake },
    ];

    const wasteData = [
        { type: 'Eletrônico', amount: wasteAmounts.el, color: '#FFA500' },
        { type: 'Vidro', amount: wasteAmounts.gl, color: '#6A5ACD' },
        { type: 'Metal', amount: wasteAmounts.mt, color: '#FF6347' },
        { type: 'Óleo', amount: wasteAmounts.ol, color: '#FFA500' },
        { type: 'Papel', amount: wasteAmounts.pp, color: '#6A5ACD' },
        { type: 'Plástico', amount: wasteAmounts.pl, color: '#FF6347' },
    ];

    return (
        <div>
            <h1>ESTATÍSTICAS</h1>
            <div className={styles.dashboardContainer}>
                {statsCards.map((item, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.iconContainer}>
                            <FontAwesomeIcon icon={item.icon} className={styles.icon} />
                        </div>
                        <div className={styles.info}>
                            <h3>{item.title}</h3>
                            <p>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.wasteSection}>
                <h2>Tipos de resíduos coletados</h2>
                <div className={styles.wasteList}>
                    {wasteData.map((waste, index) => (
                        <div key={index} className={styles.wasteItem}>
                            <span className={styles.wasteType}>{waste.type}</span>
                            <div className={styles.wasteBarContainer}>
                                <div
                                    className={styles.wasteBar}
                                    style={{
                                        // Evita erro de divisão por zero e limita a 100%
                                        width: `${QSumResidues > 0 ? (waste.amount / QSumResidues) * 100 : 0}%`,
                                        backgroundColor: waste.color || 'rgb(170, 220, 160)',
                                    }}
                                ></div>
                            </div>
                            <span className={styles.wasteAmount}>{waste.amount.toFixed(1)}kg</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;