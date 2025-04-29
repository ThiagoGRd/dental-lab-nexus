
import React, { useState, useEffect } from 'react';
import ServiceManagement from '@/components/services/ServiceManagement';
import { supabase } from "@/integrations/supabase/client";

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Erro ao buscar serviços:', error);
        } else {
          console.log('Serviços carregados com sucesso:', data);
          // Armazenar os serviços no localStorage para uso em componentes que 
          // ainda não foram migrados para consultas diretas
          localStorage.setItem('services', JSON.stringify(data));
          setServices(data);
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
