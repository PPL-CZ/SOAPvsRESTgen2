import React, { useState, useCallback } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Info,
  AlertCircle,
  Code,
  Play,
  RefreshCw,
  //Settings,
  Zap,
  Terminal,
} from 'lucide-react';
import type {
  Language,
  RestOutput,
  TransformationResultPart,
} from '../appTypes';

// Importy VŠECH našich transformačních funkcí
import { transformCreatePackagesToRest } from './converterLogic/transformCreatePackages';
import {
  transformCreateOrdersToRest,
  transformCreatePickupOrdersToRest,
  transformGetOrdersToRest,
  transformCancelOrderToRest,
} from './converterLogic/transformOrderOperations';
import {
  transformCancelPackageToRest,
  transformUpdatePackageToRest,
  transformGetPackagesToRest,
} from './converterLogic/transformPackageOperations';
import { transformGetParcelShopsToRest } from './converterLogic/transformGetParcelShops';

// Import jediné utility, kterou zde potřebujeme pro JSX
import { constructQueryString } from '../utils';

interface ConverterSectionProps {
  language: Language;
  t: (key: string) => string | string[];
  copiedButtonId: string | null;
  copyToClipboard: (text: string, buttonId: string) => void;
}

const ConverterSection: React.FC<ConverterSectionProps> = ({
  language,
  t,
  copiedButtonId,
  copyToClipboard,
}) => {
  const [soapInput, setSoapInput] = useState('');
  const [restOutput, setRestOutput] = useState<RestOutput>(null);
  const [converterBaseUrl, setConverterBaseUrl] = useState(
    'https://api.dhl.com/ecs/ppl/myapi2'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const operations = [
    {
      name: 'CreatePackages',
      rest: 'POST /shipment/batch',
      color: 'bg-blue-500',
      icon: '📦',
    },
    {
      name: 'CreateOrders',
      rest: 'POST /order/batch',
      color: 'bg-green-500',
      icon: '📋',
    },
    {
      name: 'CreatePickupOrders',
      rest: 'POST /order/batch',
      color: 'bg-purple-500',
      icon: '🚚',
    },
    {
      name: 'GetPackages',
      rest: 'GET /shipment',
      color: 'bg-cyan-500',
      icon: '🔍',
    },
    {
      name: 'CancelPackage',
      rest: 'POST /shipment/{id}/cancel',
      color: 'bg-red-500',
      icon: '❌',
    },
    {
      name: 'UpdatePackage',
      rest: 'POST /shipment/{id}/redirect',
      color: 'bg-orange-500',
      icon: '✏️',
    },
    {
      name: 'GetOrders',
      rest: 'GET /order',
      color: 'bg-indigo-500',
      icon: '📄',
    },
    {
      name: 'CancelOrder',
      rest: 'POST /order/cancel',
      color: 'bg-pink-500',
      icon: '🗑️',
    },
    {
      name: 'GetParcelShops',
      rest: 'GET /accessPoint',
      color: 'bg-teal-500',
      icon: '🏪',
    },
  ];

  const handleTransform = useCallback(async () => {
    if (!soapInput.trim()) {
      setRestOutput({ success: false, error: t('enterSoapXml') as string });
      return;
    }

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const operationTransformers: {
        [key: string]: (
          xml: string,
          tFunc: typeof t
        ) => TransformationResultPart;
      } = {
        CreatePackages: transformCreatePackagesToRest,
        CreateOrders: transformCreateOrdersToRest,
        CreatePickupOrders: transformCreatePickupOrdersToRest,
        GetPackages: transformGetPackagesToRest,
        CancelPackage: transformCancelPackageToRest,
        UpdatePackage: transformUpdatePackageToRest,
        GetOrders: transformGetOrdersToRest,
        CancelOrder: transformCancelOrderToRest,
        GetParcelShops: transformGetParcelShopsToRest,
      };

      let operationName: string | null = null;
      for (const opKey in operationTransformers) {
        if (new RegExp(`<\\s*(\\w+:)?${opKey}[^>]*>`, 'i').test(soapInput)) {
          operationName = opKey;
          break;
        }
      }

      if (operationName) {
        const transformer = operationTransformers[operationName];
        const transformationResultPart = transformer(soapInput, t);
        setRestOutput({
          success: true,
          operation: operationName,
          ...transformationResultPart,
        });
      } else {
        setRestOutput({
          success: false,
          error: t('converterUnsupportedOperation') as string,
        });
      }
    } catch (error: any) {
      console.error('Chyba při transformaci v handleTransform:', error);
      setRestOutput({
        success: false,
        error: `${t('conversionError') as string}: ${error.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [soapInput, language, t]);

  const resetConverterForm = useCallback(() => {
    setSoapInput('');
    setRestOutput(null);
  }, []);

  const getExampleSoapXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://myapi.ppl.cz/v1">
   <soapenv:Header/>
   <soapenv:Body>
      <v1:CreatePackages>
         <v1:Package>
            <v1:ReferenceId>REF001</v1:ReferenceId>
            <v1:ProductType>PPL_PARCEL_CZ_PRIVATE</v1:ProductType>
            <v1:Note>Testovací balík</v1:Note>
            <v1:Weight>2.5</v1:Weight>
            <v1:Sender>
               <v1:Name>Jan Odesílatel</v1:Name>
               <v1:Street>Wenceslas Square 1</v1:Street>
               <v1:City>Praha</v1:City>
               <v1:ZipCode>11000</v1:ZipCode>
               <v1:Country>CZ</v1:Country>
               <v1:Email>sender@example.com</v1:Email>
            </v1:Sender>
            <v1:Recipient>
               <v1:Name>Eva Příjemce</v1:Name>
               <v1:Street>Karlovo náměstí 5</v1:Street>
               <v1:City>Praha</v1:City>
               <v1:ZipCode>12000</v1:ZipCode>
               <v1:Country>CZ</v1:Country>
               <v1:Phone>+420123456789</v1:Phone>
            </v1:Recipient>
         </v1:Package>
      </v1:CreatePackages>
   </soapenv:Body>
</soapenv:Envelope>`;
  };

  const insertExampleXml = () => {
    setSoapInput(getExampleSoapXml());
  };

  return (
    <div className="mt-2">
      {/* Hlavička s titulkem a API Base URL */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {t('converterTitle') as string}
        </h2>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            API Base URL:
          </span>
          <input
            type="text"
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            value={converterBaseUrl}
            onChange={(e) => setConverterBaseUrl(e.target.value)}
            style={{ minWidth: '300px' }}
          />
        </div>
      </div>

      {/* Upozornění (vždy viditelné) */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {language === 'cs' ? 'Upozornění' : 'Warning'}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {t('converterWarning') as string}
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner s lepším designem */}
      {restOutput && restOutput.success && (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-xl shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    {t('conversionSuccess') as string}
                  </h3>
                  <p className="text-sm text-green-700 mt-0.5">
                    <span className="font-mono font-bold">
                      {restOutput.operation}
                    </span>{' '}
                    →{' '}
                    {
                      operations.find((op) => op.name === restOutput.operation)
                        ?.rest
                    }
                  </p>
                </div>
              </div>
              <div className="text-2xl">
                {
                  operations.find((op) => op.name === restOutput.operation)
                    ?.icon
                }
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm break-all flex-1 mr-4">
                  <span className="font-bold text-green-700">
                    {restOutput.method}
                  </span>{' '}
                  <span className="text-gray-900">
                    {converterBaseUrl}
                    {restOutput.path}
                  </span>
                  {restOutput.queryParams &&
                    Object.keys(restOutput.queryParams).length > 0 && (
                      <span className="text-blue-600">
                        {constructQueryString(restOutput.queryParams)}
                      </span>
                    )}
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${restOutput.method} ${converterBaseUrl}${
                        restOutput.path
                      }${
                        restOutput.queryParams
                          ? constructQueryString(restOutput.queryParams)
                          : ''
                      }`,
                      'rest-url'
                    )
                  }
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  {copiedButtonId === 'rest-url' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {t('copyEndpoint') as string}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout se 3 sloupci - Operations jako sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Sidebar s operacemi */}
        <div className="xl:col-span-3">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-4">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                {t('supportedOperations') as string}
              </h3>
            </div>
            <div className="p-2" style={{ height: '640px', overflowY: 'auto' }}>
              {operations.map((op) => (
                <div
                  key={op.name}
                  className={`
                    m-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
                    ${
                      restOutput?.operation === op.name
                        ? `${op.color} text-white shadow-md transform scale-105`
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{op.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{op.name}</div>
                      <div className="opacity-75 text-xs mt-0.5">
                        {op.rest.split(' ')[0]}
                      </div>
                    </div>
                    {restOutput?.operation === op.name && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hlavní obsah - SOAP a REST */}
        <div className="xl:col-span-9">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOAP Input */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    {t('soapRequest') as string}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={insertExampleXml}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors duration-200"
                    >
                      {language === 'cs' ? 'Příklad' : 'Example'}
                    </button>
                    <button
                      onClick={resetConverterForm}
                      disabled={!soapInput && !restOutput}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="relative">
                  <textarea
                    className="w-full h-160 p-3 font-mono text-sm bg-slate-900 text-green-400 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-0"
                    value={soapInput}
                    onChange={(e) => setSoapInput(e.target.value)}
                    placeholder={t('enterSoapXml') as string}
                    spellCheck={false}
                    style={{ height: '640px' }}
                  />
                  <div className="absolute top-2 right-2 text-xs text-green-500/70 font-mono bg-slate-800/80 px-2 py-1 rounded">
                    XML
                  </div>
                </div>
                <button
                  onClick={handleTransform}
                  disabled={!soapInput.trim() || isProcessing}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {language === 'cs' ? 'Zpracovávám...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {t('transform') as string}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* REST Output */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  {t('restEquivalent') as string}
                </h3>
              </div>
              <div className="p-4">
                {restOutput === null ? (
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-300"
                    style={{ height: '640px' }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Code className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {t('resultWillAppear') as string}
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        {t('enterSoapAndClick') as string}
                      </p>
                    </div>
                  </div>
                ) : !restOutput.success ? (
                  <div
                    className="flex items-start gap-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200 p-4"
                    style={{ height: '640px' }}
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">
                        {t('conversionError') as string}
                      </h4>
                      <p className="text-red-700 text-sm">{restOutput.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">
                        {t('jsonBody') as string}
                      </h4>
                      {restOutput.body !== null && (
                        <button
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(restOutput.body, null, 2),
                              'rest-body'
                            )
                          }
                          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
                        >
                          {copiedButtonId === 'rest-body' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {t('copyJson') as string}
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div
                        className="bg-slate-900 rounded-lg p-3 overflow-auto"
                        style={{ height: '528px' }}
                      >
                        <div className="absolute top-2 right-2 text-xs text-blue-400 font-mono bg-slate-800/80 px-2 py-1 rounded">
                          JSON
                        </div>
                        <pre className="text-sm font-mono text-blue-300 leading-relaxed">
                          {JSON.stringify(restOutput.body, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {restOutput.body === null &&
                      restOutput.method === 'GET' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <p className="text-sm text-blue-800">
                              {t('converterGetRequestNullBodyInfo') as string}
                            </p>
                          </div>
                        </div>
                      )}

                    {restOutput.notes && restOutput.notes.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <h5 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          {language === 'cs'
                            ? 'Poznámky ke konverzi'
                            : 'Conversion Notes'}
                        </h5>
                        <div className="space-y-1">
                          {restOutput.notes.map((note, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-2 ${
                                  note.type === 'warning'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                              />
                              <div className="text-sm">
                                <span className="font-medium text-amber-800">
                                  {note.parameter}:
                                </span>
                                <span className="text-amber-700 ml-1">
                                  {note.message}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterSection;
