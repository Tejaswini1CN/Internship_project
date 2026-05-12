import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Package, User, AlertTriangle, Search, Camera, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CustomButton } from '../components/ui/CustomButton';
import { cn } from '../lib/utils';
import { useHelpDeskViewModel, ReportType } from '../store/useHelpDeskViewModel';

export function ReportScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = (searchParams.get('type') as ReportType) || 'item';

  // We can initialize the view model specifically for the report screen, or we could 
  // rely on context. Actually, since `useHelpDeskViewModel` relies on `useAppContext`, 
  // it doesn't matter if we instantiate it here again.
  const { 
    reportType, setReportType,
    formName, setFormName,
    formDesc, setFormDesc,
    formLocation, setFormLocation,
    formTime, setFormTime,
    formContact, setFormContact,
    formCategory, setFormCategory,
    formAge, setFormAge,
    formGender, setFormGender,
    formError, showSuccess,
    handleSubmit
  } = useHelpDeskViewModel('items'); // initial tab doesn't matter here

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  // Ensure initial type is set (only on mount)
  React.useEffect(() => {
    setReportType(initialType);
  }, [initialType]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const onSubmit = () => {
    handleSubmit(photoPreview);
    if (showSuccess === false) {
      // Meaning error didn't prevent it, or we can check formError
    }
  };

  // We also want to auto navigate back after a short success delay
  React.useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="flex flex-col h-full w-full bg-background overflow-hidden relative z-50"
    >
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-20 text-text-primary shadow-sm border-b border-border">
         <button onClick={handleCancel} className="p-2 rounded-full hover:bg-border transition-colors -ml-2">
            <ChevronLeft size={28} />
         </button>
         <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">Submit Report</h1>
         <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
          {/* Type Selector */}
          <div className="space-y-3">
             <div className="flex gap-2">
                <button 
                  onClick={() => setReportType('item')} 
                  className={cn("flex-1 p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold text-xs text-center", reportType === 'item' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-text-secondary hover:border-primary/30')}
                >
                   <Package size={20} /> Lost Item
                </button>
                <button 
                  onClick={() => setReportType('person')} 
                  className={cn("flex-1 p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold text-xs text-center", reportType === 'person' ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'border-border bg-surface text-text-secondary hover:border-red-500/30')}
                >
                   <User size={20} /> Missing Person
                </button>
                <button 
                  onClick={() => setReportType('emergency')} 
                  className={cn("flex-1 p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold text-xs text-center", reportType === 'emergency' ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'border-border bg-surface text-text-secondary hover:border-orange-500/30')}
                >
                   <AlertTriangle size={20} /> Emergency
                </button>
             </div>
          </div>

          <div 
             className="w-full h-32 bg-surface border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-text-secondary gap-3 cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden"
             onClick={() => fileInputRef.current?.click()}
          >
             {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                     <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full border border-white/20">Change Photo</span>
                  </div>
                </>
             ) : (
                <>
                   <Camera size={32} className="text-primary/50" />
                   <span className="text-sm font-bold text-text-secondary">Upload Photo (Optional)</span>
                </>
             )}
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          </div>

          {formError && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex gap-2 items-start">
               <AlertTriangle size={16} className="mt-0.5 shrink-0" />
               {formError}
             </div>
          )}

          {/* Dynamic Form Fields */}
          <div className="space-y-4">
             {/* Name Fields */}
             {reportType !== 'emergency' && (
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-primary ml-1">{reportType === 'person' ? 'Person Name *' : 'Item Name *'}</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder={reportType === 'person' ? "e.g. Suresh Kumar" : "e.g. Red Wallet"} className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary placeholder:text-text-secondary/50" />
               </div>
             )}

             {/* Category / Type */}
             {reportType === 'item' && (
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-primary ml-1">Category</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary appearance-none">
                     <option value="" disabled>Select category</option>
                     <option value="Mobile">Mobile</option>
                     <option value="Bag">Bag</option>
                     <option value="Wallet">Wallet</option>
                     <option value="Jewelry">Jewelry</option>
                     <option value="Other">Other</option>
                  </select>
               </div>
             )}

             {reportType === 'emergency' && (
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-primary ml-1">Issue Type *</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary appearance-none">
                     <option value="" disabled>Select issue type</option>
                     <option value="Medical Emergency">Medical Emergency</option>
                     <option value="Crowd Issue">Crowd Issue</option>
                     <option value="Safety Concern">Safety Concern</option>
                     <option value="Other">Other</option>
                  </select>
               </div>
             )}

             {/* Person Specific */}
             {reportType === 'person' && (
               <div className="flex gap-4">
                 <div className="space-y-1.5 flex-1">
                    <label className="text-sm font-bold text-text-primary ml-1">Age *</label>
                    <input value={formAge} onChange={e => setFormAge(e.target.value)} type="number" placeholder="e.g. 8" className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary placeholder:text-text-secondary/50" />
                 </div>
                 <div className="space-y-1.5 flex-1">
                    <label className="text-sm font-bold text-text-primary ml-1">Gender</label>
                    <select value={formGender} onChange={e => setFormGender(e.target.value)} className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary appearance-none">
                       <option value="" disabled>Select</option>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                    </select>
                 </div>
               </div>
             )}

             {/* Description */}
             <div className="space-y-1.5">
                <label className="text-sm font-bold text-text-primary ml-1">
                  {reportType === 'person' ? 'Clothing & Description *' : 'Description *'}
                </label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} placeholder={reportType === 'person' ? "What were they wearing? Any distinguishing features?" : "Describe the item in detail"} className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary resize-none placeholder:text-text-secondary/50"></textarea>
             </div>

             {/* Location & Time */}
             <div className="flex gap-4">
                <div className="space-y-1.5 flex-[2]">
                   <label className="text-sm font-bold text-text-primary ml-1">
                     {reportType === 'emergency' ? 'Current Location *' : 'Last Seen Location *'}
                   </label>
                   <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="e.g. Main Temple" className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary placeholder:text-text-secondary/50" />
                </div>
                {reportType !== 'emergency' && (
                  <div className="space-y-1.5 flex-1">
                     <label className="text-sm font-bold text-text-primary ml-1">Time</label>
                     <input value={formTime} type="time" onChange={e => setFormTime(e.target.value)} className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary" />
                  </div>
                )}
             </div>

             {/* Contact */}
             <div className="space-y-1.5">
                <label className="text-sm font-bold text-text-primary ml-1">Your Contact Number *</label>
                <input value={formContact} type="tel" onChange={e => setFormContact(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-3.5 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary placeholder:text-text-secondary/50" />
             </div>
          </div>
          
          <div className="h-6"></div>
      </div>

      <div className="p-4 bg-surface border-t border-border mt-auto shrink-0 pb-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <CustomButton 
          className={cn(
             reportType === 'person' ? 'bg-red-500 hover:bg-red-600' : 
             reportType === 'emergency' ? 'bg-orange-500 hover:bg-orange-600' : ''
          )} 
          onClick={onSubmit} 
          fullWidth
        >
          Submit Report
        </CustomButton>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-surface relative z-10 px-8 py-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center"
           >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                 <CheckCircle2 size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-text-primary mb-2">Report Submitted</h2>
              <p className="text-text-secondary font-medium">Your report has been successfully registered with the help desk.</p>
           </motion.div>
        </div>
      )}
    </motion.div>
  );
}
