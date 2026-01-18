import React, { useState, useEffect } from 'react';
import { NfseConfig } from '../../index';

interface NfseSettingsProps {
    nfseConfig: NfseConfig;
    setNfseConfig: React.Dispatch<React.SetStateAction<NfseConfig>>;
    handleSaveNfseConfig: () => void;
    isNfseSaved: boolean;
}

export const NfseSettings: React.FC<NfseSettingsProps> = ({
    nfseConfig,
    setNfseConfig,
    handleSaveNfseConfig,
    isNfseSaved,
}) => {
    const [localConfig, setLocalConfig] = useState<NfseConfig>(nfseConfig);

    useEffect(() => {
        setLocalConfig(nfseConfig);
    }, [nfseConfig]);

    const handleChange = (field: keyof NfseConfig, value: any) => {
        setLocalConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckCert = async () => {
        if (!localConfig.certPath) return alert('Selecione o caminho do certificado.');
        try {
            const result = await (window as any).electronAPI.checkCertificateInfo(localConfig.certPath, localConfig.certPassword);
            if (result.success) {
                setLocalConfig(prev => ({
                    ...prev,
                    certExpiration: result.expiration,
                    certSubject: result.subject
                }));
                alert('Certificado validado com sucesso!');
            } else {
                alert(`Erro ao validar certificado: ${result.error}`);
            }
        } catch (err) {
            console.error('Falha interna ao validar certificado:', err);
            alert('Falha interna ao validar certificado.');
        }
    };

    const handleSave = () => {
        setNfseConfig(localConfig);
        // Pequeno delay para garantir que o setNfseConfig (React state) seja processado antes do save (que lê do state)
        // No DataProvider, o setNfseConfig é assíncrono.
        setTimeout(() => {
            handleSaveNfseConfig();
        }, 100);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">CNPJ da Empresa</label>
                    <input type="text" value={localConfig.cnpj} onChange={e => handleChange('cnpj', e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" placeholder="00.000.000/0000-00" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Inscrição Municipal</label>
                    <input type="text" value={localConfig.im} onChange={e => handleChange('im', e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">CNAE Principal</label>
                    <input type="text" value={localConfig.cnae} onChange={e => handleChange('cnae', e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Caminho do Certificado (.pfx)</label>
                    <div className="flex gap-2">
                        <input type="text" value={localConfig.certPath} onChange={e => handleChange('certPath', e.target.value)} className="p-2 flex-1 border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" placeholder="C:\Caminho\meu_certificado.pfx" />
                        <button onClick={handleCheckCert} className="mt-1 bg-blue-100 text-blue-700 px-3 rounded hover:bg-blue-200 text-sm font-medium">Validar</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Senha do Certificado</label>
                    <input type="password" value={localConfig.certPassword} onChange={e => handleChange('certPassword', e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-600">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status da Comunicação</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${window.navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-semibold">{window.navigator.onLine ? 'Conectado à Internet' : 'Offline'}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Validade do Certificado</p>
                    {localConfig.certExpiration ? (
                        <div>
                            <p className="font-semibold">{new Date(localConfig.certExpiration).toLocaleDateString('pt-BR')}</p>
                            <p className="text-[10px] text-slate-500 truncate" title={localConfig.certSubject}>{localConfig.certSubject}</p>
                        </div>
                    ) : (
                        <p className="text-slate-400 italic">Não validado</p>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={localConfig.isHomologation} onChange={e => handleChange('isHomologation', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm font-medium">Modo Homologação (Ambiente de Testes)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={localConfig.autoEmit} onChange={e => handleChange('autoEmit', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm font-medium">Emitir NFSE automaticamente após confirmação do pagamento</span>
                </label>
            </div>

            <div className="flex justify-end pt-6">
                <button onClick={handleSave} className={`py-2 px-6 rounded-lg font-bold text-white transition-all ${isNfseSaved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700 shadow-lg active:transform active:scale-95'}`}>
                    {isNfseSaved ? 'Configurações Salvas!' : 'Salvar Configurações NFSE'}
                </button>
            </div>
        </div>
    );
};
