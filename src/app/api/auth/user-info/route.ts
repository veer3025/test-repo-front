// Next Imports
import { NextResponse } from 'next/server'

import excuteQuery from '@/app/api/connect_m'

import { getToken } from 'next-auth/jwt'

export async function POST(req: any) {
  
  const token       = await getToken({req, secret: process.env.NEXTAUTH_SECRET})
  const u_id:any    = token?.sub??0;  
  var user_data:any = [];
  
  try {
    
    const qry = `SELECT 
                  u.id, CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) u_name, TRIM(u.profile_photo) profile_pic, 
                  u.first_name, u.last_name, u.user_type, TRIM(u.username) login_id, u.email, 
                  u.phone_number, u.whatsup_number, u.gender, cu.id cu_id, cu.nicename country_name, st.id st_id,
                  st.name state_name, ct.id ct_id, ct.name city_name, u.zip_code, u.address, u.status, u.is_verified,
                  '' role, '0' role_id, (SELECT COUNT(yearbook_user_trans.id) FROM yearbook_user_trans 
                  INNER JOIN yearbooks ON (yearbook_user_trans.yearbook_id = yearbooks.id)
                  WHERE yearbook_user_trans.user_id = u.id AND yearbooks.steps = '4' AND yearbooks.removed = 'N' AND
                  yearbook_user_trans.removed = 'N') yb_cnt, 
                  (SELECT CONCAT_WS('<::>', yearbook_join_request_trans.request_status, 
                    yearbook_join_request_trans.reject_reason) FROM yearbook_join_request_trans WHERE 
                    yearbook_join_request_trans.user_id = u.id ORDER BY yearbook_join_request_trans.id LIMIT 1) join_req_info   
                FROM
                  users u
                  LEFT JOIN cities ct          ON (u.city_id = ct.id)
                  LEFT JOIN states st          ON (ct.state_id = st.id)
                  LEFT JOIN countries cu       ON (st.country_id = cu.id)
                WHERE
                  u.id = ?
                GROUP BY 
                  u.id`

    const val = [u_id]

    const res = await excuteQuery(qry, val)  

    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length

    if(res.q_res && row_cnt > 0) {

      user_data = res.q_res
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(user_data)
}
