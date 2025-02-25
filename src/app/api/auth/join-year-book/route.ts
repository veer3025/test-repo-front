// Next Imports
import { NextResponse } from 'next/server'

import { format } from 'date-fns'

import excuteQuery from '@/app/api/connect_m'

const getYearBookIdByCode = async (yb_code:any = '') => {
  
  var yb_id = 0;
    
  try {
    
    var qry, val, res 
    
    qry = `SELECT id FROM yearbooks WHERE yearbook_code = ? AND removed = 'N' ORDER BY id LIMIT 1`
    val = [yb_code]
    res = await excuteQuery(qry, val)

    if(res.q_err) {
      
    }
    else {

      const rec_cnt    = (isNaN(res.q_res.length)) ? 0 : res.q_res.length
      
      if(rec_cnt??0) {

        yb_id = res.q_res[0]?.id;
      }
    }
  }
  catch(err:any) {
    
  }
  
  return yb_id;  
}

export async function POST(req: Request) {

  const { user_id, yb_code } = await req.json();
  
  var res_status   = 0;
  var res_msg      = 'Something went wrong...!!';
  var year_book_id = 0;

  try {
      
    var is_err = 0;
    
    if(!user_id) {

      is_err = 1
      res_msg = 'User Id not found...!!'
    }
    else {

      if(yb_code?.trim() == '') {

        is_err = 1
        res_msg = 'Kindly Enter Year Book Code...!!'
      }
      else {

        year_book_id = await getYearBookIdByCode(yb_code);

        if(!year_book_id) {
          
          is_err = 1
          res_msg = 'Invalid Year Book Code, Code does not Exist, Kindly Enter a Valid Year Book Code...!!'
        }
      }
    }

    if(is_err === 0) {

      const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      const qry = `INSERT INTO
                    yearbook_join_request_trans
                  SET 
                    yearbook_id = ?, user_id = ?, request_status = ?, created = ?, modified = ?`;
  
      const val = [year_book_id, user_id, 'P', str_dt, str_dt];
      
      const res = await excuteQuery(qry, val);
  
      if(res.q_err) {
        
        res_msg = res.q_err;
      }
      else {

        res_msg    = `Thanking You for your interest in joining this Year Book, You will be notified as soon as 
                      the Co-Ordinator of the Year Book responds regarding your joining request!!`;  
        res_status = 1;
      }
    }
  } catch ( error:any ) {

    res_msg = error.message;
  }
  
  var res = { status : res_status, message : res_msg };
  
  return NextResponse.json(res);
}