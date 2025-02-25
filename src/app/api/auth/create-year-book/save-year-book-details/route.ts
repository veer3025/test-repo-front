// Next Imports
import { NextResponse } from 'next/server';

import { format } from 'date-fns';

import excuteQuery from '@/app/api/connect_m';

import path from 'path';

import fs from 'fs';

import { writeFile } from 'fs/promises';

import { fileTypeFromBuffer } from 'file-type';

const img_path = process.env.UPLOAD_YEARBOOK_IMG_PATH;

const getYbInstituteId = async (inst_nm:any = '') => {
  
  var inst_id = 0;

  try {
    
    var qry, val, res; 
    
    qry = `SELECT id FROM institutions WHERE name = ? AND removed = 'N' ORDER BY id LIMIT 1`;
    val = [inst_nm];
    res = await excuteQuery(qry, val);

    if(res.q_err) {
      
    }
    else {

      const rec_cnt    = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;
      
      if(rec_cnt??0) {

        inst_id = res.q_res[0]?.id;

        if(!inst_id) {

          qry         = `INSERT INTO institutions SET name = ?`;
          let res_new = await excuteQuery(qry, val);

          if(res_new.q_err) {
      
          }
          else {

            inst_id = res_new?.q_res?.insertId??0;
          }
        }
      }
    }
  }
  catch(err:any) {
    
  }
  
  return inst_id;
};

const getYbBatchId = async (btch_nm:any = '') => {

  var btch_id = 0;

  try {
    
    var qry, val, res; 
    
    qry = `SELECT id FROM batch_masters WHERE name = ? AND removed = 'N' ORDER BY id LIMIT 1`;
    val = [btch_nm];
    res = await excuteQuery(qry, val);

    if(res.q_err) {
      
    }
    else {

      const rec_cnt    = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;
      
      if(rec_cnt??0) {

        btch_id = res.q_res[0]?.id;

        if(!btch_id) {

          qry         = `INSERT INTO batch_masters SET name = ?`;
          let res_new = await excuteQuery(qry, val);

          if(res_new.q_err) {
      
          }
          else {
            
            btch_id = res_new?.q_res?.insertId??0;
          }
        }
      }
    }
  }
  catch(err:any) {
    
  }
  
  return btch_id;
};

const uploadLogo = async (yb_id:any = 0, logo_file:any = null, logo_old:any = '') => {

  var res_status     = 0;
  var res_msg        = 'Year Book Id not found OR Logo File does not exist...!!';

  if(yb_id && logo_file) {

    const img_id   = format(new Date(), 'yyyyMMddHHmmss');
    
    try {
      
      if(logo_old??0) {
        
        const logo_img_nm = logo_old?.split(/[\/]/)?.slice(-1)[0];

        if(logo_img_nm??0) {

          const logo_img_path = path.join(process.cwd(), `${img_path}/${logo_img_nm}`);

          if(fs.existsSync(logo_img_path)) {

            fs.unlinkSync(logo_img_path);
          }
        }
      }
      
      const buffer:any = Buffer.from(await logo_file.arrayBuffer());
      const fileType   = await fileTypeFromBuffer(buffer);
      const img_name   = `${yb_id}_${img_id}.${fileType?.ext?.toLowerCase()}`;
      const logo_path  = `${process.env.YEARBOOK_IMG_URL}/${img_name}`;
      
      await writeFile(path.join(process.cwd(), `${img_path}/${img_name}`), buffer);
      
      const qry = `UPDATE yearbooks SET logo = ? WHERE id = ?`;
      const val = [logo_path, yb_id];
      const res = await excuteQuery(qry, val);
      
      if(res.q_err) {
          
        res_msg = res.q_err;
      }
      else {

        res_msg   = 'Year Book Logo Uploaded successfully...!!';  
        res_status = 1;
      }
    }
    catch(err:any) {
  
      res_msg = err.message; 
    }
  }

  return { res_status : res_status, res_msg : res_msg };
};

