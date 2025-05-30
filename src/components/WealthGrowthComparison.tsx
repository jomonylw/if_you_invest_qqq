"use client";
import React from 'react';
import { Typography } from '@mui/material';
import CountUp from 'react-countup';
import type { InvestmentResultsChartProps } from '../types';

export default function WealthGrowthComparison({ results }: InvestmentResultsChartProps) {
  const {
    nominalPriceReturn,
    annualizedPriceReturn,
    nominalPriceReturnWithDividends,
    annualizedPriceReturnWithDividends,
    totalInvested,
    nominalTotalReturnWithoutDividends,
    annualizedTotalReturnWithoutDividends,
    investmentGrewToPrice,
    nominalTotalReturn,
    annualizedTotalReturn,
    investmentGrewToTotalReturn,
    input
  } = results;

  const formatPercentage = (value: string) => {
    return `${(parseFloat(value) * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Wealth Growth Visual Comparison Area */}
      <div className={`mb-8 bg-gradient-to-r from-blue-50 ${parseFloat(nominalTotalReturn) >= 0 ? 'to-green-50' : 'to-red-50'} p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200`}>
        <Typography variant="h6" className="text-center mb-3 font-bold text-gray-700 pb-2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>Wealth Growth Comparison</Typography>
        
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          {/* Investment Amount */}
          <div className="flex-1 text-center p-3 min-w-0">
            <Typography variant="caption" className="text-gray-500 mb-1 block" sx={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Start: {input.startDate}
            </Typography>
            <Typography variant="body1" className="text-gray-500 mb-1">Investment Amount</Typography>
            <Typography variant="h4" className="font-bold text-blue-700" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {formatCurrency(totalInvested)}
            </Typography>
          </div>
          
          {/* Arrow and Growth Rate */}
          <div className="flex flex-col items-center py-3 px-1">
            <div className="mb-2">
              {(() => {
                if (input.startDate && input.endDate) {
                  const start = new Date(input.startDate);
                  const end = new Date(input.endDate);
                  const diffTime = end.getTime() - start.getTime();
                  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
                  const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
                  return (
                    <div className={`inline-block px-3 py-1.5 rounded-full ${
                      parseFloat(nominalTotalReturn) >= 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <Typography variant="h6" 
                        className={`${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        sx={{
                        fontSize: { xs: '1.1rem', sm: '1.1rem' },
                        fontWeight: 'bold',
                      }}>
                        {`${diffYears > 0 ? diffYears + ' yr' + (diffYears > 1 ? 's' : '') : ''} ${diffMonths > 0 ? diffMonths + ' mo' + (diffMonths > 1 ? 's' : '') : ''}`.trim()}
                      </Typography>
                    </div>
                  );
                }
                return '';
              })()}
            </div>
            <Typography
              variant="h4"
              className={`transform rotate-90 md:rotate-0 ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}
            >
              {'→'}
            </Typography>
            <div className={`rounded-full px-4 py-2 mt-2 ${parseFloat(nominalTotalReturn) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Typography
                variant="h6"
                className={`font-bold ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-800' : 'text-red-800'}`}
              >
                {parseFloat(nominalTotalReturn) >= 0 ? '+' : ''}{formatPercentage(nominalTotalReturn)}
              </Typography>
            </div>
          </div>
          
          {/* Final Wealth */}
          <div className={`flex-1 text-center p-3 rounded-lg shadow-inner min-w-0 ${parseFloat(nominalTotalReturn) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <Typography variant="caption" className="text-gray-500 mb-1 block" sx={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              End: {input.endDate}
            </Typography>
            <Typography variant="body1" className="text-gray-700 mb-1">Final Wealth (With Dividends)</Typography>
            <Typography
              variant="h3"
              className={`font-bold ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-700' : 'text-red-700'}`}
              sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' } }}
            >
              <span className="inline-block">$<CountUp
                start={0}
                end={parseFloat(investmentGrewToTotalReturn)}
                duration={2.5}
                decimals={2}
                separator=","
                useEasing={true}
              /></span>
            </Typography>
            <Typography
              variant="body2"
              className={`mt-1 ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {parseFloat(investmentGrewToTotalReturn) > parseFloat(totalInvested)
                ? `Growth of ${(parseFloat(investmentGrewToTotalReturn) / parseFloat(totalInvested)).toFixed(1)}x`
                : `Loss of ${((1 - parseFloat(investmentGrewToTotalReturn) / parseFloat(totalInvested)) * 100).toFixed(1)}%`
              }
            </Typography>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mb-6"> {/* Main container with increased spacing */}
        {/* Price Returns Group */}
        <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>Price Returns</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Nominal Price Return:</Typography>
              <Typography variant="h6" className="font-bold">{formatPercentage(nominalPriceReturn)}</Typography>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Annualized Price Return:</Typography>
              <Typography variant="h6" className="font-bold">{formatPercentage(annualizedPriceReturn)}</Typography>
            </div>
            <div className="bg-green-50 p-3 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">
                Nominal Price Return <br />
                (Including Dividends)
              </Typography>
              <Typography variant="h6" className="font-bold text-green-700">{formatPercentage(nominalPriceReturnWithDividends)}</Typography>
            </div>
            <div className="bg-green-50 p-3 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">
                Annualized Price Return <br />
                (Including Dividends)
              </Typography>
              <Typography variant="h6" className="font-bold text-green-700">{formatPercentage(annualizedPriceReturnWithDividends)}</Typography>
            </div>
          </div>
        </div>

        {/* Total Invested Group - 单独一行 */}
        <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>Investment Summary</Typography>
          <div>
              <div className="w-full sm:w-1/2 bg-blue-100 p-4 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                  <Typography variant="body2" className="text-gray-600">Total Invested:</Typography>
                  <Typography variant="h6" className="font-bold text-blue-800">{formatCurrency(totalInvested)}</Typography>
              </div>
          </div>
        </div>

        {/* Total Returns Group (Without Dividends) */}
        <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>Growth (Excluding Dividends)</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Nominal Total Return:</Typography>
              <Typography variant="h6" className="font-bold">{formatPercentage(nominalTotalReturnWithoutDividends)}</Typography>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Annualized Total Return:</Typography>
              <Typography variant="h6" className="font-bold">{formatPercentage(annualizedTotalReturnWithoutDividends)}</Typography>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Investment Grew To:</Typography>
              <Typography variant="h6" className="font-bold text-green-700">{formatCurrency(investmentGrewToPrice)}</Typography>
            </div>
          </div>
        </div>

        {/* Total Returns Group (With Dividends) */}
        <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>Growth (Including Dividends)</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Nominal Total Return:</Typography>
              <Typography variant="h6" className="font-bold text-green-700">{formatPercentage(nominalTotalReturn)}</Typography>
            </div>
            <div className="bg-green-50 p-3 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Annualized Total Return:</Typography>
              <Typography variant="h6" className="font-bold text-green-700">{formatPercentage(annualizedTotalReturn)}</Typography>
            </div>
            <div className="bg-green-50 p-3 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <Typography variant="body2" className="text-gray-600">Investment Grew To:</Typography>
              <Typography variant="h6" className="font-bold text-green-800" sx={{ fontSize: '1.5rem' }}>
                <span className="inline-block">$<CountUp
                  start={0}
                  end={parseFloat(investmentGrewToTotalReturn)}
                  duration={2}
                  decimals={2}
                  separator=","
                  useEasing={true}
                /></span>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}