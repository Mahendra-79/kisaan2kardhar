import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
  };
}

export const TRANSLATIONS: Translations = {
  appName: {
    en: 'Kisaan2Karidhar',
    te: 'కిసాన్2ఖరీదార్',
    hi: 'किसान2खरीदार'
  },
  tagline: {
    en: 'Direct Farm-to-Buyer Marketplace & Logistics Engine',
    te: 'రైతు నుండి నేరుగా కొనుగోలుదారునికి మార్కెట్ & లాజిస్టిక్స్',
    hi: 'किसान से सीधे खरीदार तक कृषि बाज़ार और लॉजिस्टिक्स'
  },
  chooseInterface: {
    en: 'Choose your interface',
    te: 'మీ ఇంటర్‌ఫేస్‌ను ఎంచుకోండి',
    hi: 'अपना इंटरफ़ेस चुनें'
  },
  roleFarmer: {
    en: 'Farmer',
    te: 'రైతు (Farmer)',
    hi: 'किसान (Farmer)'
  },
  roleFpo: {
    en: 'FPO',
    te: 'ఎఫ్‌పిఓ (FPO)',
    hi: 'एफपीओ (FPO)'
  },
  roleCustomer: {
    en: 'Small-Scale Customer',
    te: 'చిన్న కస్టమర్ (1-5 kg)',
    hi: 'छोटे उपभोक्ता (1-5 kg)'
  },
  roleBulkBuyer: {
    en: 'Bulk Buyer',
    te: 'బల్క్ కొనుగోలుదారు',
    hi: 'थोक खरीदार (Bulk)'
  },
  roleLogistics: {
    en: 'Logistics Provider',
    te: 'లాజిస్టిక్స్ ప్రొవైడర్',
    hi: 'लॉजिस्टिक्स प्रदाता'
  },
  roleAdmin: {
    en: 'Admin',
    te: 'అడ్మిన్ (Admin)',
    hi: 'प्रशासक (Admin)'
  },
  back: {
    en: 'Back',
    te: 'వెనుకకు',
    hi: 'वापस'
  },
  main: {
    en: 'Main',
    te: 'ప్రధాన పేజీ',
    hi: 'मुख्य'
  },
  logout: {
    en: 'Logout',
    te: 'లాగౌట్',
    hi: 'लॉगआउट'
  },
  notifications: {
    en: 'Notifications',
    te: 'నోటిఫికేషన్లు',
    hi: 'सूचनाएं'
  },
  activeListings: {
    en: 'Active Listings',
    te: 'క్రియాశీల జాబితాలు',
    hi: 'सक्रिय लिस्टिंग'
  },
  totalProduce: {
    en: 'Total Produce',
    te: 'మొత్తం ఉత్పత్తి',
    hi: 'कुल उपज'
  },
  pendingOrders: {
    en: 'Pending Orders',
    te: 'పెండింగ్ ఆర్డర్లు',
    hi: 'लंबित ऑर्डर'
  },
  completedOrders: {
    en: 'Completed Orders',
    te: 'పూర్తయిన ఆర్డర్లు',
    hi: 'पूर्ण किए गए ऑर्डर'
  },
  earnings: {
    en: 'Total Earnings',
    te: 'మొత్తం సంపాదన',
    hi: 'कुल कमाई'
  },
  addProduce: {
    en: 'Add Produce',
    te: 'ఉత్పత్తిని జోడించండి',
    hi: 'उपज जोड़ें'
  },
  marketPrices: {
    en: 'Market Prices',
    te: 'మార్కెట్ ధరలు',
    hi: 'बाज़ार भाव'
  },
  demandForecast: {
    en: 'Demand & Forecasting',
    te: 'డిమాండ్ అంచనా',
    hi: 'मांग का पूर्वानुमान'
  },
  aiRecommendations: {
    en: 'AI Recommendations',
    te: 'AI సిఫార్సులు',
    hi: 'एआई सिफारिशें'
  },
  routeOptimization: {
    en: 'Route Optimization',
    te: 'రూట్ ఆప్టిమైజేషన్',
    hi: 'रूट अनुकूलन'
  },
  nearbyFarmers: {
    en: 'Nearby Farmers',
    te: 'సమీప రైతులు',
    hi: 'नजदीकी किसान'
  },
  deliveryCharge: {
    en: 'Delivery Charge',
    te: 'డెలివరీ ఛార్జీ',
    hi: 'डिलीवरी शुल्क'
  },
  totalAmount: {
    en: 'Total Amount',
    te: 'మొత్తం మొత్తం',
    hi: 'कुल राशि'
  },
  placeOrder: {
    en: 'Place Order',
    te: 'ఆర్డర్ ఇవ్వండి',
    hi: 'ऑर्डर दें'
  },
  accept: {
    en: 'Accept',
    te: 'అంగీకరించు',
    hi: 'स्वीकार करें'
  },
  reject: {
    en: 'Reject',
    te: 'తిరస్కరించు',
    hi: 'अस्वीकार करें'
  },
  pickupStarted: {
    en: 'Pickup Started',
    te: 'పికప్ ప్రారంభమైంది',
    hi: 'पिकअप शुरू'
  },
  pickedUp: {
    en: 'Picked Up',
    te: 'సరుకు తీసుకోబడింది',
    hi: 'उठा लिया गया'
  },
  outForDelivery: {
    en: 'Out for Delivery',
    te: 'డెలివరీకి బయలుదేరింది',
    hi: 'डिलीवरी के लिए रवाना'
  },
  delivered: {
    en: 'Delivered',
    te: 'డెలివరీ పూర్తయింది',
    hi: 'डिलीवर किया गया'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('k2k_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('k2k_language', lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
