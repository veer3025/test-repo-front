// Next Imports
import { NextResponse } from "next/server";
import excuteQuery from "@/app/api/connect_m";
import { getUserAllDetails } from "@/libs/user/getUserAllDetails";

export async function POST(req: any) {
  
  var request_status = 0;
  var request_msg    = 'Something went wrong...!!';
  var notification_result,TestimonialReqResult = null;

  try {

    const req_data = await req.json();

    if (!req_data.request_to) {
      request_msg = "Missing request_to field";      
    }
    
    const loggedInUserDetail = await getUserAllDetails(req_data.request_from);
    if (!loggedInUserDetail) {
      request_msg = "User not found" ;
    }

    const conditions = [
      req_data.request_from,
      req_data.request_to,
      loggedInUserDetail.yearbook_id,
    ];

    const existingRequest = await excuteQuery(
        `SELECT id FROM testimonial_requests WHERE request_from = ? AND request_to = ? AND yearbook_id = ?`,
        conditions
    );

    if (existingRequest.q_res.length > 0) {      
        request_msg = "Request already sent!";      
    }
    else{

      // Insert new testimonial request
      const saveData = {
        request_from: req_data.request_from,
        yearbook_id: loggedInUserDetail.yearbook_id,
        request_to: req_data.request_to,
      };        
      
      TestimonialReqResult = await excuteQuery(
          `INSERT INTO testimonial_requests (request_from, yearbook_id, request_to , created) VALUES (?, ?, ? , NOW())`,
          Object.values(saveData)
      );
      const iTestRequestId = TestimonialReqResult.q_res.insertId;
      //
      
      // Fetch recipient details    
      const RequestRecipient = await excuteQuery(
        `SELECT first_name, last_name, email, unsubscribe,phone_number FROM users WHERE id = ? `,[saveData.request_to]
      );
      
      // Send notification and message if not unsubscribed    
      if (RequestRecipient.q_res.length > 0 && !RequestRecipient.q_res.unsubscribe) {
        const RequestTo =  RequestRecipient.q_res[0]
        const action = "testimonial_requested";
        const to = RequestTo.email;
        const receiver = `${RequestTo.first_name} ${RequestTo.last_name}`;
        const sender = `${loggedInUserDetail.first_name} ${loggedInUserDetail.last_name}`;
        const siteUrl = process.env.WEBSITE_URL || "https://example.com"; 
        const mobile   = RequestTo.phone_number;

        if (RequestTo.phone_number && loggedInUserDetail.send_testimonial_sms === "Y") {      
          const emailMessage = `Dear ${receiver}, ${sender} requested to share a testimonial about you. Log in to your YearbookCanvas account to share some of your thoughts.`;
            // $result = $this->send_message($mobile, $message);         
        }      
      }

      //Create Notification
      if (loggedInUserDetail && iTestRequestId) {
        const sender = `${loggedInUserDetail.first_name} ${loggedInUserDetail.last_name}`.trim();
      
        const arrNotificationSave = {
            yearbook_id: loggedInUserDetail.yearbook_id,
            from_user_id: loggedInUserDetail.user_id,
            to_user_id: saveData.request_to,
            content_id: iTestRequestId || null,
            notification_type: 'TR',
            status: 'P',
            message: `${sender} written a testimonial about you`
        };
        
        notification_result =  await excuteQuery(
          `INSERT INTO notifications (yearbook_id,from_user_id, to_user_id, content_id, notification_type, status, message,created) 
            VALUES (?, ?, ?, ?, ?, ?, ?,NOW())`,
          [
              arrNotificationSave.yearbook_id,
              arrNotificationSave.from_user_id,
              arrNotificationSave.to_user_id,
              arrNotificationSave.content_id,
              arrNotificationSave.notification_type,
              arrNotificationSave.status,
              arrNotificationSave.message
          ]
        );        

        if(!notification_result.q_res.insertId){
          request_msg = "Notification Not Create"; 
        }      
      }
    }
   
    if(notification_result?.q_res && TestimonialReqResult?.q_res){
      request_msg = "Request sent !"; 
      request_status = 1;
    }
    
  } catch (error) {
    request_msg = "Internal Server Error"; 
    console.error("Error deleting testimonial:", error);        
  }
  
  var res = { status : request_status, message : request_msg }  
  return NextResponse.json(res)
}

