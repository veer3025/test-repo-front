// Next Imports
import { NextResponse } from "next/server";
import excuteQuery from "@/app/api/connect_m";

export async function POST(req:any) {
  
  var request_status = 0;
  var request_msg    = 'Something went wrong...!!';
  try {
    const req_data = await req.json();    
    const { sortedTestimonials , LoginUserId} = req_data;
    
    const  SortOrder =  await excuteQuery(
      `UPDATE testimonial_sortorders SET sort_order = ? WHERE user_id = ?`,
      [JSON.stringify(sortedTestimonials), LoginUserId]
    );
    if(SortOrder.q_res.affectedRows > 0){
      request_msg = "Testimonial order updated successfully!"; 
      request_status = 1;    
    }
    
  } catch (error) {
    request_msg = "Internal Server Error"; 
    console.error("Error deleting testimonial:", error); 
  }

  var res = { status : request_status, message : request_msg }  
  return NextResponse.json(res)
}
