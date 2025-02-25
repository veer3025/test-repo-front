// Next Imports
import { NextResponse } from 'next/server'

import { format } from 'date-fns'

import excuteQuery from '@/app/api/connect_m'

const isDuplicateRecord = async (u_id:any = 0, fld_name:any = 'email', fld_val:any = '') => {
  
  var rec_cnt = 0, res_status = 0, res_msg = ''
  
  try {
    
    var qry, val, res 

    var usr_id    = u_id??0
    var fld_nm    = fld_name?.trim() == '' ? 'email' : fld_name?.trim() 
    var fld_vl    = fld_val?.trim() == '' ? '' : fld_val?.trim()

    qry = `SELECT id FROM users WHERE id != ? AND ${fld_nm} = ? LIMIT 1`
    val = [usr_id, fld_vl]
    res = await excuteQuery(qry, val)

    if(res.q_err) {

      res_msg = res.q_err
    }
    else {

      rec_cnt    = (isNaN(res.q_res.length)) ? 0 : res.q_res.length
      res_status = 1
    }
  }
  catch(err:any) {

    res_msg = err?.message
  }
  
  return {res_status : res_status, res_msg : res_msg, rec_cnt : rec_cnt}  
}

export async function POST(req: Request) {

  const { full_name, email_id, usr_psw } = await req.json()
  
  var res_status = 0
  var res_msg    = 'Something went wrong...!!'

  try {
      
    var is_dup         = 0
    var dup_err        = 0

    const dup_eml = await isDuplicateRecord(0, 'email', email_id)

    if(dup_eml?.res_status == 0) {

      dup_err = 1
      res_msg = dup_eml?.res_msg
    }
    else {

      if(dup_eml?.rec_cnt) {

        is_dup = 1
        res_msg = 'User already registered with this Email Address, Please enter a different Email Address...!!'
      }
    }

    if(dup_err == 0 && is_dup == 0) {

      const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss')

      const qry = `INSERT INTO
                    users
                  SET 
                    first_name = ?, last_name = '', username = ?, gender = 'M', email = ?, password = SHA(${usr_psw}),
                    tmp_password = ?, phone_number = '', whatsup_number = '', city_id = 0, address = '', zip_code = '', 
                    is_verified = '1', status = '1', user_type = 'S', role_id = '3', created = ?, modified = ?`
  
      const val = [full_name, email_id, email_id, usr_psw, str_dt, str_dt]
      
      const res = await excuteQuery(qry, val)
  
      if(res.q_err) {
        
        res_msg = res.q_err
      }
      else {

        res_msg    = 'Your User account has been registered successfully!!'  
        res_status = 1
      }
    }
  } catch ( error:any ) {

    res_msg = error.message
  }
  
  var res = { status : res_status, message : res_msg }
  
  return NextResponse.json(res)
}
