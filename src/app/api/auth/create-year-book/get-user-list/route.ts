// Next Imports
import { NextResponse } from 'next/server';

import excuteQuery from '@/app/api/connect_m';

export async function POST(req: any) {
  
  var form_data = await req.json();

  var yb_users:any = [];
  
  try {
    
    const qry = `SELECT 
                  u.id, t.user_type, TRIM(CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name))) u_nm, u.email, 
                  u.phone_number, u.whatsup_number, u.gender       
                FROM
                  yearbook_user_trans t
                  INNER JOIN users u ON (t.user_id = u.id)
                WHERE
                  t.yearbook_id = ? AND t.removed = 'N'  
                ORDER BY 
                  CAST(t.user_type AS CHAR), u.first_name, u.last_name`;

    const val = [form_data?.year_book_id??0];
    
    const res = await excuteQuery(qry, val);  

    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;

    if(res.q_res && row_cnt > 0) {

      yb_users = res.q_res;
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(yb_users);
}