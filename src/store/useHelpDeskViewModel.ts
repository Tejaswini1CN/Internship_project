import { useState } from 'react';
import { useAppContext } from './AppContext';

export type ReportType = 'item' | 'person' | 'emergency';

export function useHelpDeskViewModel(initialTab: 'items' | 'persons') {
  const { lostItems, missingPersons, markItemStatus, markPersonStatus, addLostItem, addMissingPerson } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'items' | 'persons'>(initialTab);
  const [filterMode, setFilterMode] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('item');
  
  // Generic / Shared fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formContact, setFormContact] = useState('');
  
  // Specific fields
  const [formCategory, setFormCategory] = useState(''); // item category or emergency type
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('');

  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredLostItems = lostItems.filter(item => {
    if (filterMode === 'All') return true;
    if (filterMode === 'Active') return item.status === 'Lost';
    return item.status === 'Found' || item.status === 'Resolved';
  });

  const filteredMissingPersons = missingPersons.filter(person => {
    if (filterMode === 'All') return true;
    if (filterMode === 'Active') return person.status === 'Missing';
    return person.status === 'Found';
  });

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormLocation('');
    setFormTime('');
    setFormContact('');
    setFormCategory('');
    setFormAge('');
    setFormGender('');
    setFormError('');
  };

  const closeReportSheet = () => {
    setShowReportSheet(false);
    resetForm();
  };

  const handleSubmit = (photoUri?: string | null) => {
    // Basic shared validation
    if (!formDesc.trim() || !formLocation.trim() || !formContact.trim()) {
      setFormError('Please fill in description, location, and contact number.');
      return;
    }

    if (reportType === 'item') {
      if (!formName.trim()) {
        setFormError('Please enter the item name.');
        return;
      }
      addLostItem({ 
        name: formName, 
        description: `[${formCategory || 'Other'}] ${formDesc}. Contact: ${formContact}`, 
        location: formLocation 
      }, photoUri || undefined);
      setActiveTab('items');
    } else if (reportType === 'person') {
      if (!formName.trim() || !formAge.trim()) {
        setFormError('Please enter the person\'s name and age.');
        return;
      }
      addMissingPerson({ 
        name: formName, 
        age: parseInt(formAge) || 0,
        description: `[${formGender || 'Unspecified'}] ${formDesc}. Contact: ${formContact}`, 
        location: formLocation 
      }, photoUri || undefined);
      setActiveTab('persons');
    } else if (reportType === 'emergency') {
      if (!formCategory.trim()) {
        setFormError('Please select an issue type.');
        return;
      }
      // For emergency
    }
    
    setFormError('');
    closeReportSheet();
    
    // Show snackbar
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return {
    // State
    filteredLostItems,
    filteredMissingPersons,
    activeTab,
    filterMode,
    showReportSheet,
    reportType,
    formName,
    formDesc,
    formLocation,
    formTime,
    formContact,
    formCategory,
    formAge,
    formGender,
    formError,
    showSuccess,

    // Actions
    setActiveTab,
    setFilterMode,
    setShowReportSheet,
    setReportType,
    setFormName,
    setFormDesc,
    setFormLocation,
    setFormTime,
    setFormContact,
    setFormCategory,
    setFormAge,
    setFormGender,
    markItemStatus,
    markPersonStatus,
    handleSubmit,
    closeReportSheet
  };
}
