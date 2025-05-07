
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GenerateReportButtonsProps {
  reportType: string;
  startDate: string;
  endDate: string;
  data: any[];
  title?: string;
}

const GenerateReportButtons = ({ reportType, startDate, endDate, data, title = 'Relatório' }: GenerateReportButtonsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Format currency for reports
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date for reports
  const formatDateForDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Enviando para impressão...');
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title to document
      const reportTitle = `${title} (${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)})`;
      doc.setFontSize(16);
      doc.text(reportTitle, 14, 20);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 26);
      
      // Create table data
      let columns: any[] = [];
      let rows: any[] = [];

      // Configure columns and rows based on report type
      if (reportType === 'financial') {
        columns = [
          { header: 'Mês', dataKey: 'month' },
          { header: 'Receita', dataKey: 'receita' },
          { header: 'Despesa', dataKey: 'despesa' },
          { header: 'Saldo', dataKey: 'saldo' }
        ];
        
        rows = data.map(item => ({
          month: item.month,
          receita: formatCurrency(item.receita || 0),
          despesa: formatCurrency(item.despesa || 0),
          saldo: formatCurrency((item.receita || 0) - (item.despesa || 0))
        }));
        
        // Add summary row
        const totalReceita = data.reduce((sum, item) => sum + (item.receita || 0), 0);
        const totalDespesa = data.reduce((sum, item) => sum + (item.despesa || 0), 0);
        const totalSaldo = totalReceita - totalDespesa;
        
        rows.push({
          month: 'TOTAL',
          receita: formatCurrency(totalReceita),
          despesa: formatCurrency(totalDespesa),
          saldo: formatCurrency(totalSaldo)
        });
      } 
      else if (reportType === 'production') {
        columns = [
          { header: 'Mês', dataKey: 'month' },
          { header: 'Total Ordens', dataKey: 'total' },
          { header: 'Urgentes', dataKey: 'urgent' }
        ];
        
        rows = data.map(item => ({
          month: item.month,
          total: item.total,
          urgent: item.urgent
        }));
        
        // Add summary row
        const totalOrders = data.reduce((sum, item) => sum + (item.total || 0), 0);
        const totalUrgent = data.reduce((sum, item) => sum + (item.urgent || 0), 0);
        
        rows.push({
          month: 'TOTAL',
          total: totalOrders,
          urgent: totalUrgent
        });
      }
      else if (reportType === 'clients') {
        columns = [
          { header: 'Cliente', dataKey: 'name' },
          { header: 'Ordens', dataKey: 'orders' }
        ];
        
        rows = data.map(item => ({
          name: item.name,
          orders: item.orders
        }));
      }
      else if (reportType === 'stock') {
        columns = [
          { header: 'Material', dataKey: 'name' },
          { header: 'Estoque', dataKey: 'quantity' },
          { header: 'Mínimo', dataKey: 'min_quantity' },
          { header: 'Status', dataKey: 'status' }
        ];
        
        rows = data.map(item => ({
          name: item.name,
          quantity: `${item.quantity} ${item.unit || 'un'}`,
          min_quantity: `${item.min_quantity} ${item.unit || 'un'}`,
          status: item.status === 'ok' ? 'OK' : item.status === 'low' ? 'Baixo' : 'Crítico'
        }));
      }

      // Generate the table with autoTable plugin
      (doc as any).autoTable({
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        startY: 35,
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 245, 250] },
        foot: reportType !== 'clients' && reportType !== 'stock' ? 
          [columns.map(col => rows[rows.length - 1][col.dataKey] || '')] : undefined,
        footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' }
      });
      
      // Save the PDF
      const fileName = `${reportType}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Relatório PDF gerado com sucesso: ${fileName}`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleExport = async () => {
    try {
      await generatePDF();
    } catch (error) {
      toast.error('Falha ao exportar relatório');
      console.error(error);
    }
  };
  
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint} disabled={isGenerating}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={isGenerating}>
        <Download className="h-4 w-4 mr-2" />
        {isGenerating ? 'Gerando PDF...' : 'Exportar PDF'}
      </Button>
    </div>
  );
};

export default GenerateReportButtons;
