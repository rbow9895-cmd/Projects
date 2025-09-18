import React from 'react';
import Chart from 'chart.js/auto';
import { useState, useEffect, useRef } from "react";
import styles from './CoinDetailChart.module.css';
import dynamic from 'next/dynamic';

// Dynamically import animations to prevent hydration issues
const FadeInAnimation = dynamic(() => import('../animations/FadeInAnimation'), {
  ssr: false,
  loading: () => <div />
});

const PriceChangeAnimation = dynamic(() => import('../animations/PriceChangeAnimation'), {
  ssr: false,
  loading: () => <div />
});

const PulseGlowAnimation = dynamic(() => import('../animations/PulseGlowAnimation'), {
  ssr: false,
  loading: () => <div />
});


interface CoinDetailDataType {
    image: {
        large: string;
    },

    description: {
        en: string
    },

    market_data: {
        current_price: {
            usd: number
        },
        price_change_24h: number,
        market_cap: {
            usd: number
        },
        fully_diluted_valuation: {
            usd: number
        },
        total_volume: {
            usd: number
        },
        ath: {
            usd: number
        },

        atl: {
            usd: number,
        },
        circulating_supply: number
    },

    id: string,
    market_cap_rank: number,
    categories: string[],
    symbol: string,
    links: {
        homepage: string[],
        repos_url: {
            github: string[]
        },
        subreddit_url: string,
    }

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
    const chartInstanceRef = useRef<Chart | null>(null);
    const [timeFrame, setTimeFrame] = useState<keyof typeof timeFrames>('7D');
    const [chartData, setChartData] = useState<any[]>([]);
    const [previousPrice, setPreviousPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isClient, setIsClient] = useState<boolean>(false);

    const fetchDataHandler = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${cryptoName}/market_chart?vs_currency=usd&days=${timeFrames[timeFrame]}`
            );
            if (!response.ok) {
                throw new Error(`Error fetching chart data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const prices = data.prices;
            const volumes = data.total_volumes;
            
            // Store previous price for animation
            if (prices.length > 0) {
                setPreviousPrice(prices[prices.length - 1][1]);
            }
            
            setChartData(prices);

            const chartLabels = prices.map((price: [number, number]) => {
                const date = new Date(price[0]);
                return timeFrame === '1D' ? date.toLocaleTimeString() : date.toLocaleDateString();
            });
            
            const priceData = prices.map((price: [number, number]) => price[1]);
            const volumeData = volumes.map((vol: [number, number]) => vol[1]);
            const ctx = chartRef.current?.getContext('2d');
            
            if (!ctx) return;

