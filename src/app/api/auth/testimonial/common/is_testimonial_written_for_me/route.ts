import { NextResponse } from 'next/server';
import excuteQuery from '@/app/api/connect_m';

export async function GET(request: any) {
  
  try {    
  
    const {
      searchParams
    } = new URL(request.url);
    const from_user_id = searchParams.get('from_user_id');
    const yearbook_id = searchParams.get('yearbook_id');
    const to_user_id = searchParams.get('to_user_id');
    
    const arrData = await excuteQuery(`SELECT count(id) FROM testimonials WHERE testimonial_from = ? AND testimonial_to = ? AND yearbook_id = ? LIMIT 1`,[from_user_id,to_user_id,yearbook_id]);    
    if(arrData.q_res){
        // notification_type = JSON.parse(Notification.q_res[0].notification_type);
        // iContentId = JSON.parse(Notification.q_res[0].content_id);
    }    
    return NextResponse.json(arrData);
    
   
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Database error',
        details: error.message || 'Unknown error', 
      },
      { status: 500 }
    );
  }
}
