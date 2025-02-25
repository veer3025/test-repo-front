// Next Imports
import { NextResponse } from 'next/server';

import excuteQuery from '@/app/api/connect_m';

import { getToken } from 'next-auth/jwt';

export async function POST(req: any) {
  
  const token     = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
  const u_id:any  = token?.sub??0;
  
  var yb_info:any = [];
  
  try {
    
    const qry = `SELECT 
                  y.id, y.steps, y.institution_id, i.name inst_nm, y.batch_id, b.name btch_nm, y.template_id, 
                  p.name template_name, p.template_type, y.name y_nm, y.yearbook_year, 
                  DATE_FORMAT(y.yearbook_last_edit_date, '%Y-%m-%d') last_dt, y.logo    
                FROM
                  yearbook_user_trans t
                  INNER JOIN yearbooks y ON (t.yearbook_id = y.id)
                  INNER JOIN institutions i ON (y.institution_id = i.id)
                  INNER JOIN batch_masters b ON (y.batch_id = b.id)
                  LEFT JOIN templates p ON (y.template_id = p.id)  
                WHERE
                  t.user_id = ? AND y.removed = 'N' AND y.steps < 4  
                ORDER BY y.id LIMIT 1`;
    
    const val = [u_id];
    
    const res = await excuteQuery(qry, val);  

    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;

    if(res.q_res && row_cnt > 0) {

      yb_info = res.q_res;
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(yb_info);
}
