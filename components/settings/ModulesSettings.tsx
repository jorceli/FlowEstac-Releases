import React from 'react';

interface AppModules {
    lpr: boolean;
    whatsapp: boolean;
    whatsappInstance?: string;
    whatsappToken?: string;
    barriers: boolean;
    barrierPort?: string;
    barrierIp?: string;
}

interface ModulesSettingsProps {
    modules: AppModules;
    setModules: (modules: AppModules) => void;
    handleSaveModules: () => void;
    isModulesSaved: boolean;
}

export const ModulesSettings: React.FC<ModulesSettingsProps> = ({
    modules,
    setModules,
    handleSaveModules,
    isModulesSaved
}) => {
    const toggleModule = (key: keyof AppModules) => {
        setModules({
            ...modules,
            [key]: !modules[key]
        });
    };

    const handleChange = (key: keyof AppModules, value: string) => {
        setModules({
            ...modules,
            [key]: value
        });
    };

    return (
        <div className="space-y-6">
            <div className="border-b pb-4 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Módulos do Sistema</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ative ou desative funcionalidades conforme a necessidade do seu estacionamento.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp Integration */}
                <div className={`p-4 rounded-xl border-2 transition-all ${modules.whatsapp ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleModule('whatsapp')}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${modules.whatsapp ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-lg">WhatsApp / Digital</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${modules.whatsapp ? 'bg-green-500' : 'bg-slate-300'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${modules.whatsapp ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4">
                        Permite o envio de comprovantes de entrada e saída via WhatsApp Web. Reduz o uso de papel.
                    </p>

                    {modules.whatsapp && (
                        <div className="space-y-3 pt-3 border-t border-green-200 dark:border-green-800/30">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ID da Instância</label>
                                <input
                                    type="text"
                                    value={modules.whatsappInstance || ''}
                                    onChange={(e) => handleChange('whatsappInstance', e.target.value)}
                                    placeholder="Ex: instance_12345"
                                    className="w-full p-2 text-sm border rounded dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Token de Acesso</label>
                                <input
                                    type="password"
                                    value={modules.whatsappToken || ''}
                                    onChange={(e) => handleChange('whatsappToken', e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full p-2 text-sm border rounded dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Access Control (Cancelas/Totem) */}
                <div className={`p-4 rounded-xl border-2 transition-all ${modules.barriers ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleModule('barriers')}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${modules.barriers ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v.756a49.106 49.106 0 0 1 9.152 1 .75.75 0 0 1-.152 1.485h-1.918l2.478 3.717a.75.75 0 0 1-.624 1.166h-1.876l2.478 3.717a.75.75 0 0 1-.624 1.166l-5.176-7.764a.75.75 0 1 1-1.248.832L19.221 15H11.25v2.25H15a.75.75 0 0 1 0 1.5h-3.75V21a.75.75 0 0 1-1.5 0v-2.25H6a.75.75 0 0 1 0-1.5h3.75V15H1.779l4.145-6.216a.75.75 0 1 1-1.248-.832L-.504 15.683a.75.75 0 0 1-.624-1.166l2.478-3.717H-.526a.75.75 0 0 1-.624-1.166l2.478-3.717h-1.92a.75.75 0 0 1-.152-1.485 49.219 49.219 0 0 1 9.152-1V3a.75.75 0 0 1 .75-.75Zm4.878 13.5H7.122l2.44-3.659 2.438 3.659Zm-4.878-7.317 2.44-3.66-2.44 3.66Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-lg">Controle de Acesso</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${modules.barriers ? 'bg-blue-500' : 'bg-slate-300'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${modules.barriers ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4">
                        Integração com Totens e Cancelas. Gera QR Codes nos tickets para leitura automática na saída.
                    </p>

                    {modules.barriers && (
                        <div className="space-y-3 pt-3 border-t border-blue-200 dark:border-blue-800/30">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Porta COM / Serial</label>
                                <input
                                    type="text"
                                    value={modules.barrierPort || ''}
                                    onChange={(e) => handleChange('barrierPort', e.target.value)}
                                    placeholder="Ex: COM3"
                                    className="w-full p-2 text-sm border rounded dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">IP da Controladora</label>
                                <input
                                    type="text"
                                    value={modules.barrierIp || ''}
                                    onChange={(e) => handleChange('barrierIp', e.target.value)}
                                    placeholder="Ex: 192.168.1.100"
                                    className="w-full p-2 text-sm border rounded dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* LPR (Placeholder) */}
                <div className={`p-4 rounded-xl border-2 transition-all cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-700`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-lg">Leitura de Placas (LPR)</span>
                        </div>
                        <div className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-xs rounded text-slate-500 font-bold">
                            BREVE
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Captura automática da placa via câmera na entrada. (Em desenvolvimento)
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                <button
                    onClick={handleSaveModules}
                    disabled={isModulesSaved}
                    className={`py-2 px-6 font-semibold rounded-lg transition-all ${isModulesSaved
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                        }`}
                >
                    {isModulesSaved ? 'Módulos Salvos!' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
};
