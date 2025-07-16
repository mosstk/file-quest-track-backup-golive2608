import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Users, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportData {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  reworkRequests: number;
  completedRequests: number;
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentRequests: any[];
  userStats: any[];
  receiverStats?: {
    totalReceivers: number;
    uniqueCountries: number;
    uniqueCompanies: number;
  };
}

const ReportsPage = () => {
  console.log('ReportsPage component loaded');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ReportsPage mounted, fetching data...');
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch all requests directly from the table to get all fields
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          requester:profiles!requester_id(*)
        `)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        toast.error('ไม่สามารถโหลดข้อมูลคำขอได้');
        return;
      }

      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        return;
      }

      // Calculate statistics
      const totalRequests = requests?.length || 0;
      const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = requests?.filter(r => r.status === 'approved').length || 0;
      const rejectedRequests = requests?.filter(r => r.status === 'rejected').length || 0;
      const reworkRequests = requests?.filter(r => r.status === 'rework').length || 0;
      const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active).length || 0;
      const adminUsers = users?.filter(u => u.role === 'fa_admin').length || 0;

      // Get recent requests (last 10)
      const recentRequests = requests?.slice(0, 10) || [];

      // Calculate user statistics
      const userStats = users?.map(user => {
        const userRequests = requests?.filter(r => r.requester_id === user.id) || [];
        return {
          ...user,
          requestCount: userRequests.length,
          approvedCount: userRequests.filter(r => r.status === 'approved').length,
          pendingCount: userRequests.filter(r => r.status === 'pending').length,
        };
      }) || [];

      // Calculate receiver statistics
      const uniqueEmails = new Set(requests?.map(r => r.receiver_email.toLowerCase()) || []);
      const uniqueCountries = new Set(requests?.filter(r => r.country_name).map(r => r.country_name) || []);
      const uniqueCompanies = new Set(requests?.filter(r => r.receiver_company).map(r => r.receiver_company) || []);

      const receiverStats = {
        totalReceivers: uniqueEmails.size,
        uniqueCountries: uniqueCountries.size,
        uniqueCompanies: uniqueCompanies.size,
      };

      setReportData({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        reworkRequests,
        completedRequests,
        totalUsers,
        activeUsers,
        adminUsers,
        recentRequests,
        userStats,
        receiverStats,
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!reportData) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['ข้อมูลสรุประบบ', ''],
      ['จำนวนคำขอทั้งหมด', reportData.totalRequests],
      ['คำขอรอการอนุมัติ', reportData.pendingRequests],
      ['คำขอที่อนุมัติแล้ว', reportData.approvedRequests],
      ['คำขอที่ปฏิเสธ', reportData.rejectedRequests],
      ['คำขอที่ต้องแก้ไข', reportData.reworkRequests],
      ['คำขอที่รับเอกสารแล้ว', reportData.completedRequests],
      ['', ''],
      ['ข้อมูลผู้ใช้งาน', ''],
      ['จำนวนผู้ใช้ทั้งหมด', reportData.totalUsers],
      ['ผู้ใช้ที่ยังใช้งาน', reportData.activeUsers],
      ['ผู้ดูแลระบบ', reportData.adminUsers],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'สรุปข้อมูล');

    // Recent requests sheet
    const requestsData = [
      ['ID', 'ชื่อเอกสาร', 'ผู้ขอ', 'อีเมลผู้รับ', 'สถานะ', 'วันที่สร้าง', 'เลขพัสดุ']
    ];
    reportData.recentRequests.forEach(request => {
      requestsData.push([
        request.id,
        request.document_name,
        request.requester?.full_name || 'ไม่ระบุ',
        request.receiver_email,
        request.status,
        new Date(request.created_at).toLocaleDateString('th-TH'),
        request.tracking_number || 'ไม่มี'
      ]);
    });
    const requestsWs = XLSX.utils.aoa_to_sheet(requestsData);
    XLSX.utils.book_append_sheet(wb, requestsWs, 'คำขอล่าสุด');

    // User statistics sheet
    const userStatsData = [
      ['ชื่อผู้ใช้', 'อีเมล', 'บทบาท', 'บริษัท', 'แผนก', 'จำนวนคำขอ', 'อนุมัติแล้ว', 'รอการอนุมัติ', 'สถานะ']
    ];
    reportData.userStats.forEach(user => {
      userStatsData.push([
        user.full_name || 'ไม่ระบุ',
        user.email || user.username || 'ไม่ระบุ',
        user.role,
        user.company || 'ไม่ระบุ',
        user.department || 'ไม่ระบุ',
        user.requestCount,
        user.approvedCount,
        user.pendingCount,
        user.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'
      ]);
    });
    const userStatsWs = XLSX.utils.aoa_to_sheet(userStatsData);
    XLSX.utils.book_append_sheet(wb, userStatsWs, 'สถิติผู้ใช้');

    // Save file
    const fileName = `รายงานระบบ_${new Date().toLocaleDateString('th-TH')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('ดาวน์โหลดรายงานเรียบร้อย');
  };

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูลรายงาน...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin']}>
        <div className="container py-8">
          <div className="text-center text-gray-500">ไม่สามารถโหลดข้อมูลรายงานได้</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth allowedRoles={['fa_admin']}>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">รายงานประสิทธิภาพระบบ</h1>
            <p className="text-gray-600 mt-2">ภาพรวมการทำงานของระบบและข้อมูลผู้ใช้งาน</p>
          </div>
          <Button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลด Excel
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{reportData.totalRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอการอนุมัติ</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{reportData.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{reportData.approvedRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รับเอกสารแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{reportData.completedRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้งานทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{reportData.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สถานะคำขอ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  ปฏิเสธ
                </span>
                <Badge variant="secondary">{reportData.rejectedRequests}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  ต้องแก้ไข
                </span>
                <Badge variant="secondary">{reportData.reworkRequests}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลผู้ใช้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>ผู้ใช้ที่ใช้งาน</span>
                <Badge variant="secondary">{reportData.activeUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>ผู้ดูแลระบบ</span>
                <Badge variant="secondary">{reportData.adminUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>ผู้ใช้ทั่วไป</span>
                <Badge variant="secondary">{reportData.totalUsers - reportData.adminUsers}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">อัตราความสำเร็จ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>อัตราการอนุมัติ</span>
                <Badge variant="secondary">
                  {reportData.totalRequests > 0 
                    ? Math.round((reportData.approvedRequests / reportData.totalRequests) * 100) 
                    : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>อัตราการรับเอกสาร</span>
                <Badge variant="secondary">
                  {reportData.totalRequests > 0 
                    ? Math.round((reportData.completedRequests / reportData.totalRequests) * 100) 
                    : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receiver Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลผู้รับเอกสาร</CardTitle>
            <CardDescription>สถิติของผู้รับเอกสารในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reportData.receiverStats?.totalReceivers || 0}</div>
                <div className="text-sm text-gray-600">จำนวนผู้รับทั้งหมด</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reportData.receiverStats?.uniqueCountries || 0}</div>
                <div className="text-sm text-gray-600">จำนวนประเทศ</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{reportData.receiverStats?.uniqueCompanies || 0}</div>
                <div className="text-sm text-gray-600">จำนวนบริษัท</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>คำขอล่าสุด</CardTitle>
            <CardDescription>แสดง 10 คำขอล่าสุดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left">ชื่อเอกสาร</th>
                    <th className="border border-gray-200 p-3 text-left">ผู้ขอ</th>
                    <th className="border border-gray-200 p-3 text-left">อีเมลผู้รับ</th>
                    <th className="border border-gray-200 p-3 text-left">สถานะ</th>
                    <th className="border border-gray-200 p-3 text-left">วันที่สร้าง</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3">{request.document_name}</td>
                      <td className="border border-gray-200 p-3">{request.requester?.full_name || 'ไม่ระบุ'}</td>
                      <td className="border border-gray-200 p-3">{request.receiver_email}</td>
                      <td className="border border-gray-200 p-3">
                        <Badge
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'completed' ? 'default' :
                            'destructive'
                          }
                        >
                           {request.status === 'pending' ? 'รอการอนุมัติ' :
                            request.status === 'approved' ? 'อนุมัติแล้ว' :
                            request.status === 'completed' ? 'รับเอกสารแล้ว' :
                            request.status === 'rejected' ? 'ปฏิเสธ' :
                            request.status === 'rework' ? 'ต้องแก้ไข' : request.status}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3">
                        {new Date(request.created_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>สถิติผู้ใช้งาน</CardTitle>
            <CardDescription>ผู้ใช้ที่มีการใช้งานระบบมากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left">ชื่อผู้ใช้</th>
                    <th className="border border-gray-200 p-3 text-left">บทบาท</th>
                    <th className="border border-gray-200 p-3 text-left">บริษัท</th>
                    <th className="border border-gray-200 p-3 text-center">จำนวนคำขอ</th>
                    <th className="border border-gray-200 p-3 text-center">อนุมัติแล้ว</th>
                    <th className="border border-gray-200 p-3 text-center">รอการอนุมัติ</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.userStats
                    .filter(user => user.requestCount > 0)
                    .sort((a, b) => b.requestCount - a.requestCount)
                    .slice(0, 10)
                    .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3">{user.full_name || 'ไม่ระบุ'}</td>
                      <td className="border border-gray-200 p-3">
                        <Badge variant={user.role === 'fa_admin' ? 'default' : 'secondary'}>
                          {user.role === 'fa_admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3">{user.company || 'ไม่ระบุ'}</td>
                      <td className="border border-gray-200 p-3 text-center font-medium">{user.requestCount}</td>
                      <td className="border border-gray-200 p-3 text-center text-green-600">{user.approvedCount}</td>
                      <td className="border border-gray-200 p-3 text-center text-yellow-600">{user.pendingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage;