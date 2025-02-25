// Next Imports
import { NextResponse } from 'next/server';

import { format } from 'date-fns';

import excuteQuery from '@/app/api/connect_m';

const getExistingUserInfo = async (user_email:any = '', yb_id:any = 0) => {

  var user_id = 0;
  var ybtr_id = 0;
  var err_msg = '';

  try {
      
    var qry, val, res; 
      
    qry = `SELECT 
            u.id, IF(t.id IS NULL, 0, t.id) t_id 
          FROM 
            users u
            LEFT JOIN yearbook_user_trans t ON (u.id = t.user_id AND t.yearbook_id = '${yb_id}' AND t.removed = 'N')
          WHERE 
            u.email = ? 
          ORDER BY 
            u.id LIMIT 1`;

    val = [user_email];
    res = await excuteQuery(qry, val);
    
    if(res.q_err) {

      user_id = -1;
      err_msg = res.q_err;  
    }
    else {
      
      const rec_cnt    = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;
        
      if(rec_cnt??0) {
  
        user_id = res.q_res[0]?.id;
        ybtr_id = res.q_res[0]?.t_id;
      }
    }
  }
  catch(err:any) {

    user_id = -1;
    err_msg = err?.message;  
  }

  return { user_id : user_id, ybtr_id : ybtr_id, err_msg : err_msg };
}; 

