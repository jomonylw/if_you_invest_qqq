"use client";
import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';
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
    <Box className="fade-in">
      {/* 主要财富增长比较区域 */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: parseFloat(nominalTotalReturn) >= 0
            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(129, 199, 132, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(239, 154, 154, 0.08) 100%)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(6px)',
          overflow: 'visible'
        }}
        className="hover-lift"
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <span style={{ fontSize: 'inherit' }}>💎</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Wealth Growth Comparison
            </span>
            <span style={{ fontSize: 'inherit' }}>📈</span>
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 3, md: 4 },
            width: '100%'
          }}>
            {/* 投资金额 */}
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: { xs: 2, md: 3 },
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 3,
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              minWidth: 0
            }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  color: 'text.secondary',
                  mb: 1,
                  display: 'block'
                }}
              >
                📅 Start: {input.startDate}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'medium' }}>
                💰 Investment Amount
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
                }}
              >
                {formatCurrency(totalInvested)}
              </Typography>
            </Box>
          
            {/* 箭头和增长率 */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: { xs: 2, md: 3 },
              px: 1,
              gap: 2
            }}>
              {/* 时间段显示 */}
              <Box>
                {(() => {
                  if (input.startDate && input.endDate) {
                    const start = new Date(input.startDate);
                    const end = new Date(input.endDate);
                    const diffTime = end.getTime() - start.getTime();
                    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
                    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
                    return (
                      <Box sx={{
                        display: 'inline-block',
                        px: 3,
                        py: 1.5,
                        borderRadius: '50px',
                        background: parseFloat(nominalTotalReturn) >= 0
                          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.2) 100%)'
                          : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(239, 154, 154, 0.2) 100%)',
                        border: parseFloat(nominalTotalReturn) >= 0
                          ? '1px solid rgba(76, 175, 80, 0.3)'
                          : '1px solid rgba(244, 67, 54, 0.3)',
                        backdropFilter: 'blur(6px)'
                      }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            fontWeight: 'bold',
                            color: parseFloat(nominalTotalReturn) >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          ⏱️ {`${diffYears > 0 ? diffYears + ' yr' + (diffYears > 1 ? 's' : '') : ''} ${diffMonths > 0 ? diffMonths + ' mo' + (diffMonths > 1 ? 's' : '') : ''}`.trim()}
                        </Typography>
                      </Box>
                    );
                  }
                  return '';
                })()}
              </Box>

              {/* 箭头 */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' },
                  fontWeight: 900,
                  fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
                  color: parseFloat(nominalTotalReturn) >= 0 ? 'success.main' : 'error.main',
                  lineHeight: 1,
                  userSelect: 'none',
                  textShadow: parseFloat(nominalTotalReturn) >= 0
                    ? '0 2px 4px rgba(76, 175, 80, 0.3)'
                    : '0 2px 4px rgba(244, 67, 54, 0.3)',
                  transform: { xs: 'rotate(90deg)', lg: 'rotate(0deg)' },
                  transition: 'all 0.3s ease',
                  WebkitTextStroke: '2px currentColor',
                  filter: parseFloat(nominalTotalReturn) >= 0
                    ? 'drop-shadow(0 0 6px rgba(76, 175, 80, 0.2))'
                    : 'drop-shadow(0 0 6px rgba(244, 67, 54, 0.2))',
                  '&:hover': {
                    transform: {
                      xs: 'rotate(90deg) scale(1.1)',
                      lg: 'rotate(0deg) scale(1.1)'
                    },
                    filter: parseFloat(nominalTotalReturn) >= 0
                      ? 'drop-shadow(0 0 12px rgba(76, 175, 80, 0.3))'
                      : 'drop-shadow(0 0 12px rgba(244, 67, 54, 0.3))',
                    textShadow: parseFloat(nominalTotalReturn) >= 0
                      ? '0 3px 6px rgba(76, 175, 80, 0.4)'
                      : '0 3px 6px rgba(244, 67, 54, 0.4)',
                  }
                }}
              >
                ➔
              </Typography>

              {/* 增长率 */}
              <Box sx={{
                borderRadius: '50px',
                px: 4,
                py: 2,
                background: parseFloat(nominalTotalReturn) >= 0
                  ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(129, 199, 132, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(239, 154, 154, 0.3) 100%)',
                border: parseFloat(nominalTotalReturn) >= 0
                  ? '1px solid rgba(76, 175, 80, 0.4)'
                  : '1px solid rgba(244, 67, 54, 0.4)',
                backdropFilter: 'blur(6px)'
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: parseFloat(nominalTotalReturn) >= 0 ? 'success.dark' : 'error.dark',
                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {parseFloat(nominalTotalReturn) >= 0 ? '📈 +' : '📉 '}{formatPercentage(nominalTotalReturn)}
                </Typography>
              </Box>
            </Box>
          
            {/* 最终财富 */}
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: { xs: 2, md: 3 },
              background: parseFloat(nominalTotalReturn) >= 0
                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(239, 154, 154, 0.2) 100%)',
              borderRadius: 3,
              backdropFilter: 'blur(6px)',
              border: parseFloat(nominalTotalReturn) >= 0
                ? '1px solid rgba(76, 175, 80, 0.3)'
                : '1px solid rgba(244, 67, 54, 0.3)',
              minWidth: 0,
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  color: 'text.secondary',
                  mb: 1,
                  display: 'block'
                }}
              >
                🏁 End: {input.endDate}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'medium' }}>
                💎 Final Wealth (With Dividends)
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  color: parseFloat(nominalTotalReturn) >= 0 ? 'success.dark' : 'error.dark',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  mb: 1
                }}
              >
                <span>$<CountUp
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
                sx={{
                  mt: 1,
                  color: parseFloat(nominalTotalReturn) >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'medium',
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                {parseFloat(investmentGrewToTotalReturn) > parseFloat(totalInvested)
                  ? `🎯 Growth of ${(parseFloat(investmentGrewToTotalReturn) / parseFloat(totalInvested)).toFixed(1)}x`
                  : `📉 Loss of ${((1 - parseFloat(investmentGrewToTotalReturn) / parseFloat(totalInvested)) * 100).toFixed(1)}%`
                }
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* 详细统计数据 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4 }}>
        {/* 价格回报组 */}
        <Card
          elevation={0}
          className="hover-lift"
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              📈 Price Returns
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2, md: 3 }
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(189, 189, 189, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(158, 158, 158, 0.2)',
                backdropFilter: 'blur(3px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Nominal Price Return:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {formatPercentage(nominalPriceReturn)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(189, 189, 189, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(158, 158, 158, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Annualized Price Return:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {formatPercentage(annualizedPriceReturn)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Nominal Price Return<br />
                  (Including Dividends)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                  {formatPercentage(nominalPriceReturnWithDividends)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Annualized Price Return<br />
                  (Including Dividends)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                  {formatPercentage(annualizedPriceReturnWithDividends)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 投资总额组 */}
        <Card
          elevation={0}
          className="hover-lift"
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              💼 Investment Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(100, 181, 246, 0.1) 100%)',
                p: 4,
                borderRadius: 3,
                border: '1px solid rgba(33, 150, 243, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                width: { xs: '100%', sm: '50%' },
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(33, 150, 243, 0.2)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  💰 Total Invested:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                  {formatCurrency(totalInvested)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 总回报组（不含股息） */}
        <Card
          elevation={0}
          className="hover-lift"
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              📊 Growth (Excluding Dividends)
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 3 }
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(189, 189, 189, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(158, 158, 158, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Nominal Total Return:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {formatPercentage(nominalTotalReturnWithoutDividends)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(189, 189, 189, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(158, 158, 158, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Annualized Total Return:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {formatPercentage(annualizedTotalReturnWithoutDividends)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' },
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  💰 Investment Grew To:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                  {formatCurrency(investmentGrewToPrice)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 总回报组（含股息） */}
        <Card
          elevation={0}
          className="hover-lift"
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              🎉 Growth (Including Dividends)
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 3 }
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Nominal Total Return:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                  {formatPercentage(nominalTotalReturn)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Annualized Total Return:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                  {formatPercentage(annualizedTotalReturn)}
                </Typography>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.15) 100%)',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(76, 175, 80, 0.3)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' },
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)' }
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  🎯 Investment Grew To:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                  }}
                >
                  <span>$<CountUp
                    start={0}
                    end={parseFloat(investmentGrewToTotalReturn)}
                    duration={2}
                    decimals={2}
                    separator=","
                    useEasing={true}
                  /></span>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}