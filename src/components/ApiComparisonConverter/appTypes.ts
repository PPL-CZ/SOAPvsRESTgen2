// --- Typy pro Porovnávací Část ---
export type Field = {
  soapField: string;
  restField: string;
  soapType: string;
  restType: string;
  soapRequired: boolean;
  restRequired: boolean;
  soapLength: string;
  restLength: string;
  notes: string;
  notesEn?: string; 
};

// Sloučený TabName typ zahrnující všechny záložky
export type TabName =
  | 'endpoints'
  | 'fields'
  | 'differences'
  | 'examples'
  | 'faq'
  | 'converter';

// Definice typu pro endpointy
export type Endpoint = {
  category: string;
  soapOperation: string;
  soapDescription: string;
  restEndpoint: string;
  restDescription: string;
  mainDifferences: string;
  mainDifferencesEn?: string; // Anglická verze rozdílů
  docUrl: string;
};

// --- Typy pro Převodník ---
export type RestOutput = {
  success: boolean;
  error?: string;
  operation?: string;
  method?: string;
  path?: string;
  body?: any;
  queryParams?: Record<string, string | string[]>;
  notes?: Array<{
    type: 'warning' | 'info';
    parameter: string;
    message: string;
  }>;
} | null;

// Tento typ definuje, co mají naše externí transformační funkce vracet
export type TransformationResultPart = Pick<
  Exclude<RestOutput, null>, 
  'method' | 'path' | 'body' | 'notes' | 'queryParams' 
>;

// Detailnější typy pro strukturu dat v převodníku
export interface SenderRecipient {
  name: string;
  name2?: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  contact?: string;
  phone?: string;
  email?: string;
}
export interface CashOnDelivery {
  codCurrency?: string;
  codPrice?: number;
  codVarSym?: string;
}

export interface ExternalNumber {
  code: string;
  externalNumber: string;
}

export interface Service {
  code: string;
}

export interface SpecificDelivery {
  parcelShopCode?: string;
}

export interface Shipment {
  productType: string;
  referenceId?: string;
  note?: string;
  weight?: string | number;
  depot?: string;
  sender: SenderRecipient;
  recipient: SenderRecipient;
  shipmentSet?: { numberOfShipments: number };
  cashOnDelivery?: CashOnDelivery;
  externalNumbers?: ExternalNumber[];
  services?: Service[];
  specificDelivery?: SpecificDelivery;
}

export interface Order {
  referenceId: string;
  productType: string;
  orderType: string;
  shipmentCount: number;
  note?: string;
  email?: string;
  sendDate: string;
  sender: SenderRecipient;
  recipient?: SenderRecipient;
  customerReference?: string; 
}

// Rozšířená podpora pro filtry v SOAP
export interface PackageFilter {
  packNumbers?: string[];
  custRefs?: string[];
  dateFrom?: string;
  dateTo?: string;
  packageStates?: string[];
  invoice?: string; 
  routingCode?: string; 
  senderCity?: string; 
  recipientCity?: string; 
  externalNumber?: string; 
  isReturnPackage?: string; 
  invNumbers?: string[]; 
  sizes?: string[]; 
  variableSymbolsCOD?: string; 
}

export interface OrderFilter {
  orderNumbers?: string[];
  custRefs?: string[];
  dateFrom?: string;
  dateTo?: string;
  orderStates?: string[];
}

export interface ParcelShopFilter {
  code?: string;
  countryCode?: string;
  zipCode?: string;
  city?: string;
  street?: string;
  accessPointType?: string;
  activeCardPayment?: string; 
  activeCashPayment?: string; 
  latitude?: string; 
  longitude?: string; 
  radius?: string; 
  sizes?: string[]; 
}

// Typ pro jazykovou volbu
export type Language = 'cs' | 'en';

export type ApiDataType = {
  endpointMappings: Endpoint[]; 
  fieldMappings: Record<string, FieldMappingDetail>; 
  generalDifferences: GeneralDifference[]; 
  categories: Category[]; 
  apiExamples: ApiExample[]; 
  faqItems: FaqItem[]; 
  translations: {
    [key: string]: {
      [key: string]: string | string[]; 
    };
  };
};

// Podrobnější typy pro strukturu apiData
export type FieldMappingDetail = {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  soapOperation: string;
  restEndpoint: string;
  docUrl: string;
  fields: Field[];
};

export type GeneralDifference = {
  category: string;
  categoryEn: string;
  soapApproach: string;
  soapApproachEn: string;
  soapExample: string;
  restApproach: string;
  restApproachEn: string;
  restExample: string;
  importance: 'high' | 'medium' | 'low';
};

export type Category = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
};

export type ApiExample = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  endpoint: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  requestBody: string;
  complexity: 'complex' | 'medium' | 'low';
  category: string;
  categoryEn: string;
};

export type FaqItem = {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category: string;
  categoryEn: string;
};
