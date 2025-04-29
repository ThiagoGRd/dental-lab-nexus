
import React from 'react';
import ServiceManagement from '@/components/services/ServiceManagement';

export default function ServicesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Serviços</h1>
        <p className="text-gray-600">Gerencie os serviços oferecidos pelo laboratório</p>
      </div>
      
      <ServiceManagement />
    </div>
  );
}
