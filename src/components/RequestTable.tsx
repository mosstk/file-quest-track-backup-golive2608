
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RequestStatusBadge from './RequestStatusBadge';
import { FileRequest } from '@/types';
import { Search } from 'lucide-react';

interface RequestTableProps {
  requests: FileRequest[];
  showActions?: boolean;
}

const RequestTable: React.FC<RequestTableProps> = ({ 
  requests,
  showActions = true
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredRequests = requests.filter(request => {
    const searchFields = [
      request.document_name || request.documentName || '',
      request.requesterName || '',
      request.requesterEmail || '',
      request.receiver_email || request.receiverEmail || ''
    ].map(field => field.toLowerCase());
    
    return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/request/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหาตามชื่อเอกสาร, ชื่อผู้ส่ง หรืออีเมล..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableCaption>รายการคำขอส่งไฟล์</TableCaption>
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead className="w-[100px]">วันที่</TableHead>
              <TableHead>ชื่อเอกสาร</TableHead>
              <TableHead>ผู้ส่ง</TableHead>
              <TableHead>ผู้รับ</TableHead>
              <TableHead>สถานะ</TableHead>
              {showActions && <TableHead className="text-right">จัดการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {formatDate(request.created_at || request.createdAt || '')}
                  </TableCell>
                  <TableCell>{request.document_name || request.documentName}</TableCell>
                  <TableCell>{request.requesterName}</TableCell>
                  <TableCell>{request.receiver_email || request.receiverEmail}</TableCell>
                  <TableCell>
                    <RequestStatusBadge status={request.status} />
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(request.id)}
                        className="hover:bg-primary/10"
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showActions ? 6 : 5} className="text-center h-24 text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RequestTable;
