import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import styles from "../../styles/TrendingCoins.module.css"
import "react-alice-carousel/lib/alice-carousel.css";
import AliceCarousel from 'react-alice-carousel';
import { BsArrowUpRight } from "react-icons/bs"
import { FiTrendingDown } from "react-icons/fi"
import { FiTrendingUp } from "react-icons/fi"
import Link from 'next/link';

type topCoinObj = {
  coinName: string,
  image: string,
  percentChange: number,
  current_price: number,
  id: number,
  symbol: string,
  price_change_percentage_24h: number,
  high_24h: number,
  low_24h: number

}

const TrendingCoins = () => {
  const [topCoins, setTopCoins] = useState<topCoinObj[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const fecthCoinData = async () => {

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    )
    setTopCoins(response.data)

  }


  useEffect(() => {
    fecthCoinData();
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);


  const responsive = {
    0: {
      items: 1,
      stagePadding: {
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    768: {
      items: 2,
      stagePadding: {
        paddingLeft: 10,
        paddingRight: 10,
      },
    },

    1150: {
      items: 4,
      stagePadding: {
        paddingLeft: 40,
        paddingRight: 40,
      },
    },
  };



  return (
    <div className={`relative top-6 sm:mr-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative overflow-hidden">
        <p className={`justify-center text-center text-4xl text-white font-medium mb-8 relative -top-2 interFont transition-all duration-1200 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
            Top crypto coins updates
          </span>
        </p>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className={styles.trendingHold}>

        {topCoins.length > 0 ?
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <AliceCarousel 
              autoPlay={true} 
              autoPlayInterval={3000} 
              animationDuration={1200} 
              mouseTracking 
              infinite={true} 
              disableButtonsControls={true} 
              disableDotsControls={true} 
              responsive={responsive}
            >
              {topCoins.map((item, index) => {
                return (
                  <div 
                    key={item.id + index} 
                    className="crypto-card boxshDark w-80 h-44 rounded-2xl flex flex-col relative overflow-hidden group"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: isVisible ? 'cardBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards' : 'none'
                    }}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-float-1"></div>
                    <div className="absolute top-4 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-float-2"></div>
                    <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-float-3"></div>

                    <div className="trendingUpperHold justify-between items-center flex gap-4 pl-4 mt-4 relative z-10">
                      <Link href={`/${item.id}`}>
                        <div className='trendingUpper-1 flex items-center gap-2 group/link'>
                          <div className="relative">
                            <img 
                              src={item.image} 
                              className="w-10 h-10 rounded-full transition-all duration-300 group-hover/link:scale-110 group-hover/link:rotate-12" 
                              alt={item.symbol}
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/link:opacity-20 transition-opacity duration-300"></div>
                          </div>
                          <p className='font-semibold uppercase text-white transition-colors duration-300 group-hover/link:text-blue-300'> 
                            {item.symbol.substring(0, 8)} 
                          </p>
                          <p className='bg-gray-100 whitespace-nowrap capitalize rounded font-normal w-auto pr-2 pl-2 h-7 transition-all duration-300 group-hover/link:bg-blue-100 group-hover/link:scale-105'> 
                            {item.id.toString().substring(0, 11)} 
                          </p>
                        </div>
                      </Link>

                      <BsArrowUpRight className='font-semibold text-gray-400 text-xl mr-5 transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110 group-hover:rotate-12' />
                    </div>

                    <br />
                    <hr className='pr-4 pl-4 mb-3 border-gray-600 group-hover:border-blue-400 transition-colors duration-300' />

                    <div className="flex text-sm items-center justify-between pl-3 pr-8 mb-3 relative z-10">
                      <div className="flex flex-col">
                        <p className='text-center'>
                          <span className='text-white font-semibold'>Price:</span> 
                          <span className='text-white ml-1 font-bold text-lg transition-all duration-300 group-hover:text-blue-300'>${item.current_price.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className={`transition-all duration-300 group-hover:scale-105 ${item.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400"}`}>
                          <span className='text-white font-semibold'>Change:</span> 
                          <span className="ml-1 font-bold">{item.price_change_percentage_24h.toFixed(2)}%</span>
                        </p>
                        <div className={`w-0 h-0.5 transition-all duration-500 group-hover:w-full ${item.price_change_percentage_24h > 0 ? "bg-green-400" : "bg-red-400"}`}></div>
                      </div>
                    </div>

                    <div className='flex items-center text-sm justify-between gap-4 pr-0 pl-0 relative z-10'>
                      <div className='flex text-sm items-center gap-1 pl-3 pr-2 group/high'>
                        <p className='font-semibold whitespace-nowrap text-xs text-white'>24H High:</p>
                        <p className='whitespace-nowrap text-green-400 text-sm flex items-center gap-1 transition-all duration-300 group-hover/high:scale-105'> 
                          {item.high_24h.toLocaleString()} 
                          <FiTrendingUp className='text-green-400 font-semibold text-lg animate-bounce' /> 
                        </p>
                      </div>

                      <div className='flex text-sm items-center gap-1 pl-3 pr-2 group/low'>
                        <p className='font-semibold whitespace-nowrap text-xs text-white'>24H Low:</p>
                        <p className='whitespace-nowrap text-red-400 text-sm flex items-center gap-1 transition-all duration-300 group-hover/low:scale-105'>
                          {item.low_24h.toLocaleString()} 
                          <FiTrendingDown className='text-red-400 font-semibold text-lg animate-bounce' /> 
                        </p>
                      </div>
                    </div>

                </div>
              )
              })}
            </AliceCarousel>
          </div>
          :
          <div className="flex justify-center items-center h-44">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="ml-4 text-white animate-pulse">Loading crypto magic...</p>
          </div>
        }
      </div>

      <br />
      <br />
      <br />
      <br />





    </div>
  );
};

export default TrendingCoins;

