"use client";
import { useState, useCallback } from "react"; // Added useCallback
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
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
    <Card className="mb-8 mt-8">
      <CardContent>

        <PriceChart
          calFormStartDate={formParams.start_date}
          calFormEndDate={formParams.end_date}
          onDatesChange={handleChartDatesChangeInForm}
        />

        <h2 className="text-xl font-semibold mb-4 text-center pt-5">Calculate Investment Growth</h2>

        <form onSubmit={handleSubmit} className="mt-4"> {/* Added margin top to the form for spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <DatePicker
              label="Start Date"
              value={formParams.start_date ? parseISO(formParams.start_date) : null}
              onAccept={(newValue) => handleDateChange('start_date', newValue)}
              format="yyyy-MM-dd"
              slotProps={{ textField: { fullWidth: true, required: true, name: "start_date", inputProps: { readOnly: true } } }}
            />
            <DatePicker
              label="End Date"
              value={formParams.end_date ? parseISO(formParams.end_date) : null}
              onAccept={(newValue) => handleDateChange('end_date', newValue)}
              format="yyyy-MM-dd"
              slotProps={{ textField: { fullWidth: true, required: true, name: "end_date", inputProps: { readOnly: true } } }}
            />
            <TextField
              label="Initial Investment ($)"
              name="initial_investment"
              type="number"
              value={formParams.initial_investment}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Monthly Investment Date (1-31)"
              name="monthly_investment_date"
              type="number"
              value={formParams.monthly_investment_date}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1, max: 31 }}
            />
            <TextField
              label="Monthly Investment Amount ($)"
              name="monthly_investment_amount"
              type="number"
              value={formParams.monthly_investment_amount}
              onChange={handleChange}
              fullWidth
              required
            />
          </div>
          <Button type="submit" variant="contained" color="primary" disabled={apiLoading}>
            {apiLoading ? <CircularProgress size={24} /> : 'Calculate'}
          </Button>
        </form>

        {apiLoading && <Typography className="mt-4">Calculating...</Typography>}
        {apiError && <Alert severity="error" className="mt-4">Error: {apiError}</Alert>}
        {apiResult && (
          <InvestmentResultsChart results={apiResult} />
        )}
      </CardContent>
    </Card>
  );
}