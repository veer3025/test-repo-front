// Next Imports
import { NextResponse } from "next/server";
import excuteQuery from "@/app/api/connect_m";
import { getUserAllDetails } from "@/libs/user/getUserAllDetails";


export async function POST(req: any) {
  
  var request_status = 0;
  var request_msg    = 'Something went wrong...!!';
  var notification_result,testimonial_result = null;
  try {

    const req_data = await req.json();
    const loggedInUserDetail = await getUserAllDetails(req_data.user_id);
    
    if (!loggedInUserDetail) {
        request_msg = "User not found" ;
    }

    const saveData = {
      institution_id: loggedInUserDetail.institution_id,
      yearbook_id: loggedInUserDetail.yearbook_id,
      testimonial_from: loggedInUserDetail.user_id,
      testimonial_to: req_data.testimonial_to || '',
      message: req_data.message || '',
    };

    let affectedTestimonialId = null;

    // Save Testimonial
    testimonial_result = await excuteQuery(
      `SELECT id FROM testimonials 
        WHERE testimonial_from = ? AND testimonial_to = ? AND yearbook_id = ?`,
      [saveData.testimonial_from, saveData.testimonial_to, saveData.yearbook_id]
    );
    
    if (testimonial_result.q_res.length > 0) {
      
        // Update existing testimonial
        const UpdatedResult = await excuteQuery(
            `UPDATE testimonials 
            SET message = ? , modified = NOW()
            WHERE id = ?`,
            [saveData.message, testimonial_result.q_res[0].id]
        );
        affectedTestimonialId = testimonial_result.q_res[0].id;
        
    } else {
        // Insert new testimonial
        const insertResult = await excuteQuery(
            `INSERT INTO testimonials (institution_id, yearbook_id, testimonial_from, testimonial_to, message , created , modified) 
            VALUES (?, ?, ?, ?, ? , NOW() , NOW())`,
            [saveData.institution_id, saveData.yearbook_id, saveData.testimonial_from, saveData.testimonial_to, saveData.message]
        );
        affectedTestimonialId = insertResult.q_res.insertId;        
    }
    // Save Testimonial
    
    // Fetch recipient details    
    const testimonialRecipient = await excuteQuery(
      `SELECT first_name, last_name, email, unsubscribe,phone_number FROM users WHERE id = ? `,[saveData.testimonial_to]
    );
    

    // Send notification and message if not unsubscribed    
    if (testimonialRecipient.q_res.length > 0 && !testimonialRecipient.q_res.unsubscribe) {
      const testimonialTo =  testimonialRecipient.q_res[0]
      const action = "testimonial_given";
      const to = testimonialTo.email;
      const receiver = `${testimonialTo.first_name} ${testimonialTo.last_name}`;
      const sender = `${loggedInUserDetail.first_name} ${loggedInUserDetail.last_name}`;
      const siteUrl = process.env.WEBSITE_URL || "https://example.com"; 
      
      if (testimonialTo.phone_number && loggedInUserDetail.send_testimonial_sms === "Y") {      
        const emailMessage = `Dear ${receiver},${sender} has shared a testimonial about you.Log in to your YearbookCanvas account to view it: ${siteUrl}`;        
          // $result = $this->send_message($mobile, $message);         
      }      
    }
    //

    // Update testimonial request status
    const testimonial_request_update = await excuteQuery(
      `UPDATE testimonial_requests 
       SET status = ? , modified = NOW()
       WHERE request_from = ? AND request_to = ?`,
      [1, saveData.testimonial_to, loggedInUserDetail.user_id]
    );
    //


    //Create Notification
    if (loggedInUserDetail && affectedTestimonialId) {
      const sender = `${loggedInUserDetail.first_name} ${loggedInUserDetail.last_name}`.trim();
    
      const arrNotificationSave = {
          yearbook_id: loggedInUserDetail.yearbook_id,
          from_user_id: loggedInUserDetail.user_id,
          to_user_id: saveData.testimonial_to,
          content_id: affectedTestimonialId || null,
          notification_type: 'TW',
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
    //

    //Update Testimonial Answer
    // const questionAnswers = testimonialData.Testimonial.Answer;

    // for (const [questionId, answer] of Object.entries(questionAnswers)) {
    //     if (!answer || (Array.isArray(answer) && answer.length === 0)) continue;

    //     const answerId = Array.isArray(answer) ? answer.join(',') : answer;

    //     const saveDataQues = {
    //         institution_id: loggedInUserDetail.institution_id,
    //         yearbook_id: loggedInUserDetail.yearbook_id,
    //         user_id: loggedInUserDetail.id,
    //         question_id: questionId,
    //         answer_id: answerId,
    //         testimonial_id: affectedTestimonialId
    //     };

    //     const conditions = [
    //         saveDataQues.institution_id,
    //         saveDataQues.yearbook_id,
    //         saveDataQues.user_id,
    //         saveDataQues.question_id,
    //         saveDataQues.testimonial_id
    //     ];

        
    //   // Check if the answer already exists
    //   const existingAnswer = await excuteQuery(
    //         `SELECT id FROM testimonial_answers 
    //           WHERE institution_id = ? AND yearbook_id = ? AND user_id = ? 
    //           AND question_id = ? AND testimonial_id = ?`,
    //         conditions
    //     );

    //     if (existingAnswer.q_res.length > 0) {
    //         // Update existing answer
    //         await excuteQuery(
    //             `UPDATE testimonial_answers SET answer_id = ? WHERE id = ?`,
    //             [saveDataQues.answer_id, existingAnswer.q_res[0].id]
    //         );
    //     } else {
    //         // Insert new answer
    //         await excuteQuery(
    //             `INSERT INTO testimonial_answers 
    //             (institution_id, yearbook_id, user_id, question_id, answer_id, testimonial_id) 
    //             VALUES (?, ?, ?, ?, ?, ?)`,
    //             Object.values(saveDataQues)
    //         );
    //     }          
    // }

    if(notification_result?.q_res && testimonial_result?.q_res){
      request_msg = "Testimonial Updated successfully"; 
      request_status = 1;
    }
    
  } catch (error) {
    request_msg = "Internal Server Error"; 
    console.error("Error deleting testimonial:", error);        
  }
  
  var res = { status : request_status, message : request_msg }
  
  return NextResponse.json(res)
}