export async function POST(req: any) {

  const form_data = await req.formData();
  
  var res_status     = 0;
  var res_msg        = 'Something went wrong...!!';
  var year_book_id   = 0;

  try {

    res_msg = 'Form Data not found...!!';

    if(form_data) {
      var user_id        = (form_data.get('user_id')??0) as number;
      year_book_id       = (form_data.get('year_book_id')??0) as number;
      var steps          = (form_data.get('steps')??0) as number;
      var institution_id = form_data.get('institution_id')??0; 
      var institution    = (form_data.get('institution')??'') as string;
      var yb_name        = (form_data.get('yb_name')??'') as string;
      var yb_logo_old    = (form_data.get('yb_logo_old')??'') as string;
      var yb_logo        = (form_data.get('yb_logo')??'') as string;
      var yb_logo_file   = form_data.get('yb_logo_file');
      var yb_batch_id    = form_data.get('yb_batch_id')??0;
      var yb_batch       = (form_data.get('yb_batch')??'') as string;
      var yb_year        = form_data.get('yb_year')??0;
      var last_date      = (form_data.get('last_date')??'') as string;

      var is_err = 0;
      
      if(user_id == 0) {
        
        is_err = 1;
        res_msg = 'Logged In User Id not found...!!';
      }
      else if(steps == 0) {
        
        is_err = 1;
        res_msg = 'Invalid Step Number...!!';
      }
      else if(institution_id == 0 && institution?.trim() == '') {

        is_err = 1;
        res_msg = 'Select/Enter Institution...!!';
      }
      else if(yb_name?.trim() == '') {

        is_err = 1;
        res_msg = 'Enter Year Book Name...!!';
      }
      else if(yb_batch_id == 0 && yb_batch?.trim() == '') {

        is_err = 1;
        res_msg = 'Select/Enter Batch...!!';
      }
      else if(yb_year == 0) {

        is_err = 1;
        res_msg = 'Enter Year...!!';
      }
      else if(last_date?.trim() == '') {

        is_err = 1;
        res_msg = 'Enter Last Date of Completion...!!';
      }

      if(is_err === 0) {

        var inst_id = institution_id;
        var btch_id = yb_batch_id; 
  
        if(institution_id == 0) {
  
          inst_id = await getYbInstituteId(institution);
        }
  
        if(yb_batch_id == 0) {
  
          btch_id = await getYbBatchId(yb_batch);
        }
        
        const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        last_date    = `${last_date} 23:59:59`;

        var ycd, qry, val, res;
  
        if(year_book_id == 0) {
          
          qry = `INSERT INTO
                  yearbooks
                SET 
                  steps = ?, institution_id = ?, name = ?, batch_id = ?, template_id = ?, 
                  yearbook_year = ?, yearbook_last_edit_date = ?, created = ?, modified = ?`;
  
          val = [steps, inst_id, yb_name, btch_id, '0', yb_year, last_date, str_dt, str_dt];
          
          res = await excuteQuery(qry, val);
          
          if(res.q_err) {
          
            res_msg = res.q_err;
          }
          else {
  
            year_book_id = res?.q_res?.insertId??0;
  
            if(year_book_id) {
              
              const qry_t  = `INSERT INTO 
                                yearbook_user_trans 
                              SET 
                                user_id = ?, user_type = ?, yearbook_id = ?, is_default = ?, created = ?, modified = ?`;
              
              const val_t  = [user_id, 'C', year_book_id, '1', str_dt, str_dt];
              
              const res_t  = await excuteQuery(qry_t, val_t);

              if(res_t.q_err) {
          
                res_msg = res_t.q_err;
              }
              else {
                
                res_msg      = `Year Book details saved successfully!!`;  
                res_status   = 1;
              }
            }
            else {
  
              res_msg = `Due to some technical error, Year Book Record could not be saved...!!`;
            }
          }
        }
        else {
  
          qry = `UPDATE
                  yearbooks
                SET 
                  institution_id = ?, name = ?, batch_id = ?, yearbook_year = ?, yearbook_last_edit_date = ?, modified = ?
                WHERE 
                  id = ?`;
          
          val = [inst_id, yb_name, btch_id, yb_year, last_date, str_dt, year_book_id];
          
          res = await excuteQuery(qry, val);
          
          if(res.q_err) {
          
            res_msg = res.q_err;
          }
          else {
  
            res_msg    = `Year Book details updated successfully!!`;  
            res_status = 1;
          }
        }
  
        if(yb_logo.trim() != '' && yb_logo_file && year_book_id) {
  
          const obj_img_status  = await uploadLogo(year_book_id, yb_logo_file, yb_logo_old);
        }
      }
    }
  } catch ( error:any ) {

    res_msg = error.message;
  }
  
  var obj_res = { status : res_status, message : res_msg, year_book_id : year_book_id };
  
  return NextResponse.json(obj_res);
}
