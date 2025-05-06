
import React, { useState, useEffect } from 'react';
import ServiceManagement from '@/components/services/ServiceManagement';
import { safeServiceOperations } from "@/utils/supabaseHelpers";

// This type matches the updated Service interface in ServiceManagement.tsx
interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const serviceUtils = await safeServiceOperations();
        const { services: serviceData, error } = await serviceUtils.getAll();
          
        if (error) {
          console.error('Erro ao buscar serviços:', error);
        } else {
          console.log('Serviços carregados com sucesso:', serviceData);
          // Armazenar os serviços no localStorage para uso em componentes que 
          // ainda não foram migrados para consultas diretas
          localStorage.setItem('services', JSON.stringify(serviceData));
          setServices(serviceData as Service[]);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Serviços</h1>
        <p className="text-gray-600">Gerencie os serviços oferecidos pelo laboratório</p>
      </div>
      
      {/* Passando os serviços carregados para o componente de gerenciamento */}
      <ServiceManagement initialServices={services} loading={loading} />
    </div>
  );
}
