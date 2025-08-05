import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectionNotificationRequest {
  requestId: string;
  requestData: {
    document_name: string;
    requester_name?: string;
    requester_email?: string;
    admin_feedback: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting rejection notification process");
    
    const { requestId, requestData }: RejectionNotificationRequest = await req.json();
    console.log("Rejection data:", { requestId, requestData });

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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email && emailRegex.test(email);
    }) || [];

    // Prepare email recipients: Admin, Requester
    const recipients = [];
    
    if (requestData.requester_email) {
      recipients.push(requestData.requester_email);
    }
    
    recipients.push(...adminEmails);

    const uniqueRecipients = [...new Set(recipients)];
    console.log("Rejection notification recipients:", uniqueRecipients);

    if (uniqueRecipients.length === 0) {
      throw new Error("No recipients found for rejection notification");
    }

    // Email content
    const emailText = `
แจ้งเตือน: คำขอเอกสารถูกปฏิเสธ - ${requestData.document_name}

รายละเอียด:
- ชื่อเอกสาร: ${requestData.document_name}
- ผู้ขอ: ${requestData.requester_name || requestData.requester_email || 'ไม่ระบุ'}

เหตุผลในการปฏิเสธ:
${requestData.admin_feedback}

สถานะ: ปฏิเสธ
เข้าสู่ระบบเพื่อดูรายละเอียด

เข้าสู่ระบบ: https://file-tracking.sales-datacenter.com

Request ID: ${requestId.substring(0, 8)}...
    `.trim();

    const emailResponse = await resend.emails.send({
      from: "Document Tracking <support@file-tracking.sales-datacenter.com>",
      to: uniqueRecipients,
      subject: `❌ คำขอเอกสารถูกปฏิเสธ - ${requestData.document_name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626; margin-bottom: 20px; text-align: center;">❌ คำขอเอกสารถูกปฏิเสธ</h1>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
              <h2 style="color: #991b1b; margin-top: 0;">รายละเอียดคำขอ</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ชื่อเอกสาร:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.document_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ผู้ขอ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.requester_name || requestData.requester_email || 'ไม่ระบุ'}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">เหตุผลในการปฏิเสธ:</h3>
              <p style="color: #7c2d12; margin: 0; white-space: pre-wrap;">${requestData.admin_feedback}</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 20px;">
              <p style="margin: 0; color: #0c4a6e;">
                <strong>🚫 สถานะ:</strong> ปฏิเสธ
              </p>
              <p style="margin: 10px 0 0 0; color: #0c4a6e; font-size: 14px;">
                เข้าสู่ระบบเพื่อดูรายละเอียด
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://file-tracking.sales-datacenter.com" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 15px;">
                🔗 เข้าสู่ระบบ File Tracking
              </a>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
                คลิกปุ่มด้านบนเพื่อเข้าสู่ระบบและดูรายละเอียด
              </p>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  อีเมล์นี้ส่งโดยระบบจัดการคำขอเอกสาร Document Tracking<br>
                  กรุณาอย่าตอบกลับอีเมล์นี้ | Request ID: ${requestId.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      text: emailText,
    });

    console.log("Rejection email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Rejection notification emails sent successfully",
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
    console.error("Error in send-rejection-notification function:", error);
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