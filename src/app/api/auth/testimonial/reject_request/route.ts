// Next Imports
import { NextResponse } from "next/server";
import excuteQuery from "@/app/api/connect_m";

export async function POST(req: any) {
  
  var request_status = 0;
  var request_msg    = 'Something went wrong...!!';

  try {

    const req_data = await req.json();

    if (!req_data.request_to || !req_data.request_from || !req_data.yearbook_id) {
      return NextResponse.json({ status: 0, message: "Missing required fields" });
    }

    const conditions = [req_data.request_from, req_data.request_to, req_data.yearbook_id];

    const deleteResult = await excuteQuery(
      `DELETE FROM testimonial_requests WHERE request_from = ? AND request_to = ? AND yearbook_id = ?`,
      conditions
    );

    if (deleteResult.q_res.affectedRows > 0) {
      request_msg = "Request Rejected!";
      request_status = 1;
    } 

  } catch (error) {
    request_msg = "Internal Server Error"; 
    console.error("Error deleting testimonial:", error);        
  }
  
  var res = { status : request_status, message : request_msg }  
  return NextResponse.json(res)
}

