import React from 'react';
import Chart from 'chart.js/auto';
import { useState, useEffect, useRef } from "react";
import styles from './CoinDetailChart.module.css';

interface CoinDetailDataType {
    image: {
        large: string;
    };
    market_data: {
        current_price: {
            usd: number;
        };
        price_change_24h: number;
        total_volume: {
            usd: number;
        };
    };
    name: string;
    symbol: string;
}

interface ChartProps {
    cryptoName: string;
    specificCoinDetails: CoinDetailDataType;
}

const timeFrames = {
    '1D': 1,
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365
};

const CoinDetailChart: React.FC<ChartProps> = ({ cryptoName, specificCoinDetails }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const [timeFrame, setTimeFrame] = useState<keyof typeof timeFrames>('7D');
    const [chartInstance, setChartInstance] = useState<Chart | null>(null);

    useEffect(() => {
        fetchDataHandler();
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [timeFrame, cryptoName]);

    const fetchDataHandler = async () => {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${cryptoName}/market_chart?vs_currency=usd&days=${timeFrames[timeFrame]}`
            );
            if (!response.ok) {
                throw new Error(`Error fetching chart data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const prices = data.prices;
            const volumes = data.total_volumes;

            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = chartRef.current?.getContext('2d');
            if (!ctx) return;

            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
            gradient.addColorStop(1, 'rgba(75, 192, 192, 0)');

            const chartLabels = prices.map((price: [number, number]) => {
                const date = new Date(price[0]);
                return timeFrame === '1D' ? date.toLocaleTimeString() : date.toLocaleDateString();
            });
            
            const priceData = prices.map((price: [number, number]) => price[1]);
            const volumeData = volumes.map((vol: [number, number]) => vol[1]);

            const newChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Price',
                            data: priceData,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Volume',
                            data: volumeData,
                            type: 'bar',
                            backgroundColor: 'rgba(128, 128, 128, 0.2)',
                            borderColor: 'rgba(128, 128, 128, 0.4)',
                            yAxisID: 'volume'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context: any) {
                                    if (context.dataset.label === 'Volume') {
                                        return `Volume: $${context.raw.toLocaleString()}`;
                                    }
                                    return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                                }
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            position: 'right',
                            grid: {
                                color: 'rgba(200, 200, 200, 0.1)'
                            },
                            ticks: {
                                callback: (value: any) => `$${value.toLocaleString()}`
                            }
                        },
                        volume: {
                            position: 'left',
                            grid: {
                                display: false
                            },
                            ticks: {
                                callback: (value: any) => `$${(value / 1000000).toFixed(0)}M`
                            }
                        }
                    }
                }
            });

            setChartInstance(newChartInstance);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    return (
        <div className={styles.chartContainer}>
            <div className={styles.timeSelector}>
                {Object.keys(timeFrames).map((period) => (
                    <button
                        key={period}
                        className={`${styles.timeButton} ${timeFrame === period ? styles.active : ''}`}
                        onClick={() => setTimeFrame(period as keyof typeof timeFrames)}
                    >
                        {period}
                    </button>
                ))}
            </div>
            <div className="chart-wrapper" style={{ height: '100%', width: '100%' }}>
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img 
                            src={specificCoinDetails.image.large} 
                            alt={`${cryptoName} logo`} 
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="font-bold text-lg">
                            ${specificCoinDetails.market_data.current_price.usd.toLocaleString()}
                        </span>
                    </div>
                    <span className={`font-semibold ${
                        specificCoinDetails.market_data.price_change_24h > 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                    }`}>
                        {specificCoinDetails.market_data.price_change_24h > 0 ? '+' : ''}
                        {specificCoinDetails.market_data.price_change_24h.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CoinDetailChart;