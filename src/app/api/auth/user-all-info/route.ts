// Next Imports
import { NextResponse } from 'next/server'

import excuteQuery from '@/app/api/connect_m'

import { getToken } from 'next-auth/jwt'

export async function POST(req: any) {

  const req_data = await req.json();
  
  const token       = await getToken({req, secret: process.env.NEXTAUTH_SECRET})
  let user_id:any   = token?.sub??'';  
  let yearbook_id = 25;
  var user_data:any = [];  
  

  if(user_id===''){
    user_id = req_data.user_id;
  }
  
  try {
    
    const qry = `SELECT
                    users.id as user_id,
                    users.*, 
                    yearbook_user_trans.*, 
                    yearbooks.*,
                    institutions.id AS institution_id
                FROM users
                LEFT JOIN user_role_master 
                    ON users.role_id = user_role_master.id
                LEFT JOIN yearbook_user_trans 
                    ON yearbook_user_trans.user_id = users.id 
                    AND yearbook_user_trans.yearbook_id = ? 
                    AND yearbook_user_trans.removed = 'N'
                LEFT JOIN yearbooks 
                    ON yearbooks.id = yearbook_user_trans.yearbook_id
                LEFT JOIN institutions 
                    ON institutions.id = yearbooks.institution_id                    
                LEFT JOIN templates 
                    ON templates.id = yearbooks.template_id
                WHERE users.id = ? 
                LIMIT 1;`

    const val = [yearbook_id,user_id]
    
    const res = await excuteQuery(qry, val)  
    
    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length

    if(res.q_res && row_cnt > 0) {
      user_data = res.q_res[0]
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(user_data)
}
