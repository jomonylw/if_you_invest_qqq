"use client";
import React, { useState, useCallback } from "react"; // Added useCallback
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, Box, Divider } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import type { InvestmentFormProps, CalApiParams } from '../types';
import InvestmentResultsChart from './InvestmentResultsChart';
import PriceChart from './PriceChart'; // Added PriceChart import
import LoadingSpinner from './LoadingSpinner'; // Added LoadingSpinner import

export default function InvestmentForm({
  initialFormParams,
  onFormSubmit,
  apiResult,
  apiLoading,
  apiError,
  onDateChangeInForm,
}: InvestmentFormProps) {
  const [formParams, setFormParams] = useState<CalApiParams>(initialFormParams);
  const [annualReturns, setAnnualReturns] = useState<{all: string, tenYears: string, fiveYears: string} | null>(null);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorAnnual, setErrorAnnual] = useState<string | null>(null);

  // 获取预测年化收益率数据
  React.useEffect(() => {
    const fetchAnnualReturns = async () => {
      setLoadingAnnual(true);
      setErrorAnnual(null);
      try {
        const response = await fetch('/api/annual');
        const data = await response.json();
        if (data.success) {
          setAnnualReturns(data.data);
          // 设置默认值为 'all'
          setFormParams(prev => ({ ...prev, predicted_annualized_return: data.data.all }));
        } else {
          setErrorAnnual('Failed to fetch annualized return data');
        }
      } catch {
        setErrorAnnual('Error fetching annualized return data');
      } finally {
        setLoadingAnnual(false);
      }
    };
    fetchAnnualReturns();
  }, []);

  // Callback for when dates are changed directly in the PriceChart
  const handleChartDatesChangeInForm = useCallback((newStartDate: string, newEndDate: string) => {
    setFormParams(prev => ({
      ...prev,
      start_date: newStartDate,
      end_date: newEndDate,
    }));
    // Notify the parent component (page.tsx) about these changes as well
    // This ensures that if page.tsx relies on these dates for other purposes, it stays in sync.
    onDateChangeInForm('start_date', newStartDate);
    onDateChangeInForm('end_date', newEndDate);
  }, [onDateChangeInForm, setFormParams]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormParams(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: 'start_date' | 'end_date', newValue: Date | null) => {
    if (newValue) {
      const formattedDate = format(newValue, 'yyyy-MM-dd');
      setFormParams(prev => ({ ...prev, [name]: formattedDate }));
      onDateChangeInForm(name, formattedDate);
    } else {
      // Handle case where date is cleared
      const newDateValue = ''; // Or some default
      setFormParams(prev => ({ ...prev, [name]: newDateValue }));
      onDateChangeInForm(name, newDateValue);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedParams = {
      ...formParams,
      predicted_annualized_return: formParams.predicted_annualized_return || '0',
      monthly_investment_amount: formParams.monthly_investment_amount || '0'
    };
    await onFormSubmit(updatedParams);
  };

  return (
    <Card
      className="mb-8 mt-8 glass-effect"
      elevation={0}
      sx={{
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        overflow: 'visible',
        '@media (max-width: 768px)': {
          margin: '1rem 0',
          borderRadius: 3,
        }
      }}
    >
      <CardContent sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        '&:last-child': { paddingBottom: { xs: 2, sm: 3, md: 4 } }
      }}>

        <PriceChart
          calFormStartDate={formParams.start_date}
          calFormEndDate={formParams.end_date}
          onDatesChange={handleChartDatesChangeInForm}
        />

        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            my: { xs: 2, md: 4 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <span style={{ fontSize: 'inherit' }}>🎯</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Calculate Investment Growth
          </span>
        </Typography>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* 日期范围选择区域 */}
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{
              mb: 3,
              fontWeight: 600,
              color: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}>
              📅 Investment Date Range
            </Typography>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <DatePicker
              label="Start Date"
              value={formParams.start_date ? parseISO(formParams.start_date) : null}
              onChange={(newValue) => handleDateChange('start_date', newValue)}
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  name: "start_date",
                  inputProps: { readOnly: true },
                  sx: { bgcolor: 'background.paper' }
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={formParams.end_date ? parseISO(formParams.end_date) : null}
              onChange={(newValue) => handleDateChange('end_date', newValue)}
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  name: "end_date",
                  inputProps: { readOnly: true },
                  sx: { bgcolor: 'background.paper' }
                }
              }}
            />
            </div>
          </Box>
          {/* 投资金额输入区域 */}
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{
              mb: 3,
              fontWeight: 600,
              color: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}>
              💰 Investment Amounts
            </Typography>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TextField
                label="💵 Initial Investment"
                name="initial_investment"
                type="number"
                value={formParams.initial_investment}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 'bold' }}>$</Typography>,
                  }
                }}
              />
              <TextField
                label="📈 Monthly Investment"
                name="monthly_investment_amount"
                type="number"
                value={formParams.monthly_investment_amount}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 'bold' }}>$</Typography>,
                  }
                }}
              />
            </div>
          </Box>
          {/* 预测年化收益率区域 */}
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{
              mb: 3,
              fontWeight: 600,
              color: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}>
              🎯 Predicted Annualized Return
            </Typography>
            {annualReturns ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant={formParams.predicted_annualized_return === annualReturns.all ? "contained" : "outlined"}
                    onClick={() => setFormParams(prev => ({ ...prev, predicted_annualized_return: annualReturns.all }))}
                    sx={{ width: '100%', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                  >
                    All Period: <span style={{ backgroundColor: formParams.predicted_annualized_return === annualReturns.all ? '#004d40' : '#4fc3f7', color: formParams.predicted_annualized_return === annualReturns.all ? '#ffffff' : '#004c8c', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>{annualReturns.all}%</span>
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant={formParams.predicted_annualized_return === annualReturns.tenYears ? "contained" : "outlined"}
                    onClick={() => setFormParams(prev => ({ ...prev, predicted_annualized_return: annualReturns.tenYears }))}
                    sx={{ width: '100%', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                  >
                    Recent 10 Years: <span style={{ backgroundColor: formParams.predicted_annualized_return === annualReturns.tenYears ? '#004d40' : '#4fc3f7', color: formParams.predicted_annualized_return === annualReturns.tenYears ? '#ffffff' : '#004c8c', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>{annualReturns.tenYears}%</span>
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant={formParams.predicted_annualized_return === annualReturns.fiveYears ? "contained" : "outlined"}
                    onClick={() => setFormParams(prev => ({ ...prev, predicted_annualized_return: annualReturns.fiveYears }))}
                    sx={{ width: '100%', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                  >
                    Recent 5 Years: <span style={{ backgroundColor: formParams.predicted_annualized_return === annualReturns.fiveYears ? '#004d40' : '#4fc3f7', color: formParams.predicted_annualized_return === annualReturns.fiveYears ? '#ffffff' : '#004c8c', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>{annualReturns.fiveYears}%</span>
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant={formParams.predicted_annualized_return === '' ||
                              (formParams.predicted_annualized_return &&
                               formParams.predicted_annualized_return !== annualReturns.all &&
                               formParams.predicted_annualized_return !== annualReturns.tenYears &&
                               formParams.predicted_annualized_return !== annualReturns.fiveYears) ? "contained" : "outlined"}
                    onClick={() => setFormParams(prev => ({ ...prev, predicted_annualized_return: '' }))}
                    sx={{ width: '100%', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                  >
                    Custom
                  </Button>
                </Box>
              </Box>
            ) : loadingAnnual ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '56px' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
              </>
            )}
            {annualReturns && (
              formParams.predicted_annualized_return === '' ||
              (formParams.predicted_annualized_return !== (annualReturns as {all: string, tenYears: string, fiveYears: string}).all &&
               formParams.predicted_annualized_return !== (annualReturns as {all: string, tenYears: string, fiveYears: string}).tenYears &&
               formParams.predicted_annualized_return !== (annualReturns as {all: string, tenYears: string, fiveYears: string}).fiveYears)
            ) && (
              <Box sx={{ mt: 2 }}>
                {/* <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.dark' }}>
                  Custom Annualized Return
                </Typography> */}
                <TextField
                  label="🔧 Custom Annualized Return"
                  name="predicted_annualized_return"
                  type="number"
                  value={formParams.predicted_annualized_return || ''}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                  slotProps={{
                    input: {
                      endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>%</Typography>,
                    }
                  }}
                />
              </Box>
            )}
          </Box>
          {/* 提交按钮 */}
          <Button
            type="submit"
            variant="contained"
            disabled={apiLoading}
            size="large"
            fullWidth
            sx={{
              mt: 4,
              py: { xs: 2, md: 2.5 },
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              border: 'none',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                color: 'white',
                opacity: 0.7
              }
            }}
          >
            {apiLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} color="inherit" />
                <span>Calculating...</span>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span>🚀</span>
                <span>Calculate Returns</span>
                <span>📊</span>
              </Box>
            )}
          </Button>
        </form>

        {/* 加载状态 */}
        {apiLoading && (
          <Box sx={{ mt: 4 }}>
            <LoadingSpinner
              size="medium"
              message="Calculating your investment returns..."
              variant="pulse"
            />
          </Box>
        )}

        {/* 错误状态 */}
        {apiError && (
          <Alert
            severity="error"
            sx={{
              mt: 4,
              borderRadius: 3,
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              ❌ Error: {apiError}
            </Typography>
          </Alert>
        )}
        
        {/* 结果显示区域 */}
        {apiResult && (
          <Box className="slide-up" sx={{ mt: 6 }}>
            <Divider sx={{
              my: 4,
              background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
              height: 2,
              border: 'none'
            }} />
            <Typography
              variant="h4"
              component="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                my: 4,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <span style={{ fontSize: 'inherit' }}>📊</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Investment Results
              </span>
              <span style={{ fontSize: 'inherit' }}>🎉</span>
            </Typography>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <InvestmentResultsChart results={apiResult} />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}