            // Create dynamic gradient based on price trend
            const isPositive = priceData[priceData.length - 1] > priceData[0];
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, isPositive ? 'rgba(16, 185, 129, 0)' : 'rgba(239, 68, 68, 0)');

            // Destroy existing chart if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Price',
                            data: priceData,
                            borderColor: isPositive ? '#10b981' : '#ef4444',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: isPositive ? '#10b981' : '#ef4444',
                            pointHoverBorderColor: '#ffffff',
                            pointHoverBorderWidth: 2,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Volume',
                            data: volumeData,
                            type: 'bar',
                            backgroundColor: 'rgba(128, 128, 128, 0.2)',
                            borderColor: 'rgba(128, 128, 128, 0.4)',
                            yAxisID: 'volume',
                            maxBarThickness: 4
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
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: isPositive ? '#10b981' : '#ef4444',
                            borderWidth: 1,
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
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: false,
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
                                color: '#ffffff',
                                callback: (value: any) => `$${value.toLocaleString()}`
                            }
                        },
                        volume: {
                            position: 'left',
                            display: false,
                            grid: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            
            chartInstanceRef.current = chartInstance;
            setIsLoading(false);

        } catch (error) {
            throw new Error('Error fetching gaming coins: ' + error);
        }


    };


    useEffect(() => {
        setIsClient(true);
        fetchDataHandler();
        
        // Cleanup function to destroy chart on unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [timeFrame, cryptoName])

    // Show loading state during hydration
    if (!isClient) {
        return (
            <div className='flex justify-evenly flex-wrap items-center'>
                <div className='w-full cooinDetailChartHold'>
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FadeInAnimation delay={0.2} className='flex justify-evenly flex-wrap items-center'>
            <div className='w-full cooinDetailChartHold'>
                {/* Time Frame Selector */}
                <div className="flex gap-2 mb-4 justify-end pr-4 pt-4">
                    {Object.keys(timeFrames).map((period) => (
                        <button
                            key={period}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                                timeFrame === period 
                                    ? 'bg-blue-500 text-white shadow-lg' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setTimeFrame(period as keyof typeof timeFrames)}
                        >
                            {period}
                        </button>
                    ))}
                </div>

                {/* Chart Container */}
                <div className="relative h-96">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                    <canvas ref={chartRef}></canvas>
                </div>

                {/* Price Display with Animation */}
                <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src={specificCoinDetails.image.large} 
                                alt={`${cryptoName} logo`} 
                                className='w-8 h-8 rounded-full'
                            />
                            <span className="font-bold text-lg text-gray-800">
                                {specificCoinDetails.symbol?.toUpperCase()}
                            </span>
                        </div>
                        <PriceChangeAnimation
                            price={specificCoinDetails.market_data.current_price.usd}
                            previousPrice={previousPrice}
                            className="text-2xl font-bold"
                        />
                    </div>
                </div>
            </div>

            <FadeInAnimation delay={0.4} className="statsCardHold boxsh2 rounded">
                <div className="flex flex-col gap-2 items-center pt-8 pb-8 justify-center">
                    <div className='flex items-center gap-2 mb-5'>
                        <PulseGlowAnimation color="#4F46E5" intensity={0.2}>
                            <img src={specificCoinDetails.image.large} alt="logo" className='w-10 bg-white rounded-full boxsh2' />
                        </PulseGlowAnimation>
                        <div className="flex-col items-center flex gap-2">
                            <p className="font-semibold text-gray-700">Price Statistics</p>
                        </div>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    <div className='flex justify-between w80Perc gap-2'>
                        <p className='text-gray-400'>Price</p>
                        <p className='font-semibold'> ${specificCoinDetails.market_data.current_price.usd.toLocaleString()} </p>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    <div className='flex justify-between w80Perc gap-2'>
                        <p className='text-gray-400'>24h Change</p>
                        <p className={`${specificCoinDetails.market_data.price_change_24h > 0 ? "text-green-500 text-lg font-semibold" : "text-red-500 text-lg font-semibold"}`}> 
                            {specificCoinDetails.market_data.price_change_24h > 0 ? '+' : ''}{specificCoinDetails.market_data.price_change_24h.toFixed(2)}% 
                        </p>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    <div className='flex justify-between w80Perc gap-2'>
                        <p className='text-gray-400'>All Time High</p>
                        <p className='font-semibold'> ${specificCoinDetails.market_data.ath.usd.toLocaleString()} </p>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    <div className='flex justify-between w80Perc gap-2'>
                        <p className='text-gray-400'>All Time Low</p>
                        <p className='font-semibold'> ${specificCoinDetails.market_data.atl.usd.toLocaleString()} </p>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    <div className='flex justify-between w80Perc gap-2'>
                        <p className='text-gray-400'>Volume</p>
                        <p className='font-semibold'> ${specificCoinDetails.market_data.total_volume.usd.toLocaleString()} </p>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    <div className='flex justify-between w80Perc gap-2'>
                        <p className='text-gray-400'>Rank</p>
                        <p className='font-semibold'> #{specificCoinDetails.market_cap_rank} </p>
                    </div>

                    <div className='bg-gray-100 height1 w99 mx-auto'></div>

                    {specificCoinDetails.description?.en && specificCoinDetails.description.en.length > 20 &&
                        <div className='flex justify-between w80Perc mt-5 gap-2'>
                            <p className='font-semibold text-sm text-gray-600'> 
                                {specificCoinDetails.description.en.substring(0, 250)} 
                                {specificCoinDetails.links?.homepage?.[0] && (
                                    <a 
                                        target="_blank" 
                                        href={specificCoinDetails.links.homepage[0]} 
                                        className='text-yellow-500 hover:underline ml-1'
                                    >
                                        Read More
                                    </a>
                                )}
                            </p>
                        </div>
                    }
                </div>
            </FadeInAnimation>
        </FadeInAnimation>
    )
}

export default CoinDetailChart