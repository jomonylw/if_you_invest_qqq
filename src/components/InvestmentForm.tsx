"use client";
import React, { useState, useCallback } from "react"; // Added useCallback
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, Box, Divider } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import type { InvestmentFormProps, CalApiParams } from '../types';
import InvestmentResultsChart from './InvestmentResultsChart';
import PriceChart from './PriceChart'; // Added PriceChart import

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
    await onFormSubmit(formParams);
  };

  return (
    <Card className="mb-8 mt-8" elevation={4} sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'visible' }}>
      <CardContent sx={{ padding: 4 }}>

        <PriceChart
          calFormStartDate={formParams.start_date}
          calFormEndDate={formParams.end_date}
          onDatesChange={handleChartDatesChangeInForm}
        />

        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            my: 3,
            color: 'primary.main'
          }}
        >
          Calculate Investment Growth
        </Typography>

        <form onSubmit={handleSubmit} className="mt-6">
          <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, boxShadow: 1, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.dark' }}>
              Investment Date Range
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, boxShadow: 1, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.dark' }}>
              Investment Amount & Plan
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Initial Investment ($)"
                name="initial_investment"
                type="number"
                value={formParams.initial_investment}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={{ bgcolor: 'background.paper' }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>,
                }}
              />
              <TextField
                label="Monthly Investment Amount ($)"
                name="monthly_investment_amount"
                type="number"
                value={formParams.monthly_investment_amount}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={{ bgcolor: 'background.paper' }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>,
                }}
              />
            </div>
          </Box>
          <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.dark' }}>
              Predicted Annualized Return
            </Typography>
            {annualReturns ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, justifyContent: 'center' }}>
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
                  label="Custom Annualized Return (%)"
                  name="predicted_annualized_return"
                  type="number"
                  value={formParams.predicted_annualized_return || ''}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: 'background.paper' }}
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>%</Typography>,
                  }}
                />
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={apiLoading}
            size="large"
            fullWidth
            sx={{
              mt: 4,
              py: 2,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(0, 123, 255, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0, 123, 255, 0.4)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            {apiLoading ? <CircularProgress size={24} color="inherit" /> : 'Calculate Returns'}
          </Button>
        </form>

        {apiLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} /> Calculating...
            </Typography>
          </Box>
        )}
        
        {apiError && (
          <Alert severity="error" sx={{ mt: 4, borderRadius: 1 }}>Error: {apiError}</Alert>
        )}
        
        {apiResult && (
          <>
            <Divider sx={{ my: 4 }} />
            {/* <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Investment Results</Typography> */}
            <Typography
              variant="h5"
              component="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                my: 3,
                color: 'primary.main'
              }}
            >
              Investment Results
            </Typography>
            <InvestmentResultsChart results={apiResult} />
          </>
        )}
      </CardContent>
    </Card>
  );
}