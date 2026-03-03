import React from 'react';
import { useLanguage, Language } from '../../index';

export const GeneralSettings: React.FC<any> = (props) => {
  const { t, language, setLanguage } = useLanguage();
  const {
    data,
    cancellationPassword,
    setCancellationPassword,
    discountPassword,
    setDiscountPassword,
    parkingLimit,
    setParkingLimit,
    newCancellationReason,
    setNewCancellationReason,
    handleDeleteCancellationReason,
    handleAddCancellationReason,
    handleSaveGeneralSettings,
    isGeneralSaved,
  } = props;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t('settings.general').split('|')[0]}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">{t('settings.language')}</label>
          <div className="flex gap-2 mt-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-2 px-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${language === lang.code
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                  }`}
              >
                <span>{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">{t('settings.cancellationPassword')}</label>
          <input type="password" value={cancellationPassword} onChange={e => setCancellationPassword(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('settings.discountPassword')}</label>
          <input type="password" value={discountPassword} onChange={e => setDiscountPassword(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('settings.parkingLimit')}</label>
          <input type="number" value={parkingLimit} onChange={e => setParkingLimit(parseInt(e.target.value, 10) || 0)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
        </div>
      </div>
      <h3 className="font-bold text-lg pt-4 border-t dark:border-slate-700">{t('settings.cancellationReasons')}</h3>
      <ul className="space-y-2">
        {data.cancellationReasons.map((r: any) => (
          <li key={r.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
            <span>{r.reason}</span>
            <button onClick={() => handleDeleteCancellationReason(r.id)} className="text-red-500 hover:text-red-700">{t('settings.delete')}</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input type="text" value={newCancellationReason} onChange={e => setNewCancellationReason(e.target.value)} placeholder={t('settings.newReasonPlaceholder')} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
        <button onClick={handleAddCancellationReason} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">{t('settings.add')}</button>
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={handleSaveGeneralSettings} disabled={isGeneralSaved} className={isGeneralSaved ? 'py-2 px-6 font-semibold rounded bg-green-600 text-white' : 'py-2 px-6 font-semibold rounded bg-blue-600 text-white hover:bg-blue-700'}>
          {isGeneralSaved ? t('settings.saved') : t('settings.saveGeneral')}
        </button>
      </div>
    </div>
  );
};

