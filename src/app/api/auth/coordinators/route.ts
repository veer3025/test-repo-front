// Next Imports
import { NextResponse } from 'next/server'
import excuteQuery from '@/app/api/connect_m'
import * as ROLE from "../../../../utils/constant";
import { getToken } from 'next-auth/jwt'

export async function POST(req: any) {

  const req_data = await req.json();
  let yearbook_id  = 25;
  let institution_id  = 22;
  let coordinator_data: any[] = [];
  try {
    
    const roleIds = [     
        ROLE.COLLEGE_COORDINATOR_ROLE_ID,
        ROLE.COLLEGE_ADMIN_COLLEGE_COORDINATOR_ROLE_ID,          
        ROLE.COLLEGE_COORDINATOR_STUDENT_ROLE_ID,
        ROLE.COLLEGE_COORDINATOR_COLLEGE_ADMIN_STUDENT_ROLE_ID,          
    ]
    const qry = `SELECT
                     CONCAT_WS(' ', TRIM(users.first_name), TRIM(users.last_name)) u_name,users.email
                FROM users
               # LEFT JOIN yearbook_user_trans ON yearbook_user_trans.user_id = users.id AND yearbook_user_trans.removed='N'
                #LEFT JOIN user_role_master ON users.role_id = user_role_master.id                
                #LEFT JOIN yearbooks ON yearbooks.id = yearbook_user_trans.yearbook_id AND yearbooks.removed='N'
                WHERE yearbook_id = ?  AND users.institution_id = ? AND role_id IN (${roleIds.join(', ')})`

    const val = [yearbook_id,institution_id]
    
    const res = await excuteQuery(qry, val)  
    
    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length

    if(res.q_res && row_cnt > 0) {
      coordinator_data = res.q_res;
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(coordinator_data)
}