export async function POST(req: any) {

  const form_data = await req.json();
  
  var res_status         = 0;
  var res_msg            = 'Form Data not found...!!';
  var imported_users:any = [];
  var already_exists:any = [];
  var import_failed:any  = [];

  if(form_data) {

    if(form_data?.year_book_id == 0) {

      res_msg = 'Year Book Id not found...!!';
    }
    else if(!(form_data?.xls_col_map??0)) {

      res_msg = 'Excel Sheet Columns not selected...!!';
    }
    else if(form_data?.user_xls_data && (form_data?.user_xls_data?.length??0)) {

      const {col_nm, col_em, col_mo, col_wn, col_gn} = form_data?.xls_col_map;

      res_msg = 'Excel Sheet Columns have invalid column no...!!';

      if(col_nm != '' && col_em != '' && col_mo != '' && col_wn != '' && col_gn != '') {

        const ybk_id = form_data?.year_book_id;
        const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        
        const process_data = form_data.user_xls_data.map(async (data_row:any, idx:any) => {

        if(idx > 0) {
    
            let u_nm = (data_row[col_nm]??'')?.toString()?.trim();
            let u_em = (data_row[col_em]??'')?.toString()?.trim();
            let u_mb = data_row[col_mo];
            let u_wn = data_row[col_wn];
            let u_gn = (data_row[col_gn]??'')?.toString()?.trim();

            const rw = { u_nm : u_nm, u_em : u_em, u_mb : u_mb, u_wn : u_wn, u_gn : u_gn }

            if(u_nm == '')
            {
              import_failed.push({...rw, fail_reason : 'Name Field is empty'});
            }
            else if(u_em == '') {

              import_failed.push({...rw, fail_reason : 'Email Field is empty'});
            }
            else if(!/\S+@\S+\.\S+/.test(u_em)) {

              import_failed.push({...rw, fail_reason : 'Invalid Email Id'});
            }
            else if(u_mb != '' && isNaN(u_mb)) {

              import_failed.push({...rw, fail_reason : 'Mobile No. is not in numeric format'});
            }
            else if(u_wn != '' && isNaN(u_wn)) {

              import_failed.push({...rw, fail_reason : 'WhatsApp No. is not in numeric format'});
            }
            else if(u_gn == '') {

              import_failed.push({...rw, fail_reason : 'Valid Gender Field values are M, F and O only'});
            }
            else {

              const { user_id, ybtr_id, err_msg } = await getExistingUserInfo(u_em, ybk_id);

              if(user_id == -1) { //if there is an error
                
                res_msg = err_msg;
  
                return false;
              }
              else if(user_id??0) { //if user already exists in users table
  
                if(ybtr_id??0) { //if user already exists in current yearbook
  
                  already_exists.push({...rw});
                }
                else { //if user does not exist in current yearbook
  
                  var qry_t = `INSERT INTO 
                                  yearbook_user_trans
                                SET 
                                  user_id = ?, user_type = ?, yearbook_id = ?, is_default = ?, role_id = ?, level = ?, 
                                  testimonial_write_level = ?, can_receive_testimonials = ?, show_profile_questions = ?, 
                                  show_polls = ?, show_testimonials = ?, show_image_gallery = ?, 
                                  show_profile_to_my_friends = ?, show_testimonial_to_my_friends = ?, created = ?, 
                                  modified = ?`;
                  
                  var val_t = [user_id, 'S', ybk_id, '0', '3', '1', '1', '1', 'Y', 'Y', 'Y', 'Y', 'N', 'N', str_dt, str_dt];
                  var res_t = await excuteQuery(qry_t, val_t);
                  
                  if(res_t.q_err) {
  
                    res_msg = res_t.q_err;
  
                    return false; 
                  }
                  else {
                    
                    imported_users.push({...rw});
                  }
                }
              }
              else { //if user does not exist i.e. new user
                
                var qry_u = `INSERT INTO
                              users
                            SET 
                              first_name = ?, username = ? , email = ?, phone_number = ?, gender = ?, whatsup_number = ?, 
                              password = SHA('123456'), is_verified = ?, created = ?, modified = ?`;
  
                var val_u = [u_nm, u_em, u_em, u_mb, u_gn, u_wn, '0', str_dt, str_dt];
                  
                var res_u = await excuteQuery(qry_u, val_u);
                  
                if(res_u.q_err) {
  
                  res_msg = res_u.q_err;
  
                  return false;
                }
                else {
  
                  const new_user_id = res_u?.q_res?.insertId??0;
  
                  if(new_user_id??0) {
  
                    var qry_t = `INSERT INTO 
                                  yearbook_user_trans
                                SET 
                                  user_id = ?, user_type = ?, yearbook_id = ?, is_default = ?, role_id = ?, level = ?, 
                                  testimonial_write_level = ?, can_receive_testimonials = ?, show_profile_questions = ?, 
                                  show_polls = ?, show_testimonials = ?, show_image_gallery = ?, 
                                  show_profile_to_my_friends = ?, show_testimonial_to_my_friends = ?, created = ?, 
                                  modified = ?`;
                  
                    var val_t = [new_user_id, 'S', ybk_id, '1', '3', '1', '1', '1', 'Y', 'Y', 'Y', 'Y', 'N', 'N', str_dt, 
                                str_dt];
                    var res_t = await excuteQuery(qry_t, val_t);
  
                    if(res_t.q_err) {
  
                      res_msg = res_t.q_err;
                      
                      return false; 
                    }
                    else {
                      
                      imported_users.push({...rw});
                    }
                  }
                  else {
  
                    res_msg = 'Due to some error user could not be imported. Import process halted...!!';
                    
                    return false;
                  }
                }
              }
            }
          }  
        });
  
        await Promise.all(process_data);

        const imp_usrs:any = imported_users?.length??0;
        const alr_usrs:any = already_exists?.length??0;
        const imp_fled:any = import_failed?.length??0;
        var arr_msg:any    = [];

        if(alr_usrs > 0) {

          arr_msg.push(`${alr_usrs} Users are already existed`);
        }
        
        if(imp_fled > 0) {

          arr_msg.push(`${imp_fled} Entries failed`);  
        }

        if(imp_usrs == 0) {
          
          arr_msg.push('No users have been imported...!!');
        }
        else {
          
          res_status = 1;
          
          arr_msg.push(`${imp_usrs} users have been imported sucessfully!!`);
        }

        res_msg = arr_msg.join(', ');
      }
    }
  } 

  var obj_res = { status : res_status, message : res_msg, imported_users : imported_users, 
                  already_exists : already_exists, import_failed : import_failed };
  
  return NextResponse.json(obj_res);
}
