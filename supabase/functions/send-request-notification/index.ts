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
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting email notification process");
    
    const { requestId, requestData }: NotificationRequest = await req.json();
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
    
    // Add requester email
    if (requestData.requester_email) {
      recipients.push(requestData.requester_email);
    }
    
    // Add receiver email
    if (requestData.receiver_email) {
      recipients.push(requestData.receiver_email);
    }
    
    // Add admin emails
    recipients.push(...adminEmails);

    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)];
    console.log("Unique recipients:", uniqueRecipients);

    if (uniqueRecipients.length === 0) {
      throw new Error("No recipients found for notification");
    }

    // Send email to all recipients
    const emailResponse = await resend.emails.send({
      from: "Document Request System <webmaster.stf@gmail.com>",
      to: uniqueRecipients,
      subject: `แจ้งเตือน: มีการสร้างคำขอเอกสารใหม่ - ${requestData.document_name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">🔔 แจ้งเตือนคำขอเอกสารใหม่</h1>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0;">รายละเอียดคำขอ</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ชื่อเอกสาร:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.document_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ผู้ขอ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.requester_name || requestData.requester_email || 'ไม่ระบุ'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ผู้รับ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_name || requestData.receiver_email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">อีเมล์ผู้รับ:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${requestData.receiver_email}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <p style="margin: 0; color: #0c4a6e;">
                <strong>📋 สถานะ:</strong> รอการอนุมัติ
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                เข้าสู่ระบบเพื่อดูรายละเอียดเพิ่มเติม
              </p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  อีเมล์นี้ส่งโดยระบบจัดการคำขอเอกสาร<br>
                  กรุณาอย่าตอบกลับอีเมล์นี้
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
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