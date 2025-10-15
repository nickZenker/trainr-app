'use client';

import { useState } from 'react';
import { schedulePlanAction } from './actions';

const WEEKDAYS = [
  { value: 0, label: 'Sonntag' },
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' }
];

// Default patterns based on plan type
const DEFAULT_PATTERNS = {
  strength: [
    { weekday: 1, time: '18:00', title: 'Krafttraining Oberkörper' },
    { weekday: 3, time: '18:00', title: 'Krafttraining Unterkörper' },
    { weekday: 5, time: '18:00', title: 'Krafttraining Ganzkörper' }
  ],
  endurance: [
    { weekday: 2, time: '18:00', title: 'Ausdauertraining Lauf' },
    { weekday: 4, time: '18:00', title: 'Ausdauertraining Rad' },
    { weekday: 6, time: '10:00', title: 'Ausdauertraining Lang' }
  ]
};

export default function ScheduleForm({ plan }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Get default timezone
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Get tomorrow's date as default start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStartDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    startDate: defaultStartDate,
    timezone: defaultTimezone,
    weeks: 8,
    pattern: DEFAULT_PATTERNS[plan.type] || DEFAULT_PATTERNS.strength
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const addPatternRow = () => {
    setFormData(prev => ({
      ...prev,
      pattern: [...prev.pattern, { weekday: 1, time: '18:00', title: '' }]
    }));
  };

  const removePatternRow = (index) => {
    setFormData(prev => ({
      ...prev,
      pattern: prev.pattern.filter((_, i) => i !== index)
    }));
  };

  const updatePatternRow = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pattern: prev.pattern.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    if (!formData.startDate) {
      showToast('Bitte wählen Sie ein Startdatum', 'error');
      return false;
    }

    if (formData.weeks < 1 || formData.weeks > 52) {
      showToast('Wochenanzahl muss zwischen 1 und 52 liegen', 'error');
      return false;
    }

    if (formData.pattern.length === 0) {
      showToast('Bitte mindestens einen Wochentag hinzufügen', 'error');
      return false;
    }

    // Validate time format
    for (const item of formData.pattern) {
      if (!item.time || !/^\d{1,2}:\d{2}$/.test(item.time)) {
        showToast('Bitte gültige Zeit im Format HH:MM eingeben', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("planId", plan.id);
      formDataToSubmit.append("startDate", formData.startDate);
      formDataToSubmit.append("timezone", formData.timezone);
      formDataToSubmit.append("weeks", formData.weeks.toString());
      
      // Add pattern data
      formData.pattern.forEach((item, index) => {
        formDataToSubmit.append(`pattern[${index}][weekday]`, item.weekday.toString());
        formDataToSubmit.append(`pattern[${index}][time]`, item.time);
        formDataToSubmit.append(`pattern[${index}][title]`, item.title || '');
      });

      await schedulePlanAction(formDataToSubmit);
    } catch (error) {
      console.error('Schedule form error:', error);
      showToast(error.message || 'Ein unerwarteter Fehler ist aufgetreten', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <form onSubmit={handleSubmit} className="space-y-6" data-testid="plan-schedule-form">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
            Startdatum
          </label>
          <input
            type="date"
            id="startDate"
            data-testid="plan-schedule-start"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-2">
            Zeitzone
          </label>
          <select
            id="timezone"
            data-testid="plan-schedule-tz"
            value={formData.timezone}
            onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="Europe/Berlin">Europe/Berlin</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>

        {/* Weeks */}
        <div>
          <label htmlFor="weeks" className="block text-sm font-medium text-foreground mb-2">
            Wochenanzahl
          </label>
          <input
            type="number"
            id="weeks"
            data-testid="plan-schedule-weeks"
            min="1"
            max="52"
            value={formData.weeks}
            onChange={(e) => setFormData(prev => ({ ...prev, weeks: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        {/* Pattern Editor */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-foreground">
              Wochentage & Zeiten
            </label>
            <button
              type="button"
              data-testid="pattern-add"
              onClick={addPatternRow}
              className="px-3 py-1 text-sm bg-brand text-black rounded-md hover:bg-brand-hover transition-colors"
            >
              + Tag hinzufügen
            </button>
          </div>

          <div className="space-y-3">
            {formData.pattern.map((item, index) => (
              <div key={index} data-testid={`pattern-row-${index}`} className="flex gap-3 items-center">
                <select
                  value={item.weekday}
                  onChange={(e) => updatePatternRow(index, 'weekday', parseInt(e.target.value))}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {WEEKDAYS.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updatePatternRow(index, 'time', e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />

                <input
                  type="text"
                  placeholder="Titel (optional)"
                  value={item.title}
                  onChange={(e) => updatePatternRow(index, 'title', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />

                <button
                  type="button"
                  data-testid={`pattern-remove-${index}`}
                  onClick={() => removePatternRow(index)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            data-testid="plan-schedule-submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand text-black rounded-md font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Erstelle Termine...' : 'Termine erzeugen'}
          </button>
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md text-white z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
