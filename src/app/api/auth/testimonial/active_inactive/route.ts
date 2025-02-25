// Next Imports
import { NextResponse } from "next/server";
import excuteQuery from "@/app/api/connect_m";

export async function POST(request: any) {

  var request_status = 0;
  var request_msg    = 'Something went wrong...!!';

  try {
    const req_data = await request.json();
    const testimonial_id = req_data.testimonial_id;

    if (!testimonial_id) {
      request_msg = "Missing required fields";      
    }
  
    const qry = `UPDATE testimonials SET is_active = CASE WHEN is_active = 'Y' THEN 'N' ELSE 'Y' END WHERE id = ?`;
    const result = await excuteQuery(qry, [testimonial_id]);

    if (result.q_res.affectedRows > 0) {      
        request_msg = "Testimonial Updated !"; 
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
