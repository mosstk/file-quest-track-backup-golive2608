import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  requestData: {
    document_name: string;
    receiver_email: string;
    receiver_name?: string;
    requester_name?: string;
    requester_email?: string;
    receiver_company?: string;
    receiver_department?: string;
    receiver_phone?: string;
    country_name?: string;
    document_count?: number;
    shipping_vendor?: string;
  };
  action?: 'create' | 'update';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting email notification process");
    
    const { requestId, requestData, action = 'create' }: NotificationRequest = await req.json();
    console.log("Request data:", { requestId, requestData });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get admin emails
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'fa_admin')
      .eq('is_active', true);

    if (adminError) {
      console.error("Error fetching admins:", adminError);
    }

    const adminEmails = admins?.map(admin => admin.email).filter(email => {
      // กรองเฉพาะอีเมล์ที่ถูกต้อง
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email && emailRegex.test(email);
    }) || [];
    console.log("Valid admin emails:", adminEmails);

    // Prepare email recipients
    const recipients = [];
    
    // Add requester email (Admin, Requester)
    if (requestData.requester_email) {
      recipients.push(requestData.requester_email);
    }
    
    // Add admin emails
    recipients.push(...adminEmails);
    
    // For new requests, don't include receiver
    // For updates, don't include receiver

    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)];
    console.log("Unique recipients:", uniqueRecipients);

    if (uniqueRecipients.length === 0) {
      throw new Error("No recipients found for notification");
    }

    // Plain text version of the email
    const emailText = `
แจ้งเตือน: ${action === 'update' ? 'มีการแก้ไขคำขอเอกสาร' : 'มีการสร้างคำขอเอกสารใหม่'} - ${requestData.document_name}

รายละเอียดคำขอ:
- ชื่อเอกสาร: ${requestData.document_name}
- จำนวนเอกสาร: ${requestData.document_count || 1} ชุด
- ผู้ขอ: ${requestData.requester_name || requestData.requester_email || 'ไม่ระบุ'}
${requestData.requester_email ? `- อีเมล์ผู้ขอ: ${requestData.requester_email}` : ''}

ข้อมูลผู้รับ:
- ชื่อผู้รับ: ${requestData.receiver_name || 'ไม่ระบุ'}
- อีเมล์ผู้รับ: ${requestData.receiver_email}
${requestData.receiver_company ? `- บริษัท: ${requestData.receiver_company}` : ''}
${requestData.receiver_department ? `- แผนก: ${requestData.receiver_department}` : ''}
${requestData.receiver_phone ? `- เบอร์โทรศัพท์: ${requestData.receiver_phone}` : ''}
${requestData.country_name ? `- ประเทศ: ${requestData.country_name}` : ''}
${requestData.shipping_vendor ? `- ขนส่ง: ${requestData.shipping_vendor}` : ''}

สถานะ: รอการอนุมัติ
เข้าสู่ระบบเพื่อดูรายละเอียดเพิ่มเติมและติดตามสถานะ

เข้าสู่ระบบ: https://file-tracking.sales-datacenter.com

อีเมล์นี้ส่งโดยระบบจัดการคำขอเอกสาร File Tracking System
หากมีคำถามกรุณาติดต่อทีมสนับสนุน | Request ID: ${requestId.substring(0, 8)}...
    `.trim();

    // Send email to all recipients
    const emailResponse = await resend.emails.send({
      from: "Document Request System <support@file-tracking.sales-datacenter.com>",
      to: uniqueRecipients,
      subject: `แจ้งเตือน: ${action === 'update' ? 'มีการแก้ไขคำขอเอกสาร' : 'มีการสร้างคำขอเอกสารใหม่'} - ${requestData.document_name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">${action === 'update' ? '📝 แจ้งเตือนการแก้ไขคำขอเอกสาร' : '🔔 แจ้งเตือนคำขอเอกสารใหม่'}</h1>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0;">รายละเอียดคำขอ</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ชื่อเอกสาร:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.document_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">จำนวนเอกสาร:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.document_count || 1} ชุด</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ผู้ขอ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.requester_name || requestData.requester_email || 'ไม่ระบุ'}</td>
                </tr>
                ${requestData.requester_email ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">อีเมล์ผู้ขอ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.requester_email}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">ข้อมูลผู้รับ</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ชื่อผู้รับ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_name || 'ไม่ระบุ'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">อีเมล์ผู้รับ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_email}</td>
                </tr>
                ${requestData.receiver_company ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">บริษัท:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_company}</td>
                </tr>
                ` : ''}
                ${requestData.receiver_department ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">แผนก:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_department}</td>
                </tr>
                ` : ''}
                ${requestData.receiver_phone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">เบอร์โทรศัพท์:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_phone}</td>
                </tr>
                ` : ''}
                ${requestData.country_name ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ประเทศ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.country_name}</td>
                </tr>
                ` : ''}
                ${requestData.shipping_vendor ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ขนส่ง:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.shipping_vendor}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 20px;">
              <p style="margin: 0; color: #0c4a6e;">
                <strong>📋 สถานะ:</strong> รอการอนุมัติ
              </p>
              <p style="margin: 10px 0 0 0; color: #0c4a6e; font-size: 14px;">
                เข้าสู่ระบบเพื่อดูรายละเอียดเพิ่มเติมและติดตามสถานะ
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://file-tracking.sales-datacenter.com" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 15px;">
                🔗 เข้าสู่ระบบ File Tracking
              </a>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
                คลิกปุ่มด้านบนเพื่อเข้าสู่ระบบและติดตามสถานะคำขอของคุณ
              </p>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  อีเมล์นี้ส่งโดยระบบจัดการคำขอเอกสาร File Tracking System<br>
                  กรุณาอย่าตอบกลับอีเมล์นี้ | Request ID: ${requestId.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      text: emailText,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification emails sent successfully",
        recipients: uniqueRecipients.length 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-request-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);