// Next Imports
import { NextResponse } from 'next/server';

import excuteQuery from '@/app/api/connect_m';

import { getToken } from 'next-auth/jwt';

export async function POST(req: any) {
  
  const token              = await getToken({req, secret: process.env.NEXTAUTH_SECRET})
  const email:any          = token?.email??'';
  const u_id:any           = token?.sub??0;  
  var yb_join_req_data:any = [];
  
  try {
    
    const qry = `SELECT 
                  c.id, c.profile_photo coord_profile_img,
                  CONCAT_WS(' ', TRIM(c.first_name), TRIM(c.last_name)) coord_name, c.email coord_email,
                  c.phone_number coord_contact_no, r.request_status, r.reject_reason   
                FROM
                  yearbook_join_request_trans r
                  INNER JOIN yearbook_user_trans t ON (r.yearbook_id = t.yearbook_id)
                  INNER JOIN users c ON (t.user_id = c.id)
                WHERE
                  r.user_id = ? AND t.user_type = 'C'
                GROUP BY c.id  
                ORDER BY r.id`;

    const val = [u_id];
    
    const res = await excuteQuery(qry, val);  

    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;

    if(res.q_res && row_cnt > 0) {

      yb_join_req_data = res.q_res;
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(yb_join_req_data);
}
