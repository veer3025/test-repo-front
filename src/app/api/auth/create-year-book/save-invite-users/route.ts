// Next Imports
import { NextResponse } from 'next/server';

import { format } from 'date-fns';

import excuteQuery from '@/app/api/connect_m';

export async function POST(req: any) {

  const form_data = await req.formData();
  
  var res_status     = 0;
  var res_msg        = 'Something went wrong...!!';
  
  try {

    res_msg = 'Form Data not found...!!';

    if(form_data) {

      var user_id      = (form_data.get('user_id')??0) as number;
      var year_book_id = (form_data.get('year_book_id')??0) as number;
      var steps        = (form_data.get('steps')??0) as number;

      var is_err = 0;
      
      if(user_id == 0) {
        
        is_err = 1;
        res_msg = 'Logged In User Id not found...!!';
      }
      else if(year_book_id == 0) {

        is_err = 1;
        res_msg = 'Year Book Id not found...!!';
      }
      else if(steps == 0) {

        is_err = 1;
        res_msg = 'Invalid Step Number...!!';
      }

      if(is_err === 0) {
        
        const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        
        var ycd, qry, val, res;
        
        qry = `UPDATE yearbooks SET steps = ?, modified = ? WHERE id = ?`;
        
        val = [steps, str_dt, year_book_id];
        
        res = await excuteQuery(qry, val);
          
        if(res.q_err) {
        
          res_msg = res.q_err;
        }
        else {

          res_msg    = `Template for Year Book selected and saved successfully!!`;  
          res_status = 1;
        }
      }
    }
  } catch ( error:any ) {

    res_msg = error.message;
  }
  
  var obj_res = { status : res_status, message : res_msg };
  
  return NextResponse.json(obj_res);
}