// Next Imports
import { NextResponse } from "next/server";
import excuteQuery from "@/app/api/connect_m";

export async function POST(req: any) {

  var request_status = 0;
  var request_msg    = 'Something went wrong...!!';

  try {
    const { testimonial_id ,testimonial_to, testimonial_from ,yearbook_id } = await req.json();
    
    // Validate required fields
    if (!testimonial_id || !testimonial_to || !testimonial_from || !yearbook_id) {
      request_msg = "Missing required fields";      
    }
   
    // Delete Testimonial
    const deleteTestimonialResult = await excuteQuery(`DELETE FROM testimonials WHERE id = ?`, [testimonial_id]);

    // Delete Notification related to the testimonial
    const deleteNotificationQuery = `DELETE FROM notifications WHERE content_id = ?`;
    await excuteQuery(deleteNotificationQuery, [testimonial_id]);    
    
    // Delete Testimonial Request
    const request_to = testimonial_from;
    const request_from = testimonial_to;
    
    const deleteTestimonialRequestQuery = `DELETE FROM testimonial_requests WHERE request_from = ? AND request_to = ? AND yearbook_id = ?`;
    await excuteQuery(deleteTestimonialRequestQuery, [request_from, request_to, yearbook_id]);

    // Find Testimonial Request ID
    const findTestimonialRequestQuery = `SELECT id FROM testimonial_requests WHERE request_from = ? AND request_to = ? AND yearbook_id = ?`;
    const arrTestimonialReq = await excuteQuery(findTestimonialRequestQuery, [request_from, request_to, yearbook_id]);

    if (arrTestimonialReq.q_res.length > 0) {
      const testimonialRequestId = arrTestimonialReq.q_res[0].id;

      // Delete Notification related to the Testimonial Request
      const deleteNotificationRequestQuery = `DELETE FROM notifications WHERE content_id = ?`;
      await excuteQuery(deleteNotificationRequestQuery, [testimonialRequestId]);
    }

    if (deleteTestimonialResult.q_res.affectedRows > 0) {      
        request_msg = "Testimonial deleted !"; 
        request_status = 1;
    } else {
      request_msg = "Testimonial not found or already removed";       
    }
  } catch (error) {
    request_msg = "Internal Server Error"; 
    console.error("Error deleting testimonial:", error);    
  }
  
  var res = { status : request_status, message : request_msg }
  
  return NextResponse.json(res)
}
